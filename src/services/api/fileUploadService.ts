import { apiService } from './apiservice';

export interface FileUploadResponse {
    filePath: string; // Changed from fileUrl to filePath
    fileName: string;
}

interface FileUploadApiResponse {
    status: string;
    results: Array<{
        fileName: string;
        status: string;
        fileUrl: string;
    }>;
}

export class FileUploadService {
    /**
     * Upload file to media server
     */
    static async uploadFile(file: File): Promise<FileUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiService.request<FileUploadApiResponse>({
                method: 'POST',
                url: `${import.meta.env.VITE_MEDIA_API_PATH}file_upload`,
                data: formData,
                port: import.meta.env.VITE_MEDIA_PORT || '8084',
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('File upload API response:', response);

            // Extract file info from the results array
            if (response.status === 'success' && response.results && response.results.length > 0) {
                const fileResult = response.results[0];
                console.log('File upload API filePath:', fileResult.fileUrl);
                console.log('File upload API fileName:', fileResult.fileName);

                return {
                    filePath: fileResult.fileUrl, // Use fileUrl as filePath
                    fileName: fileResult.fileName
                };
            } else {
                throw new Error('Upload failed: No file result returned');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Validate file type for images
     */
    static validateImageFile(file: File): { isValid: boolean; error?: string } {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
            };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'File size must be less than 5MB'
            };
        }

        return { isValid: true };
    }

    /**
     * Create file preview URL
     */
    static createPreviewUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}