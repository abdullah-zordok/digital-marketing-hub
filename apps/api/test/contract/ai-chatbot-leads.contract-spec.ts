import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface ContractOperation {
  security?: unknown;
  responses: Record<string, unknown>;
}

describe('ai chatbot and leads contract', () => {
  const contractPath = join(__dirname, '../../../../specs/003-ai-chatbot-leads/contracts/ai-chatbot-leads.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each([
    ['/chatbot/sessions', 'post'],
    ['/chatbot/sessions/{sessionId}/messages', 'post'],
    ['/chatbot/sessions/{sessionId}/messages', 'get'],
    ['/leads', 'post'],
  ])('documents public route %s %s', (routePath, method) => {
    const operation = contractDocument.paths[routePath][method] as ContractOperation;
    expect(operation.responses).toBeDefined();
    expect(operation.security).toBeUndefined();
  });

  it.each([
    '/admin/knowledge-base',
    '/admin/knowledge-base/{id}',
    '/admin/knowledge-base/{id}/activate',
    '/admin/knowledge-base/{id}/archive',
    '/admin/leads',
    '/admin/leads/{id}',
    '/admin/leads/{id}/status',
  ])('documents protected route %s', (routePath) => {
    const methods = Object.values(contractDocument.paths[routePath]) as ContractOperation[];
    expect(methods.every((operation) => operation.security)).toBe(true);
  });

  it('documents rate limiting for chatbot messages', () => {
    const operation = contractDocument.paths['/chatbot/sessions/{sessionId}/messages'].post as ContractOperation;
    expect(operation.responses['429']).toBeDefined();
  });
});
