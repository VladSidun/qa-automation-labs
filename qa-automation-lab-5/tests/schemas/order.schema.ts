export const orderSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'tier', 'items', 'subtotal', 'total', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    tier: { type: 'string', enum: ['basic', 'silver', 'gold'] },
    subtotal: { type: 'number', minimum: 0 },
    total: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['sku', 'price', 'qty'],
        properties: {
          sku: {
            type: 'string',
            pattern: '^[A-Z]{3}-[0-9]{4}$',
            minLength: 8,
            maxLength: 8,
          },
          price: { type: 'number', minimum: 0 },
          qty: { type: 'integer', minimum: 1 },
        },
      },
    },
  },
} as const;
export const errorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['code'],
  properties: { code: { type: 'string', minLength: 1 } },
} as const;
