// File: apiService.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

/* =========================
 *  Error Classes
 * =======================*/
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code: string = "API_ERROR",
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}
export class NetworkError extends APIError {
  constructor(message = "Network error") {
    super(0, message, "NETWORK_ERROR");
  }
}
export class TimeoutError extends APIError {
  constructor(message = "Request timed out") {
    super(408, message, "TIMEOUT_ERROR");
  }
}
export class ValidationError extends APIError {
  constructor(message: string, data?: any) {
    super(400, message, "VALIDATION_ERROR", data);
  }
}
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}
export class RateLimitError extends APIError {
  constructor(retryAfter?: number) {
    super(429, "Rate limit exceeded", "RATE_LIMIT", { retryAfter });
  }
}

/* =========================
 *  Circuit Breaker (Simple)
 * =======================*/
class SimpleCircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(private threshold: number, private timeout: number) {}

  async execute<T>(command: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailure >= this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Service temporarily unavailable (circuit breaker)");
      }
    }
    try {
      const result = await command();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }
  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) this.state = "OPEN";
  }
}

/* =========================
 *  Config Types
 * =======================*/
interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  statusCodesToRetry: number[];
}
interface CircuitBreakerConfig {
  errorThreshold: number;
  resetTimeout: number;
  enabled?: boolean;
  timeout?: number;
  errorThresholdPercentage?: number;
}
interface EndpointConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requiresAuth?: boolean;
}
interface ApiServiceConfig {
  baseUrl: string;
  defaultPort?: string;
  timeout?: number;
  isLive?: boolean;
  endpoints?: Record<string, EndpointConfig | Record<string, EndpointConfig>>;
  retryConfig: RetryConfig;
  circuitBreaker: CircuitBreakerConfig & {
    enabled?: boolean;
    errorThresholdPercentage?: number;
  };
}
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  data?: any;
  params?: any;
  port?: string;
  headers?: Record<string, any>;
  mockResponse?: any;
  skipAuth?: boolean; // handled by interceptor (not sent as header)
  _retry?: boolean;
  _retryCount?: number;
}

/* =========================
 *  ApiService
 * =======================*/
export class ApiService {
  private static instances: Record<string, ApiService> = {};
  private axiosInstance: AxiosInstance;
  private circuitBreakers = new Map<string, SimpleCircuitBreaker>();
  private endpoints: ApiServiceConfig["endpoints"];
  private authToken: string | null = null; // in-memory token for quick access

  private constructor(private config: ApiServiceConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 10000,
      headers: { "Content-Type": "application/json" },
    });
    this.endpoints = config.endpoints;
    this.setupInterceptors();
  }

  /** Singleton per baseUrl */
  static getInstance(config?: Partial<ApiServiceConfig>): ApiService {
    const baseUrl = config?.baseUrl || "default";
    if (!ApiService.instances[baseUrl]) {
      ApiService.instances[baseUrl] = new ApiService({
        baseUrl: config?.baseUrl || "",
        retryConfig: config?.retryConfig || {
          maxRetries: 1,
          delayMs: 300,
          statusCodesToRetry: [500, 502, 503, 504],
        },
        circuitBreaker: config?.circuitBreaker || {
          errorThreshold: 3,
          resetTimeout: 5000,
        },
        timeout: config?.timeout,
        defaultPort: config?.defaultPort,
        isLive: config?.isLive,
      } as ApiServiceConfig);
    }
    return ApiService.instances[baseUrl];
  }

  /* ===== Token helpers ===== */
  public setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      this.axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      // mirror in sessionStorage for debugging/fallback
      sessionStorage.setItem("token", JSON.stringify(token));
    } else {
      delete this.axiosInstance.defaults.headers.common["Authorization"];
      sessionStorage.removeItem("token");
    }
  }
  public clearAuthToken() {
    this.setAuthToken(null);
  }
  public getAuthToken(): string | null {
    if (this.authToken) return this.authToken;
    // fallback: localStorage.authData.accessToken
    try {
      const stored = localStorage.getItem("authData");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.accessToken) return parsed.accessToken as string;
      }
    } catch {}
    // fallback: sessionStorage.token (legacy)
    try {
      const t = sessionStorage.getItem("token");
      if (t) return JSON.parse(t);
    } catch {}
    return null;
  }

  /* ===== Interceptors ===== */
  private setupInterceptors() {
    // Request
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const cfg = config as InternalAxiosRequestConfig & {
          skipAuth?: boolean;
        };

        if (!cfg.skipAuth) {
          // use memory token first
          let token = this.authToken;

          if (!token) {
            try {
              const stored = localStorage.getItem("authData");
              if (stored) {
                const parsed = JSON.parse(stored);
                token = parsed?.accessToken;
              }
            } catch {}
          }

          if (token) {
            cfg.headers = {
              ...(cfg.headers || {}),
              Authorization: `Bearer ${token}`,
            } as any;
          }
        }

        return cfg;
      },
      (error) => Promise.reject(error)
    );

    // Response
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = (error.config || {}) as RequestOptions;
        if (error.response?.status === 401 && !original._retry) {
          return this.handleTokenRefresh(original);
        }
        const shouldRetry =
          this.config.retryConfig.statusCodesToRetry.includes(
            error.response?.status || 0
          ) && (original._retryCount || 0) < this.config.retryConfig.maxRetries;

        if (shouldRetry) {
          original._retryCount = (original._retryCount || 0) + 1;
          await new Promise((r) =>
            setTimeout(r, this.config.retryConfig.delayMs)
          );
          return this.axiosInstance.request(original as any);
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getCircuitBreaker(url: string) {
    if (!this.circuitBreakers.has(url)) {
      this.circuitBreakers.set(
        url,
        new SimpleCircuitBreaker(
          this.config.circuitBreaker.errorThreshold,
          this.config.circuitBreaker.resetTimeout
        )
      );
    }
    return this.circuitBreakers.get(url)!;
  }

  private async handleTokenRefresh(config: RequestOptions) {
    config._retry = true;
    this.clearAuthToken();
    sessionStorage.removeItem("token");
    window.location.href = "/login";
    return Promise.reject(new UnauthorizedError());
  }

  private classifyError(error: AxiosError): APIError {
    if (!error.response) {
      if ((error as any)?.code === "ECONNABORTED") return new TimeoutError();
      return new NetworkError();
    }
    const { status, data }: any = error.response;
    const message = data?.message || error.message;
    switch (status) {
      case 400:
        return new ValidationError(message, data);
      case 401:
        return new UnauthorizedError();
      case 429: {
        const ra = (error.response.headers as any)?.["retry-after"];
        return new RateLimitError(ra ? parseInt(ra) : undefined);
      }
      default:
        return new APIError(status, message, "API_ERROR", data);
    }
  }

  private handleError(error: AxiosError): APIError {
    const err = this.classifyError(error);
    this.logError(err);
    return err;
  }

  private logError(error: APIError) {
    let lastRequestInfo: any = {};
    try {
      const lastReq: AxiosRequestConfig | undefined = (error as any)?.config;
      if (lastReq) {
        lastRequestInfo = {
          url: lastReq.baseURL
            ? `${lastReq.baseURL}${lastReq.url}`
            : lastReq.url,
          method: lastReq.method,
        };
      }
    } catch {}
    const log: any = {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      data: error.data,
      stack: error.stack,
      time: new Date().toISOString(),
      userContext: {
        userId: sessionStorage.getItem("userId"),
        env: import.meta.env.MODE,
      },
      ...lastRequestInfo,
    };
    if (typeof log.url === "string" && log.url.match(/:\d+.*:\d+/)) {
      log.message += " (Possible malformed URL: double port in URL)";
    }
    console.error("[API ERROR]", log);
  }

  /* ===== Base URL Builder with Port ===== */
  private buildBaseURLWithPort(port?: string) {
    const defaultBase =
      this.config.baseUrl ||
      (import.meta.env.VITE_DEFAULT_API_BASE_URL ?? "http://localhost");
    if (!port) return defaultBase;
    try {
      const u = new URL(defaultBase);
      const final = `${u.protocol}//${u.hostname}:${port}${
        u.pathname || ""
      }`.replace(/\/+$/, "");
      return final;
    } catch {
      return defaultBase.replace(/:\d+$/, "") + `:${port}`;
    }
  }

  /* ===== Core Request ===== */
  async request<T>(options: RequestOptions): Promise<T> {
    const breaker = this.getCircuitBreaker(options.url);
    if (!this.config.isLive && options.mockResponse)
      return options.mockResponse;

    const baseURL = this.buildBaseURLWithPort(
      options.port || this.config.defaultPort
    );

    return breaker.execute(async () => {
      const cfg: AxiosRequestConfig = { ...options, baseURL };
      (cfg as any).skipAuth = options.skipAuth === true;
      const res = await this.axiosInstance.request(cfg);
      return res.data;
    });
  }

  /* ===== Convenience Methods ===== */
  get<T>(url: string, params?: any, port?: number) {
    return this.request<T>({
      method: "GET",
      url,
      params,
      port: port?.toString(),
    });
  }
  post<T>(url: string, data?: any, port?: number) {
    return this.request<T>({
      method: "POST",
      url,
      data,
      port: port?.toString(),
    });
  }
  put<T>(url: string, data?: any, port?: number) {
    return this.request<T>({
      method: "PUT",
      url,
      data,
      port: port?.toString(),
    });
  }
  patch<T>(url: string, data?: any, port?: number) {
    return this.request<T>({
      method: "PATCH",
      url,
      data,
      port: port?.toString(),
    });
  }
  delete<T>(url: string, port?: number) {
    return this.request<T>({ method: "DELETE", url, port: port?.toString() });
  }

  /** Call an endpoint by key from config */
  async callEndpoint<T = any>(
    endpointKey: string,
    options?: Partial<RequestOptions> & { subKey?: string }
  ): Promise<T> {
    let endpoint: EndpointConfig | undefined;
    if (this.endpoints) {
      const ep = this.endpoints[endpointKey];
      if (ep && "path" in (ep as any)) {
        endpoint = ep as EndpointConfig;
      } else if (ep && options?.subKey && (ep as any)[options.subKey]) {
        endpoint = (ep as any)[options.subKey] as EndpointConfig;
      }
    }
    if (!endpoint)
      throw new Error(`Endpoint config for "${endpointKey}" not found`);

    return this.request<T>({
      method: endpoint.method,
      url: endpoint.path,
      ...options,
      headers: { ...(options?.headers || {}) },
      skipAuth: endpoint.requiresAuth === false ? true : options?.skipAuth,
    });
  }
}

/* =========================
 *  Instance & Helpers
 * =======================*/
const DEFAULT_API_BASE_URL = import.meta.env.VITE_DEFAULT_API_BASE_URL;
const DEFAULT_PORT = import.meta.env.VITE_BASE_PORT || "8081";

export const apiConfig: ApiServiceConfig = {
  baseUrl: DEFAULT_API_BASE_URL,
  defaultPort: DEFAULT_PORT,
  isLive: import.meta.env.PROD || false,
  timeout: 100000,
  endpoints: {
    auth: { path: "/auth", method: "POST", requiresAuth: false },
    users: { path: "/users", method: "GET", requiresAuth: true },
  },
  circuitBreaker: {
    enabled: true,
    timeout: 10000,
    errorThreshold: 3,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  },
  retryConfig: {
    maxRetries: 3,
    delayMs: 1000,
    statusCodesToRetry: [408, 500, 502, 503, 504],
  },
};

export const apiService = ApiService.getInstance(apiConfig);

// Simple helpers
export const setAuthToken = (token: string | null) =>
  apiService.setAuthToken(token);
export const clearAuthToken = () => apiService.clearAuthToken();
export const getAuthToken = () => apiService.getAuthToken();
