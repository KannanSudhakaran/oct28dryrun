import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'node:url';

// absolute path: cwd differs on Vercel, so a relative glob finds no files
const routesFile = fileURLToPath(new URL('./routes.js', import.meta.url));

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
  apis: [routesFile],
});
