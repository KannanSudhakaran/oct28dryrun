import Anthropic from '@anthropic-ai/sdk';
import { betaZodTool } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { customers } from './db.js';

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';

const json = (v) => JSON.stringify(v ?? null);

const tools = [
  betaZodTool({
    name: 'get_all_customers',
    description: 'List every customer in the database.',
    inputSchema: z.object({}),
    run: async () => json(await customers.list()),
  }),
  betaZodTool({
    name: 'get_customer_by_name',
    description: 'Find customers whose name contains the given text (case-insensitive).',
    inputSchema: z.object({ name: z.string() }),
    run: async ({ name }) => json(await customers.searchByName(name)),
  }),
  betaZodTool({
    name: 'get_customer_by_id',
    description: 'Get one customer by numeric customer_id.',
    inputSchema: z.object({ customer_id: z.number().int() }),
    run: async ({ customer_id }) => json(await customers.get(customer_id)),
  }),
  betaZodTool({
    name: 'add_customer',
    description: 'Add a new customer. Name is required; email and phone are optional.',
    inputSchema: z.object({ name: z.string(), email: z.string().optional(), phone: z.string().optional() }),
    run: async (input) => json(await customers.create(input)),
  }),
  betaZodTool({
    name: 'update_customer',
    description: 'Update fields of an existing customer by customer_id.',
    inputSchema: z.object({
      customer_id: z.number().int(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
    run: async ({ customer_id, ...rest }) => json(await customers.update(customer_id, rest)),
  }),
  betaZodTool({
    name: 'delete_customer',
    description: 'Delete a customer by customer_id.',
    inputSchema: z.object({ customer_id: z.number().int() }),
    run: async ({ customer_id }) => json(await customers.remove(customer_id)),
  }),
];

const SYSTEM = `You are a customer-data assistant. Use the provided tools to read and modify the customer table
(columns: customer_id, name, email, phone, created_at). Never invent data; answer from tool results.
Be concise. When listing customers, use a short readable format.`;

// history: prior [{role: 'user'|'assistant', content: string}] turns
export async function askAgent(message, history = []) {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const finalMessage = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: SYSTEM,
    tools,
    messages: [...history, { role: 'user', content: message }],
  });
  return finalMessage.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}
