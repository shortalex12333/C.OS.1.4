## 8. Integration with n8n

### n8n Custom Node - `/n8n/OracleNode.js`
```javascript
// CELESTE7 Oracle Node for n8n
// Place this in your n8n custom nodes directory

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class Celeste7Oracle implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'CELESTE7 Oracle',
    name: 'celeste7Oracle',
    group: ['transform'],
    version: 1,
    description: 'Behavioral intelligence for CELESTE7',
    defaults: {
      name: 'CELESTE7 Oracle',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'celeste7OracleApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Analyze',
            value: 'analyze',
            description: 'Analyze message for behavioral patterns',
          },
          {
            name: 'Enhance',
            value: 'enhance',
            description: 'Enhance AI response with behavioral insights',
          },
          {
            name: 'Feedback',
            value: 'feedback',
            description: 'Send feedback for continuous learning',
          },
        ],
        default: 'analyze',
      },
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        default: '={{ $json.userId }}',
        description: 'User identifier',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        required: true,
        default: '={{ $json.message }}',
        description: 'User message to analyze',
        displayOptions: {
          show: {
            operation: ['analyze', 'enhance'],
          },
        },
      },
      {
        displayName: 'AI Response',
        name: 'aiResponse',
        type: 'string',
        required: true,
        default: '={{ $json.aiResponse }}',
        description: 'Original AI response to enhance',
        displayOptions: {
          show: {
            operation: ['enhance'],
          },
        },
      },
      {
        displayName: 'Enhancement ID',
        name: 'enhancementId',
        type: 'string',
        required: true,
        default: '={{ $json.enhancementId }}',
        description: 'ID from previous enhancement',
        displayOptions: {
          show: {
            operation: ['feedback'],
          },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['analyze', 'enhance'],
          },
        },
        options: [
          {
            displayName: 'Business Type',
            name: 'businessType',
            type: 'options',
            options: [
              { name: 'Solopreneur', value: 'solopreneur' },
              { name: 'Agency', value: 'agency' },
              { name: 'SaaS', value: 'saas' },
              { name: 'E-commerce', value: 'ecommerce' },
              { name: 'Consulting', value: 'consulting' },
            ],
            default: 'solopreneur',
          },
          {
            displayName: 'Energy Level',
            name: 'energyLevel',
            type: 'options',
            options: [
              { name: 'High', value: 'high' },
              { name: 'Medium', value: 'medium' },
              { name: 'Low', value: 'low' },
            ],
            default: 'medium',
          },
          {
            displayName: 'Session ID',
            name: 'sessionId',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Trust Level',
            name: 'trustLevel',
            type: 'number',
            default: 5,
            typeOptions: {
              minValue: 1,
              maxValue: 10,
            },
          },
        ],
      },
      {
        displayName: 'Feedback',
        name: 'feedback',
        type: 'collection',
        placeholder: 'Add Feedback',
        required: true,
        default: {},
        displayOptions: {
          show: {
            operation: ['feedback'],
          },
        },
        options: [
          {
            displayName: 'Engaged',
            name: 'engaged',
            type: 'boolean',
            default: false,
            description: 'Whether user engaged with enhancement',
          },
          {
            displayName: 'Helpful',
            name: 'helpful',
            type: 'boolean',
            default: false,
            description: 'Whether enhancement was helpful',
          },
          {
            displayName: 'Action Taken',
            name: 'actionTaken',
            type: 'boolean',
            default: false,
            description: 'Whether user took suggested action',
          },
          {
            displayName: 'Business Impact',
            name: 'businessImpact',
            type: 'options',
            options: [
              { name: 'Positive', value: 'positive' },
              { name: 'Neutral', value: 'neutral' },
              { name: 'Negative', value: 'negative' },
            ],
            default: 'neutral',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('celeste7OracleApi');
    const operation = this.getNodeParameter('operation', 0) as string;

    const apiUrl = credentials.apiUrl as string || 'https://api.celeste7.com';
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const userId = this.getNodeParameter('userId', i) as string;
        let body: any = {};
        let endpoint = '';

        switch (operation) {
          case 'analyze':
            endpoint = '/api/analyze';
            body = {
              userId,
              message: this.getNodeParameter('message', i) as string,
              context: this.getNodeParameter('additionalFields', i) as object,
            };
            break;

          case 'enhance':
            endpoint = '/api/enhance';
            body = {
              userId,
              message: this.getNodeParameter('message', i) as string,
              aiResponse: this.getNodeParameter('aiResponse', i) as string,
              context: this.getNodeParameter('additionalFields', i) as object,
            };
            break;

          case 'feedback':
            endpoint = '/api/feedback';
            body = {
              userId,
              enhancementId: this.getNodeParameter('enhancementId', i) as string,
              feedback: this.getNodeParameter('feedback', i) as object,
            };
            break;
        }

        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${apiUrl}${endpoint}`,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body,
          json: true,
        });

        returnData.push({
          json: response,
          pairedItem: i,
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: i,
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error);
      }
    }

    return [returnData];
  }
}