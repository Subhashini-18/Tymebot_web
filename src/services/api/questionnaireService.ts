import { apiService } from './apiservice';
import { getAuthData } from '../../utils/auth';
import { FileUploadService } from './fileUploadService';

// Types for API responses
export interface Question {
    questionId: number;
    displayOrder: number;
    questionText: string;
    questionTypeId: number;
    questionInstanceId: number; // This will be used as vendorAssessmentQuestionId
    questionWfStatusId: number;
    questionnaireGroupId: number;
}

export interface VendorPendingQuestionsResponse {
    data: {
        status: string;
        questions: Question[];
        submissionId: number;
        thirdPartyVendorId: number;
    };
    isSuccess: boolean;
    status: number;
}

export interface FileUpload {
    fileName: string;
    filePath: string; // Changed from fileUrl to filePath
    fileType: string;
    extracts?: Array<{
        extractText: string;
        extractType: string;
    }>;
}

export interface QuestionnaireSubmissionPayload {
    vendorAssessmentQuestionId?: number; // Optional if submissionId & questionId given
    submissionId?: number; // Required if no vendorAssessmentQuestionId
    questionId?: number; // Required if no vendorAssessmentQuestionId
    actorUserId: number; // User submitting
    responseValue: string; // Actual answer
    responseComment?: string; // Optional comment
    questionInstanceId?: number; // Optional question instance ID
    files?: FileUpload[]; // Optional array of files
}

export interface QuestionnaireSubmissionResponse {
    data: any;
    isSuccess: boolean;
    status: number;
}

// Question type mapping
export const QUESTION_TYPES = {
    1: 'yes_no',
    2: 'text',
    3: 'textarea',
    4: 'file',
    5: 'multiple_choice',
    // Add more types as needed
} as const;

export class QuestionnaireService {
    private static readonly BASE_URL = 'http://192.168.1.44:8082';
    private static readonly API_PATH = import.meta.env.VITE_API_PATH;

    /**
     * Fetch pending questions for a vendor
     */
    static async getVendorPendingQuestions(): Promise<VendorPendingQuestionsResponse> {
        const authData = getAuthData();

        if (!authData?.vendorId) {
            throw new Error('Vendor ID not found in auth data');
        }

        const url = `${this.API_PATH}/get_vendor_pending_questions`;

        try {
            const response = await apiService.request<VendorPendingQuestionsResponse>({
                method: 'GET',
                url,
                params: { id: authData.vendorId },
                port: import.meta.env.VITE_BASE_PORT || '443'
            });

            return response;
        } catch (error) {
            console.error('Error fetching vendor pending questions:', error);
            throw error;
        }
    }

    /**
     * Submit questionnaire response
     */
    static async submitQuestionnaireResponse(
        payload: QuestionnaireSubmissionPayload
    ): Promise<QuestionnaireSubmissionResponse> {
        const url = `${this.API_PATH}submit_questionnaire_response`;

        try {
            const response = await apiService.request<QuestionnaireSubmissionResponse>({
                method: 'POST',
                url,
                data: payload,
                port: import.meta.env.VITE_BASE_PORT || '8082'
            });

            return response;
        } catch (error) {
            console.error('Error submitting questionnaire response:', error);
            throw error;
        }
    }

    /**
     * Upload file for questionnaire response
     */
    static async uploadFile(file: File): Promise<{ filePath: string; fileName: string }> {
        return FileUploadService.uploadFile(file);
    }

    /**
     * Get question type from questionTypeId
     */
    static getQuestionType(questionTypeId: number): string {
        return QUESTION_TYPES[questionTypeId as keyof typeof QUESTION_TYPES] || 'text';
    }

    /**
     * Check if question is yes/no type
     */
    static isYesNoQuestion(questionTypeId: number): boolean {
        return this.getQuestionType(questionTypeId) === 'yes_no';
    }
}