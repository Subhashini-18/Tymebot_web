import { EmailTemplate } from './index';

export const templates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Send to new users when they sign up',
    category: 'transactional',
    subject: 'Welcome to {{companyName}}!',
    propDefinitions: [
      {
        name: 'username',
        type: 'string',
        description: 'User\'s display name',
        defaultValue: 'there',
        required: true
      },
      {
        name: 'loginLink',
        type: 'string',
        description: 'Link to log into the platform',
        defaultValue: 'https://example.com/login',
        required: true
      },
      {
        name: 'productTips',
        type: 'array',
        description: 'List of helpful tips for new users',
        defaultValue: ['Set up your profile', 'Connect with others', 'Explore features'],
        required: false
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'otp',
    name: 'One-Time Password',
    description: 'Send a verification code for secure actions',
    category: 'system',
    subject: 'Your {{companyName}} verification code',
    propDefinitions: [
      {
        name: 'code',
        type: 'string',
        description: 'The OTP code',
        defaultValue: '123456',
        required: true
      },
      {
        name: 'expiresInMinutes',
        type: 'number',
        description: 'Minutes until the code expires',
        defaultValue: 10,
        required: true
      },
      {
        name: 'requestedFrom',
        type: 'string',
        description: 'Device or location info',
        defaultValue: 'Chrome on Windows',
        required: false
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Help users regain access to their account',
    category: 'system',
    subject: 'Reset your {{companyName}} password',
    propDefinitions: [
      {
        name: 'resetLink',
        type: 'string',
        description: 'Secure link to reset password',
        defaultValue: 'https://example.com/reset-password?token=abc123',
        required: true
      },
      {
        name: 'expiresInHours',
        type: 'number',
        description: 'Hours until the link expires',
        defaultValue: 24,
        required: true
      },
      {
        name: 'requestedAt',
        type: 'string',
        description: 'When the reset was requested',
        defaultValue: '2025-07-02 09:42:17',
        required: false
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Confirm purchase details after checkout',
    category: 'transactional',
    subject: 'Your {{companyName}} order confirmation',
    propDefinitions: [
      {
        name: 'orderNumber',
        type: 'string',
        description: 'Order reference number',
        defaultValue: 'ORD-123456',
        required: true
      },
      {
        name: 'items',
        type: 'array',
        description: 'List of purchased items',
        defaultValue: [
          { name: 'Product A', price: '$19.99', quantity: 1 },
          { name: 'Product B', price: '$24.99', quantity: 2 }
        ],
        required: true
      },
      {
        name: 'total',
        type: 'string',
        description: 'Total order amount',
        defaultValue: '$69.97',
        required: true
      },
      {
        name: 'shippingAddress',
        type: 'object',
        description: 'Delivery address',
        defaultValue: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345'
        },
        required: true
      },
      {
        name: 'estimatedDelivery',
        type: 'string',
        description: 'Estimated delivery date',
        defaultValue: 'July 9, 2025',
        required: false
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Send payment receipt and invoice details',
    category: 'transactional',
    subject: '{{companyName}} Invoice #{{invoiceNumber}}',
    propDefinitions: [
      {
        name: 'invoiceNumber',
        type: 'string',
        description: 'Invoice reference number',
        defaultValue: 'INV-789012',
        required: true
      },
      {
        name: 'billingDate',
        type: 'string',
        description: 'Date of billing',
        defaultValue: 'July 2, 2025',
        required: true
      },
      {
        name: 'dueDate',
        type: 'string',
        description: 'Payment due date',
        defaultValue: 'July 16, 2025',
        required: true
      },
      {
        name: 'items',
        type: 'array',
        description: 'List of billed items',
        defaultValue: [
          { description: 'Premium Subscription', period: 'July 2025', amount: '$29.99' },
          { description: 'Additional Storage', period: 'July 2025', amount: '$9.99' }
        ],
        required: true
      },
      {
        name: 'total',
        type: 'string',
        description: 'Total amount due',
        defaultValue: '$39.98',
        required: true
      },
      {
        name: 'paymentMethod',
        type: 'string',
        description: 'Method of payment',
        defaultValue: 'Visa ending in 1234',
        required: false
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Regular updates and content for subscribers',
    category: 'marketing',
    subject: '{{companyName}} Newsletter: {{issueTitle}}',
    propDefinitions: [
      {
        name: 'issueTitle',
        type: 'string',
        description: 'Title of this newsletter issue',
        defaultValue: 'July 2025 Updates',
        required: true
      },
      {
        name: 'heroImage',
        type: 'string',
        description: 'URL of the main banner image',
        defaultValue: 'https://placehold.co/600x300/E8EAED/6C757D?text=Newsletter+Banner',
        required: false
      },
      {
        name: 'articles',
        type: 'array',
        description: 'List of articles or content pieces',
        defaultValue: [
          {
            title: 'Major Product Update',
            summary: 'We\'ve launched exciting new features this month.',
            link: 'https://example.com/blog/update'
          },
          {
            title: 'Customer Success Story',
            summary: 'See how XYZ company achieved amazing results.',
            link: 'https://example.com/case-studies/xyz'
          }
        ],
        required: true
      },
      {
        name: 'unsubscribeLink',
        type: 'string',
        description: 'Link to unsubscribe from future emails',
        defaultValue: 'https://example.com/unsubscribe?email=user@example.com',
        required: true
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'promotional',
    name: 'Promotional Offer',
    description: 'Special deals and limited-time offers',
    category: 'marketing',
    subject: 'Special Offer: {{offerTitle}} | {{companyName}}',
    propDefinitions: [
      {
        name: 'offerTitle',
        type: 'string',
        description: 'Title of the promotion',
        defaultValue: 'Summer Sale - 30% Off!',
        required: true
      },
      {
        name: 'offerImage',
        type: 'string',
        description: 'URL of the promotional image',
        defaultValue: 'https://placehold.co/600x300/FDF2E9/F7501C?text=G3sec+AI+Limited+Time+Offer',
        required: false
      },
      {
        name: 'offerDescription',
        type: 'string',
        description: 'Description of the offer',
        defaultValue: 'For a limited time, enjoy 30% off all premium plans. Upgrade now to access exclusive features!',
        required: true
      },
      {
        name: 'promoCode',
        type: 'string',
        description: 'Promotional code to apply discount',
        defaultValue: 'SUMMER30',
        required: true
      },
      {
        name: 'expiryDate',
        type: 'string',
        description: 'When the offer expires',
        defaultValue: 'July 15, 2025',
        required: true
      },
      {
        name: 'ctaLink',
        type: 'string',
        description: 'Link for the call-to-action button',
        defaultValue: 'https://example.com/offers/summer',
        required: true
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    description: 'Invite users to webinars, conferences, etc.',
    category: 'marketing',
    subject: 'You\'re Invited: {{eventName}} by {{companyName}}',
    propDefinitions: [
      {
        name: 'eventName',
        type: 'string',
        description: 'Name of the event',
        defaultValue: 'Annual Developer Conference',
        required: true
      },
      {
        name: 'eventDate',
        type: 'string',
        description: 'When the event takes place',
        defaultValue: 'July 25-26, 2025',
        required: true
      },
      {
        name: 'eventLocation',
        type: 'string',
        description: 'Where the event takes place',
        defaultValue: 'Virtual Event / Online',
        required: true
      },
      {
        name: 'eventDescription',
        type: 'string',
        description: 'Description of the event',
        defaultValue: 'Join us for two days of learning, networking, and exploring the latest in technology.',
        required: true
      },
      {
        name: 'speakers',
        type: 'array',
        description: 'Featured speakers or presenters',
        defaultValue: [
          { name: 'Jane Smith', title: 'CTO, Tech Solutions Inc.' },
          { name: 'John Doe', title: 'AI Research Lead, Future Labs' }
        ],
        required: false
      },
      {
        name: 'registrationLink',
        type: 'string',
        description: 'Link to register for the event',
        defaultValue: 'https://example.com/events/register',
        required: true
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'alert-notification',
    name: 'Alert Notification',
    description: 'Notify users of important system changes or alerts',
    category: 'notification',
    subject: 'Important Alert from {{companyName}}',
    propDefinitions: [
      {
        name: 'alertType',
        type: 'string',
        description: 'Type of alert (Security, Maintenance, etc.)',
        defaultValue: 'Scheduled Maintenance',
        required: true
      },
      {
        name: 'alertSeverity',
        type: 'string',
        description: 'Severity level of the alert',
        defaultValue: 'Medium',
        required: true
      },
      {
        name: 'alertMessage',
        type: 'string',
        description: 'Main alert message',
        defaultValue: 'Our system will be undergoing scheduled maintenance on July 10 from 2:00 AM to 4:00 AM UTC. During this time, services may be intermittently unavailable.',
        required: true
      },
      {
        name: 'affectedServices',
        type: 'array',
        description: 'List of affected services or features',
        defaultValue: ['User Dashboard', 'API Services', 'Mobile App'],
        required: false
      },
      {
        name: 'actionRequired',
        type: 'boolean',
        description: 'Whether user action is required',
        defaultValue: false,
        required: true
      },
      {
        name: 'detailsLink',
        type: 'string',
        description: 'Link to more information',
        defaultValue: 'https://status.example.com',
        required: false
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  },
  {
    id: 'feedback-request',
    name: 'Feedback Request',
    description: 'Ask users for product or service feedback',
    category: 'notification',
    subject: 'We value your feedback | {{companyName}}',
    propDefinitions: [
      {
        name: 'productName',
        type: 'string',
        description: 'Name of product or service to review',
        defaultValue: 'Premium Plan',
        required: true
      },
      {
        name: 'usagePeriod',
        type: 'string',
        description: 'How long user has been using the product',
        defaultValue: '3 months',
        required: false
      },
      {
        name: 'feedbackContext',
        type: 'string',
        description: 'Context for why feedback is being requested',
        defaultValue: 'We noticed you\'ve been using our Premium Plan for a while now, and we\'d love to hear about your experience.',
        required: true
      },
      {
        name: 'surveyLink',
        type: 'string',
        description: 'Link to feedback survey',
        defaultValue: 'https://example.com/feedback?user=123',
        required: true
      },
      {
        name: 'incentive',
        type: 'string',
        description: 'Incentive offered for completing feedback',
        defaultValue: 'Complete the survey and receive a $10 account credit!',
        required: false
      },
      {
        name: 'estimatedTime',
        type: 'string',
        description: 'Estimated time to complete feedback',
        defaultValue: '5 minutes',
        required: true
      },
      {
        name: 'link',
        type: 'string',
        description: 'Link to application',
        defaultValue: 'https://example.com/app',
        required: true
      }
    ]
  }
];

export const getTemplateById = (id: string): EmailTemplate | undefined => {
  return templates.find(template => template.id === id);
};
