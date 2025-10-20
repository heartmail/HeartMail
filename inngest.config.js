/**
 * Inngest Configuration for HeartMail
 * This file configures Inngest for both development and production environments
 */

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  // Development configuration
  dev: {
    // Local development server
    url: 'http://localhost:3000/api/inngest',
    // Dev server UI
    ui: 'http://localhost:8288',
    // Auto-discovery
    autoDiscovery: true,
    // Polling interval for updates
    pollInterval: 5,
  },
  
  // Production configuration
  prod: {
    // Production server
    url: 'https://heartsmail.com/api/inngest',
    // Production Inngest environment
    env: 'production',
    // Signing key for production
    signingKey: process.env.INNGEST_SIGNING_KEY,
    // Event key for production
    eventKey: process.env.INNGEST_EVENT_KEY,
  },
  
  // Function configuration
  functions: {
    // Send scheduled email function
    'send-scheduled-email': {
      id: 'send-scheduled-email',
      name: 'Send Scheduled Email',
      description: 'Sends a scheduled email to a recipient',
      triggers: ['email/send'],
      retries: 3,
      timeout: '5m',
    },
    
    // Schedule email function
    'schedule-email': {
      id: 'schedule-email',
      name: 'Schedule Email',
      description: 'Schedules an email for future delivery',
      triggers: ['email/schedule'],
      retries: 2,
      timeout: '1m',
    },
    
    // Test function
    'test-function': {
      id: 'test-function',
      name: 'Test Function',
      description: 'Simple test function for debugging',
      triggers: ['test/hello'],
      retries: 1,
      timeout: '30s',
    },
  },
  
  // Error handling
  errorHandling: {
    // Retry configuration
    retries: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseDelay: '1s',
      maxDelay: '5m',
    },
    
    // Dead letter queue
    deadLetterQueue: true,
    
    // Error notifications
    notifications: {
      email: process.env.ADMIN_EMAIL || 'admin@heartsmail.com',
      slack: process.env.SLACK_WEBHOOK_URL,
    },
  },
  
  // Monitoring and observability
  monitoring: {
    // Metrics collection
    metrics: true,
    
    // Logging
    logging: {
      level: isDevelopment ? 'debug' : 'info',
      format: isDevelopment ? 'pretty' : 'json',
    },
    
    // Tracing
    tracing: true,
  },
};
