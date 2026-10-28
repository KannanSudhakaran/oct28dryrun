import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import './db.js'; // loads env before anything else reads it
import { spec } from './swagger.js';
import routes from './routes.js';

const app = express();
app.use(cors()); // allow cross-origin requests (frontend runs on another port)
app.use(express.json());

// swagger-ui assets are loaded from a CDN because serverless can't serve them from node_modules
const CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(spec, {
  customCssUrl: `${CDN}/swagger-ui.css`,
  customJs: [`${CDN}/swagger-ui-bundle.js`, `${CDN}/swagger-ui-standalone-preset.js`],
}));
app.get('/', (req, res) => res.redirect('/swagger'));
app.use('/api', routes);

// Vercel imports the app as a serverless function; only listen when running locally
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API on http://localhost:${port}  |  Swagger: http://localhost:${port}/swagger`));
}

export default app;
