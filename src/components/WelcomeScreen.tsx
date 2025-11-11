import React, { useEffect, useState } from "react";
import { Shield, Lock, Zap, Server, Globe } from "lucide-react";
import { useFormContext } from "../context/FormContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api/apiservice";
// import G3SecLogo from '../assets/G3_sec-ai_logo.png'; // Adjust the path if needed

// Define your SUB_PATH and SUBSCRIBER_PORT as needed
const SUB_PATH = "/products"; // For dummyjson.com, this is the endpoint path
// const SUBSCRIBER_PORT = '0000'; // Not needed for dummyjson.com, but keep for pattern

export default function WelcomeScreen() {
  const { goToNextStep } = useFormContext();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setApiError(null);

    // Example usage as requested:
    apiService
      .get<{ products: any[] }>(`${SUB_PATH}`, null)
      .then((res) => setProducts(res.products || []))
      .catch(() => setApiError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591]">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative isolate px-6 pt-14 lg:px-8 space-y-8">
        <div className="mx-auto max-w-6xl py-16 sm:py-24 space-y-8">
          {/* Logo Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-white justify-center rounded-2xl mb-10 h-66"
          >
            <img
              src="/src/assets/images/Frame 121.png"
              alt="G3 SEC.AI Logo"
              className="w-full h-36 size-10 object-none drop-shadow-lg"
              draggable={false}
            />
            {/* <h1 className="text-4xl font-bold text-white ml-4 tracking-tight">
              g3 <span className="text-blue-400">sec.ai</span>green-900
            </h1> */}
          </motion.div>

          {/* Main Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold tracking-tight text-white sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Third Party Risk
              <br />
              <span className="text-[#00487A]">Intelligence Platform</span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-white max-w-2xl mx-auto">
              Harness the power of AI to transform your vendor risk management.
              Automated assessments, real-time monitoring, and intelligent
              insights in one unified platform.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Lock,
                title: "Smart Security",
                desc: "AI-powered risk detection",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                desc: "Multi-jurisdiction support",
              },
              {
                icon: Zap,
                title: "Real-time Alerts",
                desc: "Continuous monitoring",
              },
              {
                icon: Server,
                title: "Deep Analytics",
                desc: "Advanced risk insights",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-[#00487A] group-hover:text-blue-700 transition-colors" />
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-md text-[#00487A]">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Button - Removed since login handles navigation */}

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 text-center text-white text-sm tracking-wide"
          >
            TRUSTED BY LEADING ENTERPRISES • ISO 27001 CERTIFIED • SOC 2
            COMPLIANT
          </motion.p>
          {/* --- Product Cards Section --- */}
          {/* <div className="mt-12 px-2 md:px-0">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Sample Products (API Demo)</h3>
            {loading && (
              <div className="text-center text-blue-200 py-8">Loading products...</div>
            )}
            {apiError && (
              <div className="text-center text-red-400 py-8">{apiError}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/10 rounded-xl shadow-lg p-5 flex flex-col items-center hover:bg-white/20 transition-all"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-28 h-28 object-cover rounded-lg mb-3 border border-white/20"
                  />
                  <h4 className="text-lg font-semibold text-white mb-1 text-center">{product.title}</h4>
                  <p className="text-blue-200 text-sm mb-2 text-center line-clamp-2">{product.description}</p>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-1">
                    ${product.price}
                  </span>
                  <span className="text-xs text-blue-100">Brand: {product.brand}</span>
                </div>
              ))}
            </div>
          </div> */}
          {/* ...existing code... */}
        </div>
      </div>
    </div>
  );
}
