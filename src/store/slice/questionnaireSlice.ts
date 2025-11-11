import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    QuestionnaireService,
    Question,
    VendorPendingQuestionsResponse,
    QuestionnaireSubmissionPayload,
    QuestionnaireSubmissionResponse
} from '../../services/api/questionnaireService';

export interface PendingSubmission {
    payload: QuestionnaireSubmissionPayload;
    actualFiles: File[];
}

export interface QuestionnaireState {
    questions: Question[];
    submissionId: number | null;
    thirdPartyVendorId: number | null;
    loading: boolean;
    error: string | null;
    submittingQuestions: number[]; // Array of questionInstanceIds being submitted
    submittedQuestions: number[]; // Array of questionInstanceIds that have been submitted
    showSubmitConfirmation: boolean;
    pendingSubmissions: PendingSubmission[]; // Queue of submissions waiting for confirmation
}

const initialState: QuestionnaireState = {
    questions: [],
    submissionId: null,
    thirdPartyVendorId: null,
    loading: false,
    error: null,
    submittingQuestions: [],
    submittedQuestions: [],
    showSubmitConfirmation: false,
    pendingSubmissions: [],
};

// Async thunk to fetch vendor pending questions
export const fetchVendorPendingQuestions = createAsyncThunk(
    'questionnaire/fetchVendorPendingQuestions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await QuestionnaireService.getVendorPendingQuestions();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch questions');
        }
    }
);

// Async thunk to submit questionnaire response
export const submitQuestionnaireResponse = createAsyncThunk(
    'questionnaire/submitQuestionnaireResponse',
    async (payload: QuestionnaireSubmissionPayload, { rejectWithValue }) => {
        try {
            console.log('Redux slice - Submitting questionnaire response:', JSON.stringify(payload, null, 2));
            const response = await QuestionnaireService.submitQuestionnaireResponse(payload);
            console.log('Redux slice - Submission response:', response);
            return { response, payload };
        } catch (error: any) {
            console.error('Redux slice - Submission error:', error);
            return rejectWithValue({
                error: error.message || 'Failed to submit response',
                questionInstanceId: payload.questionInstanceId
            });
        }
    }
);

// Async thunk to upload file
export const uploadFile = createAsyncThunk(
    'questionnaire/uploadFile',
    async (file: File, { rejectWithValue }) => {
        try {
            console.log('Uploading file... slice', file.name);
            const response = await QuestionnaireService.uploadFile(file);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to upload file');
        }
    }
);

const questionnaireSlice = createSlice({
    name: 'questionnaire',
    initialState,
    reducers: {
        // Clear all questionnaire data
        clearQuestionnaire(state) {
            return initialState;
        },

        // Add question to submitting queue
        addSubmittingQuestion(state, action: PayloadAction<number>) {
            if (!state.submittingQuestions.includes(action.payload)) {
                state.submittingQuestions.push(action.payload);
            }
        },

        // Remove question from submitting queue
        removeSubmittingQuestion(state, action: PayloadAction<number>) {
            state.submittingQuestions = state.submittingQuestions.filter(
                id => id !== action.payload
            );
        },

        // Add question to submitted list
        addSubmittedQuestion(state, action: PayloadAction<number>) {
            if (!state.submittedQuestions.includes(action.payload)) {
                state.submittedQuestions.push(action.payload);
            }
        },

        // Show submit confirmation dialog
        showSubmitConfirmation(state, action: PayloadAction<PendingSubmission[]>) {
            state.showSubmitConfirmation = true;
            state.pendingSubmissions = action.payload;
        },

        // Hide submit confirmation dialog
        hideSubmitConfirmation(state) {
            state.showSubmitConfirmation = false;
            state.pendingSubmissions = [];
        },

        // Clear error
        clearError(state) {
            state.error = null;
        },

        // Set error
        setError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch vendor pending questions
            .addCase(fetchVendorPendingQuestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorPendingQuestions.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.isSuccess && action.payload.data) {
                    state.questions = action.payload.data.questions;
                    state.submissionId = action.payload.data.submissionId;
                    state.thirdPartyVendorId = action.payload.data.thirdPartyVendorId;
                } else {
                    state.error = 'Failed to load questions';
                }
            })
            .addCase(fetchVendorPendingQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Submit questionnaire response
            .addCase(submitQuestionnaireResponse.pending, (state, action) => {
                const questionInstanceId = action.meta.arg.questionInstanceId;
                if (!state.submittingQuestions.includes(questionInstanceId)) {
                    state.submittingQuestions.push(questionInstanceId);
                }
            })
            .addCase(submitQuestionnaireResponse.fulfilled, (state, action) => {
                const questionInstanceId = action.payload.payload.questionInstanceId;

                // Remove from submitting queue
                state.submittingQuestions = state.submittingQuestions.filter(
                    id => id !== questionInstanceId
                );

                // Add to submitted list
                if (!state.submittedQuestions.includes(questionInstanceId)) {
                    state.submittedQuestions.push(questionInstanceId);
                }
            })
            .addCase(submitQuestionnaireResponse.rejected, (state, action) => {
                const payload = action.payload as { error: string; questionInstanceId: number };

                // Remove from submitting queue
                state.submittingQuestions = state.submittingQuestions.filter(
                    id => id !== payload.questionInstanceId
                );

                state.error = payload.error;
            })

            // Upload file
            .addCase(uploadFile.pending, (state) => {
                // Could add file upload loading state here if needed
            })
            .addCase(uploadFile.fulfilled, (state, action) => {
                // File upload successful
            })
            .addCase(uploadFile.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const {
    clearQuestionnaire,
    addSubmittingQuestion,
    removeSubmittingQuestion,
    addSubmittedQuestion,
    showSubmitConfirmation,
    hideSubmitConfirmation,
    clearError,
    setError
} = questionnaireSlice.actions;

export default questionnaireSlice.reducer;