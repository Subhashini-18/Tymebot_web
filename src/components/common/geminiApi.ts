// Common Gemini API utility for optimized, centralized key management

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyC7tE5yvrc1_oxsBeVPe_gfzIC54sVb7Fs';

export function getGeminiAI() {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    return { genAI, model };
}
