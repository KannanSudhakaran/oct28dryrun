import swaggerJsdoc from 'swagger-jsdoc';

export const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Customer API', version: '1.0.0', description: 'Customer CRUD plus a natural-language agent' },
    components: {
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            customer_id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CustomerInput: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' } },
        },
      },
    },
  },
  apis: ['./src/routes.js'],
});
