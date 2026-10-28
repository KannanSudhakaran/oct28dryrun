import { Router } from 'express';
import { customers } from './db.js';
import { askAgent } from './agent.js';

const r = Router();
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: e.message });
  });
const idOf = (req) => Number.parseInt(req.params.id, 10);

/**
 * @openapi
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers (optionally filter by ?name=)
 *     parameters:
 *       - { in: query, name: name, schema: { type: string } }
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/Customer' } }
 *   post:
 *     tags: [Customers]
 *     summary: Add a customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CustomerInput' }
 *     responses:
 *       201: { description: Created }
 */
r.get('/customers', wrap(async (req, res) => {
  const { name } = req.query;
  res.json(name ? await customers.searchByName(name) : await customers.list());
}));

r.post('/customers', wrap(async (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json(await customers.create(req.body));
}));

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get a customer by id
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: OK }, 404: { description: Not found } }
 *   put:
 *     tags: [Customers]
 *     summary: Update a customer
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CustomerInput' }
 *     responses: { 200: { description: OK }, 404: { description: Not found } }
 *   delete:
 *     tags: [Customers]
 *     summary: Delete a customer
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses: { 200: { description: Deleted }, 404: { description: Not found } }
 */
r.get('/customers/:id', wrap(async (req, res) => {
  const c = await customers.get(idOf(req));
  c ? res.json(c) : res.status(404).json({ error: 'Customer not found' });
}));

r.put('/customers/:id', wrap(async (req, res) => {
  const c = await customers.update(idOf(req), req.body ?? {});
  c ? res.json(c) : res.status(404).json({ error: 'Customer not found' });
}));

r.delete('/customers/:id', wrap(async (req, res) => {
  const c = await customers.remove(idOf(req));
  c ? res.json(c) : res.status(404).json({ error: 'Customer not found' });
}));

/**
 * @openapi
 * /api/agent:
 *   post:
 *     tags: [Agent]
 *     summary: Ask a natural-language question about customers
 *     description: Examples - get all customers, find customer John, add customer Sara with email sara@example.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               history: { type: array, items: { type: object } }
 *     responses:
 *       200: { description: Agent reply }
 */
r.post('/agent', wrap(async (req, res) => {
  const { message, history } = req.body ?? {};
  if (!message) return res.status(400).json({ error: 'message is required' });
  res.json({ reply: await askAgent(message, history) });
}));

export default r;
