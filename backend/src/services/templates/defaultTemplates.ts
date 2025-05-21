// src/services/templates/defaultTemplates.ts
import { NodeTemplate } from './templateService';

// Default node templates for common patterns
export const defaultTemplates: NodeTemplate[] = [
  {
    id: 'http-get-template',
    name: 'HTTP GET Request',
    description: 'Template for making HTTP GET requests',
    category: 'api',
    nodeType: 'n8n-nodes-base.httpRequest',
    isDefault: true,
    config: {
      parameters: {
        method: 'GET',
        url: '={{ $json.url }}',
        authentication: 'none',
        options: {}
      }
    }
  },
  {
    id: 'http-post-template',
    name: 'HTTP POST Request',
    description: 'Template for making HTTP POST requests with JSON body',
    category: 'api',
    nodeType: 'n8n-nodes-base.httpRequest',
    isDefault: true,
    config: {
      parameters: {
        method: 'POST',
        url: '={{ $json.url }}',
        authentication: 'none',
        bodyContentType: 'json',
        jsonParameters: true,
        options: {}
      }
    }
  },
  {
    id: 'data-transform-template',
    name: 'Data Transformation',
    description: 'Template for transforming data structure',
    category: 'data',
    nodeType: 'n8n-nodes-base.set',
    isDefault: true,
    config: {
      parameters: {
        values: {
          string: [
            {
              name: 'transformedData',
              value: '={{ $json.data }}'
            }
          ]
        }
      }
    }
  },
  {
    id: 'email-notification-template',
    name: 'Email Notification',
    description: 'Template for sending email notifications',
    category: 'notification',
    nodeType: 'n8n-nodes-base.emailSend',
    isDefault: true,
    config: {
      parameters: {
        to: '={{ $json.recipient }}',
        subject: '={{ $json.subject }}',
        text: '={{ $json.body }}'
      }
    }
  },
  {
    id: 'slack-notification-template',
    name: 'Slack Notification',
    description: 'Template for sending Slack notifications',
    category: 'notification',
    nodeType: 'n8n-nodes-base.slack',
    isDefault: true,
    config: {
      parameters: {
        resource: 'message',
        channel: '={{ $json.channel }}',
        text: '={{ $json.message }}'
      }
    }
  },
  {
    id: 'schedule-trigger-template',
    name: 'Schedule Trigger',
    description: 'Template for triggering workflows on a schedule',
    category: 'automation',
    nodeType: 'n8n-nodes-base.scheduleTrigger',
    isDefault: true,
    config: {
      parameters: {
        interval: [
          {
            field: 'hours',
            value: 1
          }
        ]
      }
    }
  },
  {
    id: 'webhook-trigger-template',
    name: 'Webhook Trigger',
    description: 'Template for triggering workflows via webhook',
    category: 'automation',
    nodeType: 'n8n-nodes-base.webhook',
    isDefault: true,
    config: {
      parameters: {
        path: 'webhook',
        responseMode: 'onReceived',
        options: {}
      }
    }
  },
  {
    id: 'error-handler-template',
    name: 'Error Handler',
    description: 'Template for handling errors in workflows',
    category: 'automation',
    nodeType: 'n8n-nodes-base.if',
    isDefault: true,
    config: {
      parameters: {
        conditions: {
          string: [
            {
              value1: '={{ $json.error }}',
              operation: 'exists'
            }
          ]
        }
      }
    }
  }
];
