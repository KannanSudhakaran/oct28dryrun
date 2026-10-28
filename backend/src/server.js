import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import './db.js'; // loads env before anything else reads it
import { spec } from './swagger.js';
import routes from './routes.js';

const app = express();
app.use(cors()); // allow cross-origin requests (frontend runs on another port)
app.use(express.json());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/', (req, res) => res.redirect('/swagger'));
app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}  |  Swagger: http://localhost:${port}/swagger`));
