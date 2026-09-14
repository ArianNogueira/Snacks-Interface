const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const ts = require('typescript');
const { resolve } = require('node:path');
const Module = require('node:module');
// Compile the real adapter in memory; all HTTP below is mocked.
const filename = resolve(__dirname, '../src/lib/pagbank.ts');
const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const adapter = new Module(filename, module);
adapter.filename = filename;
adapter.paths = module.paths;
adapter._compile(compiled, filename);
const { validSignature, verifiedCharge, chargeStatus, pixEnabled, pagbankRequest } = adapter.exports;

test('webhook uses exact raw bytes and rejects absent, malformed or forged signatures', () => {
  const body = '{"id":"ORDE_test"}';
  const hash = createHash('sha256').update(`secret-${body}`).digest('hex');
  assert.equal(validSignature(body, hash, 'secret'), true);
  assert.equal(validSignature(body + ' ', hash, 'secret'), false);
  assert.equal(validSignature(body, hash, 'wrong'), false);
  for (const value of [null, '', 'abc', 'g'.repeat(64)]) assert.equal(validSignature(body, value, 'secret'), false);
});
const charge = { id: 'CHAR_test', reference_id: 'ref', status: 'PAID',
  amount: { value: 5000, currency: 'BRL', summary: { paid: 5000, refunded: 0 } },
  payment_method: { type: 'PIX' } };
test('approval requires matching reference, amount, currency and payment method', () => {
  const order = { id: 'ORDE_test', reference_id: 'ref', charges: [charge] };
  assert.equal(verifiedCharge(order, 'ref', 5000), charge);
  assert.throws(() => verifiedCharge(order, 'other', 5000));
  assert.throws(() => verifiedCharge(order, 'ref', 100));
  for (const patch of [{ amount: { ...charge.amount, currency: 'USD' } }, { payment_method: { type: 'CREDIT_CARD' } }]) {
    assert.throws(() => verifiedCharge({ ...order, charges: [{ ...charge, ...patch }] }, 'ref', 5000));
  }
});
test('paid after expiry remains paid, partial payments are not approved, refunds are recorded', () => {
  const past = '2000-01-01T00:00:00Z';
  assert.equal(chargeStatus(charge, past), 'paid');
  assert.equal(chargeStatus({ ...charge, status: 'WAITING' }, past), 'expired');
  assert.equal(chargeStatus({ ...charge, amount: { ...charge.amount, summary: { paid: 4999, refunded: 0 } } }, '2099-01-01'), 'pending');
  assert.equal(chargeStatus({ ...charge, amount: { ...charge.amount, summary: { paid: 5000, refunded: 100 } } }, past), 'refunded');
});
test('integration defaults to disabled', () => {
  const previous = process.env.PAGBANK_PIX_ENABLED;
  delete process.env.PAGBANK_PIX_ENABLED;
  assert.equal(pixEnabled(), false);
  if (previous !== undefined) process.env.PAGBANK_PIX_ENABLED = previous;
});
test('retries preserve idempotency key and payload; provider errors do not leak details', async () => {
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ id: 'ORDE_test' }) }; };
  try {
    const payload = { reference_id: 'same', charges: [] };
    await pagbankRequest('/orders', payload, 'same');
    await pagbankRequest('/orders', payload, 'same');
    assert.equal(calls[0].options.headers['x-idempotency-key'], calls[1].options.headers['x-idempotency-key']);
    assert.equal(calls[0].options.body, calls[1].options.body);
    global.fetch = async () => ({ ok: false });
    await assert.rejects(pagbankRequest('/orders'), /Não foi possível consultar/);
  } finally { global.fetch = original; }
});
