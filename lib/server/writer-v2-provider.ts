export type WriterV2ProviderResult = { value: unknown; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }; model: string; responseId: string | null };

const schema = { type: 'object', additionalProperties: false, required: ['message'], properties: { message: { type: 'string', minLength: 1, maxLength: 1400 } } };

export async function requestWriterV2Json(options: { model: string; system: string; user: string; maxOutputTokens: number }): Promise<WriterV2ProviderResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('writer_v2_llm_not_configured');
  const response = await fetch(process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: options.model, max_completion_tokens: options.maxOutputTokens, messages: [{ role: 'system', content: options.system }, { role: 'user', content: options.user }], response_format: { type: 'json_schema', json_schema: { name: 'nia_writer_v2', strict: true, schema } }, ...(options.model === 'gpt-6.1-sol' ? { reasoning_effort: 'low' } : {}) }),
    signal: AbortSignal.timeout(45_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`writer_v2_http_${response.status}`);
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('writer_v2_empty_response');
  return { value: JSON.parse(content), usage: payload.usage, model: typeof payload.model === 'string' ? payload.model : options.model, responseId: typeof payload.id === 'string' ? payload.id : null };
}
