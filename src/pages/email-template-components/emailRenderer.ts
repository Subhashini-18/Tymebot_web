import { templates } from './templates';
import { EmailTemplate, Company } from './index';
import { EmailBlock } from './EmailEditorContext';
import { companyService } from './companyService';

// Async version for new implementations
export const renderEmailPreviewAsync = async (
  templateId: string,
  companyId: string,
  props: Record<string, any>
): Promise<string> => {
  const company = await companyService.getCompanyById(companyId);

  if (!company) {
    return `<div class="error">Company not found</div>`;
  }

  // Handle custom template (new template from scratch)
  if (templateId === 'custom') {
    if (props.useBlocks && props.blocks) {
      return renderCustomEmailHTML(company, props);
    }
    return `<div class="error">No blocks found for custom template</div>`;
  }

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return `<div class="error">Template not found</div>`;
  }

  return renderEmailHTML(template, company, props);
};

// Async version with placeholder mode support
export const renderEmailPreviewWithModeAsync = async (
  templateId: string,
  companyId: string,
  props: Record<string, any>,
  mode: 'preview' | 'placeholder' = 'preview'
): Promise<string> => {
  const company = await companyService.getCompanyById(companyId);

  if (!company) {
    return `<div class="error">Company not found</div>`;
  }

  // Handle custom template (new template from scratch)
  if (templateId === 'custom') {
    if (props.useBlocks && props.blocks) {
      return renderCustomEmailHTML(company, props, mode);
    }
    return `<div class="error">No blocks found for custom template</div>`;
  }

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return `<div class="error">Template not found</div>`;
  }

  return renderEmailHTML(template, company, props, mode);
};

// Synchronous version for backward compatibility
export const renderEmailPreview = (
  templateId: string,
  companyId: string,
  props: Record<string, any>
): string => {
  // For synchronous calls, we'll try to get the company from cache
  // If not available, we'll use a fallback
  let company: Company | undefined;

  // Try to get from cache synchronously
  try {
    // This will work if companies are already loaded
    const staticCompanies = companyService.getStaticCompanies();
    company = staticCompanies.find(c => c.id === companyId);

    // If not found in static, create a better fallback for dynamic companies
    if (!company) {
      // Create a basic company object as fallback with a working logo
      company = {
        id: companyId,
        name: 'Dynamic Company',
        logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjM0I4MkY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbXBhbnkgTG9nbzwvdGV4dD4KPHN2Zz4=',
        primaryColor: '#3B82F6',
        secondaryColor: '#DBEAFE',
        footerText: `© ${new Date().getFullYear()} Company. All rights reserved.`,
        socialLinks: {}
      };
    }
  } catch (error) {
    console.error('Error getting company:', error);
    return `<div class="error">Error loading company data</div>`;
  }

  if (!company) {
    return `<div class="error">Company not found</div>`;
  }

  // Handle custom template (new template from scratch)
  if (templateId === 'custom') {
    if (props.useBlocks && props.blocks) {
      return renderCustomEmailHTML(company, props);
    }
    return `<div class="error">No blocks found for custom template</div>`;
  }

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return `<div class="error">Template not found</div>`;
  }

  return renderEmailHTML(template, company, props);
};

const renderEmailHTML = (
  template: EmailTemplate,
  company: Company,
  props: Record<string, any>,
  mode: 'preview' | 'placeholder' = 'preview'
): string => {
  // Replace placeholders in the subject
  const subject = template.subject.replace(/\{\{companyName\}\}/g, company.name);

  // Generate content from blocks if available, otherwise use template-specific content
  let content = '';

  if (props.useBlocks && props.blocks) {
    // Render from dynamic blocks
    content = renderBlocksContent(props.blocks, company, mode);
  } else {
    // Generate template-specific content based on the template ID (fallback)
    switch (template.id) {
      case 'welcome':
        content = renderWelcomeEmail(props, company, mode);
        break;
      case 'otp':
        content = renderOTPEmail(props, company, mode);
        break;
      case 'password-reset':
        content = renderPasswordResetEmail(props, company, mode);
        break;
      case 'order-confirmation':
        content = renderOrderConfirmationEmail(props, company, mode);
        break;
      case 'invoice':
        content = renderInvoiceEmail(props, company, mode);
        break;
      case 'newsletter':
        content = renderNewsletterEmail(props, company, mode);
        break;
      case 'promotional':
        content = renderPromotionalEmail(props, company, mode);
        break;
      case 'event-invitation':
        content = renderEventInvitationEmail(props, company, mode);
        break;
      case 'alert-notification':
        content = renderAlertNotificationEmail(props, company, mode);
        break;
      case 'feedback-request':
        content = renderFeedbackRequestEmail(props, company, mode);
        break;
      default:
        content = `<p>No template content available for ${template.id}</p>`;
    }
  }

  // Wrap the content in the email layout
  const isBlockRendered = props.useBlocks && props.blocks;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .email-header {
          padding: 20px;
          text-align: center;
          background-color: ${company.secondaryColor};
        }
        .email-logo {
          height: 50px;
          width: 200px;
        }
        .email-content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .email-footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          background-color: ${company.secondaryColor};
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 0;
          font-size: 16px;
          color: #ffffff;
          background-color: ${company.primaryColor};
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-link {
          display: inline-block;
          margin: 0 5px;
          color: ${company.primaryColor};
          text-decoration: none;
          font-size: 12px;
        }
        .divider {
          height: 1px;
          width: 100%;
          background-color: #e0e0e0;
          margin: 20px 0;
        }
        .text-center {
          text-align: center;
        }
        .text-small {
          font-size: 12px;
        }
        .code {
          font-family: monospace;
          font-size: 24px;
          letter-spacing: 5px;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 4px;
          text-align: center;
          margin: 15px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: ${company.secondaryColor};
          text-align: left;
          padding: 8px;
        }
        td {
          padding: 8px;
          border-top: 1px solid #e0e0e0;
        }
        .alert {
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .alert-info {
          background-color: #e8f4fd;
          border-left: 4px solid #2196F3;
        }
        .alert-warning {
          background-color: #fff8e1;
          border-left: 4px solid #ffc107;
        }
        .alert-success {
          background-color: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
        .alert-error {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        ${isBlockRendered ? content : `
          <div class="email-header">
            <img src="${company.logoUrl}" alt="${company.name}" class="email-logo">
          </div>
          <div class="email-content">
            ${content}
          </div>
          <div class="email-footer">
            ${company.footerText}
            ${renderSocialLinks(company)}
          </div>
        `}
      </div>
    </body>
    </html>
  `;
};

const renderCustomEmailHTML = (
  company: Company,
  props: Record<string, any>,
  mode: 'preview' | 'placeholder' = 'preview'
): string => {
  // Only render the blocks as provided by the user, no default header/footer
  const content = renderBlocksContent(props.blocks, company, mode);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Custom Email Template</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .email-header {
          padding: 20px;
          text-align: center;
        }
        .email-content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .email-footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          background-color: #f9f9f9;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: ${company.primaryColor};
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: ${company.secondaryColor};
        }
        .divider {
          height: 1px;
          width: 100%;
          background-color: #e0e0e0;
          margin: 20px 0;
        }
        .text-center {
          text-align: center;
        }
        .text-small {
          font-size: 12px;
        }
        .social-links {
          text-align: center;
          margin: 20px 0;
        }
        .social-link {
          color: ${company.primaryColor};
          text-decoration: none;
          margin: 0 10px;
        }
        .social-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        ${content}
      </div>
    </body>
    </html>
  `;
};

const renderSocialLinks = (company: Company): string => {
  if (!company.socialLinks) {
    return '';
  }

  const links = [];
  if (company.socialLinks.facebook) {
    links.push(`<a href="${company.socialLinks.facebook}" class="social-link">Facebook</a>`);
  }
  if (company.socialLinks.twitter) {
    links.push(`<a href="${company.socialLinks.twitter}" class="social-link">Twitter</a>`);
  }
  if (company.socialLinks.instagram) {
    links.push(`<a href="${company.socialLinks.instagram}" class="social-link">Instagram</a>`);
  }
  if (company.socialLinks.linkedin) {
    links.push(`<a href="${company.socialLinks.linkedin}" class="social-link">LinkedIn</a>`);
  }

  if (links.length === 0) {
    return '';
  }

  return `
    <div class="divider"></div>
    <div class="social-links">
      ${links.join(' | ')}
    </div>
  `;
};

const renderBlocksContent = (blocks: { header: EmailBlock[]; body: EmailBlock[]; footer: EmailBlock[] }, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const renderBlock = (block: EmailBlock): string => {
    const { type, props } = block;

    // Extract content and styles from props
    const content = props.content || '';
    const styles = props.styles || {};

    switch (type) {
      case 'text':
        return `<p style="${generateStyleString(styles)}">${content}</p>`;

      case 'heading':
        const level = props.level || 1;
        return `<h${level} style="${generateStyleString(styles)}">${content}</h${level}>`;

      case 'button':
        return `<div style="text-align: center; margin: 20px 0;">
          <a href="${props.href || '#'}" style="${generateStyleString(styles)}" target="${props.target || '_blank'}">
            ${content || 'Click here'}
          </a>
        </div>`;

      case 'image':
        return `<div style="text-align: center; margin: 20px 0;">
          <img src="${props.src || content || ''}" alt="${props.alt || ''}" style="${generateStyleString(styles)}" />
        </div>`;

      case 'divider':
        return `<div style="height: 1px; background-color: #e0e0e0; margin: 20px 0; ${generateStyleString(styles)}"></div>`;

      case 'code':
        return `<div style="font-family: monospace; background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; margin: 15px 0; ${generateStyleString(styles)}">${content}</div>`;

      case 'list':
        const items = props.items || [];
        const listItems = items.map((item: any) => `<li>${typeof item === 'string' ? item : item.text || item.name || ''}</li>`).join('');
        return `<ul style="${generateStyleString(styles)}">${listItems}</ul>`;

      case 'alert':
        const alertType = props.type || 'info';
        return `<div class="alert alert-${alertType}" style="${generateStyleString(styles)}">${content}</div>`;

      case 'social-links':
        const socialLinks = props.facebook || props.twitter || props.instagram || props.linkedin ?
          Object.entries(props).filter(([key, value]) => value && ['facebook', 'twitter', 'instagram', 'linkedin'].includes(key))
            .map(([key, value]) => `<a href="${value}" class="social-link" style="margin: 0 5px; color: ${company.primaryColor}; text-decoration: none;">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`)
            .join(' | ') : '';
        return `<div style="text-align: center; ${generateStyleString(styles)}">${socialLinks}</div>`;

      case 'table':
        const headers = props.headers || [];
        const rows = props.rows || [];
        const headerHTML = headers.length > 0 ?
          `<tr>${headers.map((header: string) => `<th style="background-color: ${company.secondaryColor}; text-align: left; padding: 8px;">${header}</th>`).join('')}</tr>` : '';
        const rowsHTML = rows.map((row: any[]) =>
          `<tr>${row.map((cell: any) => `<td style="padding: 8px; border-top: 1px solid #e0e0e0;">${cell}</td>`).join('')}</tr>`
        ).join('');
        const totalRow = props.total ? `<tr><td colspan="${headers.length - 1}" style="text-align: right; padding: 8px;"><strong>Total:</strong></td><td style="padding: 8px;"><strong>${props.total}</strong></td></tr>` : '';
        return `<table style="width: 100%; border-collapse: collapse; ${generateStyleString(styles)}">${headerHTML}${rowsHTML}${totalRow}</table>`;

      default:
        return `<div style="${generateStyleString(styles)}">${content}</div>`;
    }
  };

  const headerHTML = blocks.header.map(renderBlock).join('');
  const bodyHTML = blocks.body.map(renderBlock).join('');
  const footerHTML = blocks.footer.map(renderBlock).join('');

  return `
    <div class="email-header">${headerHTML}</div>
    <div class="email-content">${bodyHTML}</div>
    <div class="email-footer">${footerHTML}</div>
  `;
};

const generateStyleString = (styles: Record<string, any>): string => {
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
};

// Helper function to get value based on mode
const getValue = (value: any, propertyName: string, mode: 'preview' | 'placeholder' = 'preview'): string => {
  if (mode === 'placeholder') {
    return `###{{${propertyName}}}###`;
  }

  // In preview mode, return the actual value if it exists, otherwise show placeholder as fallback
  if (value !== undefined && value !== null && value !== '') {
    return String(value);
  }

  return `###{{${propertyName}}}###`;
};

// Template-specific renderers
const renderWelcomeEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const displayUsername = getValue(props.username, 'username', mode);
  const displayLoginLink = getValue(props.loginLink, 'loginLink', mode);
  const displayLink = getValue(props.link, 'link', mode);
  const displayProductTips = mode === 'placeholder' ? '###{{productTips}}###' : (props.productTips || []);

  let tipsHTML = '';
  if (mode === 'placeholder') {
    tipsHTML = `
      <div style="margin-top: 20px;">
        <h3>Here are some tips to get started:</h3>
        <div>###{{productTips}}###</div>
      </div>
    `;
  } else if (displayProductTips && displayProductTips.length > 0) {
    tipsHTML = `
      <div style="margin-top: 20px;">
        <h3>Here are some tips to get started:</h3>
        <ul>
          ${displayProductTips.map((tip: string) => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  return `
    <h1>Welcome to ${company.name}, ${displayUsername}!</h1>
    <p>We're thrilled to have you join our community. Your account has been successfully created and is ready to use.</p>
    
    ${tipsHTML}
    
    <div class="text-center">
      <a href="${displayLoginLink}" class="button">Log In to Your Account</a>
    </div>
    
   
    
    <p>If you have any questions, feel free to reply to this email. Our support team is always here to help.</p>
    
    <p>Best regards,<br>The ${company.name} Team</p>
  `;
};

const renderOTPEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const displayCode = getValue(props.code, 'code', mode);
  const displayExpiresInMinutes = getValue(props.expiresInMinutes, 'expiresInMinutes', mode);
  const displayRequestedFrom = getValue(props.requestedFrom, 'requestedFrom', mode);
  const displayLink = getValue(props.link, 'link', mode);

  return `
    <h1>Your Verification Code</h1>
    <p>Please use the following code to complete your verification:</p>
    
    <div class="code">${displayCode}</div>
    
    <p>This code will expire in <strong>${displayExpiresInMinutes} minutes</strong>.</p>
    
    ${displayRequestedFrom && displayRequestedFrom !== '###{{requestedFrom}}###' ? `<p class="text-small">This code was requested from ${displayRequestedFrom}.</p>` : (mode === 'placeholder' ? `<p class="text-small">This code was requested from ###{{requestedFrom}}###.</p>` : '')}
    
    <div class="text-center" style="margin: px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <div class="alert alert-info">
      <p>If you did not request this code, please ignore this email or contact support if you believe this is suspicious activity.</p>
    </div>
    
    <p>Best regards,<br>The ${company.name} Security Team</p>
  `;
};

const renderPasswordResetEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const displayResetLink = getValue(props.resetLink, 'resetLink', mode);
  const displayExpiresInHours = getValue(props.expiresInHours, 'expiresInHours', mode);
  const displayRequestedAt = getValue(props.requestedAt, 'requestedAt', mode);
  const displayLink = getValue(props.link, 'link', mode);

  return `
    <h1>Password Reset Request</h1>
    <p>We received a request to reset your password for your ${company.name} account. Click the button below to set a new password:</p>
    
    <div class="text-center">
      <a href="${displayResetLink}" class="button">Reset Password</a>
    </div>
    
    <p class="text-small">Or copy and paste this link into your browser: <br>${displayResetLink}</p>
    
    <p>This link will expire in <strong>${displayExpiresInHours} hours</strong>.</p>
    
    ${displayRequestedAt && displayRequestedAt !== '###{{requestedAt}}###' ? `<p class="text-small">This reset was requested on ${displayRequestedAt}.</p>` : ''}
    
    <div class="text-center" style="margin: 20px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <div class="alert alert-warning">
      <p>If you did not request a password reset, please ignore this email or contact support if you believe your account may have been compromised.</p>
    </div>
    
    <p>Best regards,<br>The ${company.name} Security Team</p>
  `;
};

const renderOrderConfirmationEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    orderNumber = 'ORD-123456',
    items = [],
    total = '$0.00',
    shippingAddress = {},
    estimatedDelivery = ''
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  let itemsHTML = '';
  if (items && items.length > 0) {
    itemsHTML = `
      <table>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
        ${items.map((item: any) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="text-align: right;"><strong>Total:</strong></td>
          <td><strong>${total}</strong></td>
        </tr>
      </table>
    `;
  }

  let addressHTML = '';
  if (shippingAddress) {
    addressHTML = `
      <div style="margin-top: 20px;">
        <h3>Shipping Address:</h3>
        <p>
          ${shippingAddress.street || ''}<br>
          ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zip || ''}
        </p>
      </div>
    `;
  }

  return `
    <h1>Order Confirmation</h1>
    <p>Thank you for your purchase! We're pleased to confirm that your order has been received and is being processed.</p>
    
    <p><strong>Order Number:</strong> ${orderNumber}</p>
    
    <div class="divider"></div>
    
    <h2>Order Summary</h2>
    ${itemsHTML}
    
    ${addressHTML}
    
    ${estimatedDelivery ? `
      <div class="alert alert-success">
        <p>Estimated delivery: <strong>${estimatedDelivery}</strong></p>
      </div>
    ` : ''}
    
    <p>You can track your order status by visiting your account dashboard.</p>
    
    <div class="text-center">
      <a href="#" class="button">Track Your Order</a>
    </div>
    
    <div class="text-center" style="margin:px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <p>If you have any questions about your order, please contact our customer service team.</p>
    
    <p>Thank you for shopping with ${company.name}!</p>
  `;
};

const renderInvoiceEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    invoiceNumber = 'INV-123456',
    billingDate = '',
    dueDate = '',
    items = [],
    total = '$0.00',
    paymentMethod = ''
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  let itemsHTML = '';
  if (items && items.length > 0) {
    itemsHTML = `
      <table>
        <tr>
          <th>Description</th>
          <th>Period</th>
          <th>Amount</th>
        </tr>
        ${items.map((item: any) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.period}</td>
            <td>${item.amount}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="text-align: right;"><strong>Total:</strong></td>
          <td><strong>${total}</strong></td>
        </tr>
      </table>
    `;
  }

  return `
    <h1>Invoice #${invoiceNumber}</h1>
    <p>Please find below the details of your recent billing.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Billing Date:</strong> ${billingDate}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      ${paymentMethod ? `<p><strong>Payment Method:</strong> ${paymentMethod}</p>` : ''}
    </div>
    
    <div class="divider"></div>
    
    <h2>Invoice Details</h2>
    ${itemsHTML}
    
    <div class="text-center" style="margin-top: 30px;">
      <a href="#" class="button">View Invoice Online</a>
    </div>
    
    <div class="text-center" style="margin: px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <div class="alert alert-info" style="margin-top: 20px;">
      <p>This invoice was automatically paid with your saved payment method. No further action is required.</p>
    </div>
    
    <p>If you have any questions about this invoice, please contact our billing department.</p>
    
    <p>Thank you for your business!</p>
  `;
};

const renderNewsletterEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    issueTitle = 'Newsletter',
    heroImage = '',
    articles = [],
    unsubscribeLink = '#'
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  let articlesHTML = '';
  if (articles && articles.length > 0) {
    articlesHTML = articles.map((article: any) => `
      <div style="margin-bottom: 30px;">
        <h2>${article.title}</h2>
        <p>${article.summary}</p>
        <a href="${article.link}" style="color: ${company.primaryColor}; text-decoration: none; font-weight: bold;">Read More →</a>
      </div>
      <div class="divider"></div>
    `).join('');
  }

  return `
    <h1>${company.name} Newsletter: ${issueTitle}</h1>
    
    ${heroImage ? `
      <div style="margin: 20px 0;">
        <img src="${heroImage}" alt="${issueTitle}" style="max-width: 100%; height: auto; border-radius: 4px;">
      </div>
    ` : ''}
    
    ${articlesHTML}
    
    <div class="text-center" style="margin: 10px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <p style="margin-top: 30px;">Thanks for reading!</p>
    <p>The ${company.name} Team</p>
    
    <div class="divider"></div>
    
    <p class="text-small text-center">
      You're receiving this email because you subscribed to our newsletter.
      <br>
      <a href="${unsubscribeLink}" style="color: #666;">Unsubscribe</a>
    </p>
  `;
};

const renderPromotionalEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    offerTitle = 'Special Offer',
    offerImage = '',
    offerDescription = '',
    promoCode = '',
    expiryDate = '',
    ctaLink = '#'
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  return `
    <div style="text-align: center;">
      <h1>${offerTitle}</h1>
      
      ${offerImage ? `
        <div style="margin: 20px 0;">
          <img src="${offerImage}" alt="${offerTitle}" style="max-width: 100%; height: auto; border-radius: 4px;">
        </div>
      ` : ''}
      
      <p style="font-size: 18px; margin: 20px 0;">${offerDescription}</p>
      
      ${promoCode ? `
        <div style="margin: 25px 0;">
          <p style="margin-bottom: 5px; font-size: 14px;">Use code:</p>
          <div class="code">${promoCode}</div>
        </div>
      ` : ''}
      
      ${expiryDate ? `
        <p style="font-weight: bold; margin: 20px 0;">Offer valid until: ${expiryDate}</p>
      ` : ''}
      
      <div style="margin: 30px 0;">
        <a href="${ctaLink}" class="button">Shop Now</a>
      </div>
      
      <div style="margin: 0px 0;">
        <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <p class="text-small text-center">
      Terms and conditions apply. This offer cannot be combined with other promotions.
    </p>
  `;
};

const renderEventInvitationEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    eventName = 'Company Event',
    eventDate = '',
    eventLocation = '',
    eventDescription = '',
    speakers = [],
    registrationLink = '#'
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  let speakersHTML = '';
  if (speakers && speakers.length > 0) {
    speakersHTML = `
      <div style="margin: 20px 0;">
        <h3>Featured Speakers</h3>
        <ul>
          ${speakers.map((speaker: any) => `
            <li><strong>${speaker.name}</strong> - ${speaker.title}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  return `
    <div style="text-align: center;">
      <h1>You're Invited!</h1>
      <h2>${eventName}</h2>
      
      <div style="margin: 25px 0; font-size: 18px;">
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${eventLocation}</p>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <p>${eventDescription}</p>
    
    ${speakersHTML}
    
    <div class="text-center" style="margin: 30px 0;">
      <a href="${registrationLink}" class="button">Register Now</a>
    </div>
    
    <div class="text-center" style="margin: 0px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <p>We hope to see you there!</p>
    <p>The ${company.name} Events Team</p>
    
    <div class="alert alert-info">
      <p>Registration is required to attend this event. Space may be limited, so please register early.</p>
    </div>
  `;
};

const renderAlertNotificationEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    alertType = 'System Alert',
    alertSeverity = 'Medium',
    alertMessage = '',
    affectedServices = [],
    actionRequired = false,
    detailsLink = '#'
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  let alertClass = 'alert-info';
  if (alertSeverity === 'High') {
    alertClass = 'alert-error';
  } else if (alertSeverity === 'Medium') {
    alertClass = 'alert-warning';
  } else if (alertSeverity === 'Low') {
    alertClass = 'alert-info';
  }

  let servicesHTML = '';
  if (affectedServices && affectedServices.length > 0) {
    servicesHTML = `
      <div style="margin: 20px 0;">
        <h3>Affected Services:</h3>
        <ul>
          ${affectedServices.map((service: string) => `<li>${service}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  return `
    <h1>${alertType}</h1>
    
    <div class="alert ${alertClass}">
      <p><strong>Severity: ${alertSeverity}</strong></p>
      <p>${alertMessage}</p>
    </div>
    
    ${servicesHTML}
    
    ${actionRequired ? `
      <div class="alert alert-error" style="margin-top: 20px;">
        <p><strong>Action Required</strong></p>
        <p>Please take action to ensure continued service availability.</p>
      </div>
    ` : ''}
    
    ${detailsLink ? `
      <div class="text-center" style="margin: 25px 0;">
        <a href="${detailsLink}" class="button">View Status Page</a>
      </div>
    ` : ''}
    
    <div class="text-center" style="margin: 0px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    <p>We apologize for any inconvenience this may cause. Our team is working to resolve this issue as quickly as possible.</p>
    
    <p>The ${company.name} Operations Team</p>
  `;
};

const renderFeedbackRequestEmail = (props: any, company: Company, mode: 'preview' | 'placeholder' = 'preview'): string => {
  const {
    productName = '',
    usagePeriod = '',
    feedbackContext = '',
    surveyLink = '#',
    incentive = '',
    estimatedTime = ''
  } = props;
  const displayLink = getValue(props.link, 'link', mode);

  return `
    <h1>We Value Your Feedback</h1>
    
    <p>Dear Customer,</p>
    
    <p>${feedbackContext}</p>
    
    <div style="margin: 25px 0;">
      <p><strong>Product:</strong> ${productName}</p>
      ${usagePeriod ? `<p><strong>Usage Period:</strong> ${usagePeriod}</p>` : ''}
      ${estimatedTime ? `<p><strong>Estimated Time:</strong> ${estimatedTime}</p>` : ''}
    </div>
    
    <div class="text-center" style="margin: 30px 0;">
      <a href="${surveyLink}" class="button">Share Your Feedback</a>
    </div>
    
    <div class="text-center" style="margin: 0px 0;">
      <a href="${displayLink}" class="button" style="background-color: ${company.secondaryColor}; color: #333;">Click here to application</a>
    </div>
    
    ${incentive ? `
      <div class="alert alert-success">
        <p>${incentive}</p>
      </div>
    ` : ''}
    
    <p>Your feedback helps us improve our products and services for you and all our customers.</p>
    
    <p>Thank you for your time and input!</p>
    
    <p>The ${company.name} Product Team</p>
  `;
};

