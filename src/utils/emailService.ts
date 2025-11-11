// Email service for sending notifications and welcome emails

export interface EmailData {
    to: string;
    subject: string;
    body: string;
    attachments?: FileAttachment[];
}

export interface FileAttachment {
    filename: string;
    content: string;
    contentType: string;
}

export interface WelcomeEmailData {
    name: string;
    email: string;
    password: string;
    role: string;
    organizationName: string;
    department?: string;
    customMessage?: string;
}

export class EmailService {
    private static baseUrl = 'https://api.g3sec.ai/v1'; // Mock API endpoint

    static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const emailTemplate = this.getWelcomeEmailTemplate(data);

            // In a real implementation, this would make an actual API call
            const response = await this.mockSendEmail({
                to: data.email,
                subject: emailTemplate.subject,
                body: emailTemplate.body,
                attachments: this.generateAttachments(data)
            });

            console.log('Email sent successfully:', {
                to: data.email,
                subject: emailTemplate.subject,
                timestamp: new Date().toISOString()
            });

            return response;
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            throw error;
        }
    }

    static getWelcomeEmailTemplate(data: WelcomeEmailData) {
        const loginUrl = `${window.location.origin}/login`;

        const subject = `Welcome to G3 SEC.AI - Your ${data.role} Account is Ready!`;

        const body = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to G3 SEC.AI</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #01443B, #04ae8a); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome-box { background: linear-gradient(135deg, #01443B, #04ae8a); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .credentials-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
        .credential-label { font-weight: 600; color: #01443B; }
        .credential-value { color: #333; font-family: monospace; }
        .cta-button { display: inline-block; background: #01443B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .steps { counter-reset: step-counter; }
        .step { counter-increment: step-counter; margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .step::before { content: counter(step-counter); background: #01443B; color: white; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Welcome to G3 SEC.AI</h1>
            <p>Third Party Risk Intelligence Platform</p>
        </div>
        
        <div class="content">
            <div class="welcome-box">
                <h2>Welcome, ${data.name}!</h2>
                <p>Your ${data.role} account has been successfully created for ${data.organizationName}</p>
                ${data.department ? `<p>Department: ${data.department}</p>` : ''}
            </div>
            
            ${data.customMessage ? `
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; color: #1976d2;">Personal Message:</h3>
                <p style="margin: 0; color: #1976d2;">${data.customMessage}</p>
            </div>
            ` : ''}
            
            <div class="credentials-box">
                <h3 style="margin: 0 0 15px; color: #01443B;">Your Login Credentials</h3>
                <div class="credential-row">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${data.email}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${data.password}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Role:</span>
                    <span class="credential-value">${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Organization:</span>
                    <span class="credential-value">${data.organizationName}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="cta-button">Login to Your Account</a>
            </div>
            
            <div class="security-notice">
                <h3 style="margin: 0 0 10px; color: #856404;">🔒 Security Notice</h3>
                <ul style="margin: 0; padding-left: 20px; color: #856404;">
                    <li>Please change your password after your first login</li>
                    <li>Never share your credentials with anyone</li>
                    <li>Use two-factor authentication when available</li>
                    <li>Report any suspicious activity immediately</li>
                </ul>
            </div>
            
            <div class="steps">
                <h3>Getting Started:</h3>
                <div class="step">
                    <strong>Login</strong> - Use the credentials above to access your account
                </div>
                <div class="step">
                    <strong>Change Password</strong> - Update your password for security
                </div>
                <div class="step">
                    <strong>Complete Profile</strong> - Fill out your profile information
                </div>
                <div class="step">
                    <strong>Explore</strong> - Start using the platform features
                </div>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #01443B;">Need Help?</h3>
                <p style="margin: 0;">If you have any questions or need assistance, please contact our support team:</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> support@g3sec.ai</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p style="margin: 5px 0;"><strong>Documentation:</strong> <a href="https://docs.g3sec.ai">docs.g3sec.ai</a></p>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 G3 SEC.AI. All rights reserved.</p>
            <p>This email was sent to ${data.email}. If you didn't request this account, please contact support.</p>
        </div>
    </div>
</body>
</html>
        `;

        return { subject, body };
    }

    private static generateAttachments(data: WelcomeEmailData): FileAttachment[] {
        const attachments: FileAttachment[] = [];

        // Generate a welcome PDF guide
        const welcomeGuide = this.generateWelcomeGuide(data);
        attachments.push({
            filename: 'G3_SEC_AI_Welcome_Guide.pdf',
            content: welcomeGuide,
            contentType: 'application/pdf'
        });

        // Generate a security checklist
        const securityChecklist = this.generateSecurityChecklist();
        attachments.push({
            filename: 'Security_Checklist.pdf',
            content: securityChecklist,
            contentType: 'application/pdf'
        });

        return attachments;
    }

    private static generateWelcomeGuide(data: WelcomeEmailData): string {
        // In a real implementation, this would generate an actual PDF
        return `Welcome Guide for ${data.name} - ${data.role} at ${data.organizationName}`;
    }

    private static generateSecurityChecklist(): string {
        // In a real implementation, this would generate an actual PDF
        return `Security Checklist for G3 SEC.AI Platform Users`;
    }

    private static async mockSendEmail(emailData: EmailData): Promise<boolean> {
        // Mock API call - in production, this would be replaced with actual email service
        const mockResponse = {
            success: true,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };

        // Simulate potential failures (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Email service temporarily unavailable');
        }

        return mockResponse.success;
    }

    static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
        try {
            const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

            const emailData: EmailData = {
                to: email,
                subject: 'Password Reset Request - G3 SEC.AI',
                body: `
                    <h2>Password Reset Request</h2>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                `
            };

            return await this.mockSendEmail(emailData);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw error;
        }
    }

    static async sendAccountActivationEmail(email: string, activationToken: string): Promise<boolean> {
        try {
            const activationUrl = `${window.location.origin}/activate?token=${activationToken}`;

            const emailData: EmailData = {
                to: email,
                subject: 'Activate Your G3 SEC.AI Account',
                body: `
                    <h2>Account Activation Required</h2>
                    <p>Please click the link below to activate your account:</p>
                    <a href="${activationUrl}">Activate Account</a>
                    <p>This link will expire in 24 hours.</p>
                `
            };

            return await this.mockSendEmail(emailData);
        } catch (error) {
            console.error('Failed to send activation email:', error);
            throw error;
        }
    }
}

export default EmailService;