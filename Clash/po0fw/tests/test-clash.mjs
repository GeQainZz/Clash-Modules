import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('po0-firewall-whitelist.js', root), 'utf8');
const statusSource = fs.readFileSync(new URL('po0-firewall-status.js', root), 'utf8');
const moduleText = fs.readFileSync(new URL('po0-firewall-whitelist.sgmodule', root), 'utf8');

async function run({ argument = 'tokens=pgnfw_test', state = new Map(), responder,
  name = 'po0-fw-panel', now = Date.now() } = {}) {
  const requests = [];
  const notices = [];
  const logs = [];
  let doneCount = 0;
  let settle;
  const done = new Promise(resolve => { settle = resolve; });
  const http = {
    post(options, callback) {
      assert.equal(this, http);
      requests.push(options);
      const response = responder?.(options, requests.length) ?? {
        status: 200,
        body: JSON.stringify({ enabled: true, currentIp: '203.0.113.0/24', limit: 5, whitelist: [{ ip: '203.0.113.0/24', slot: null }] }),
      };
      queueMicrotask(() => {
        if (response.error) callback(response.error, null, null);
        else callback(null, { status: response.status }, response.body);
      });
    },
    get() { assert.fail('The add flow should use POST'); },
  };
  const context = {
    $script: { name },
    Date: class extends Date {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return now; }
    },
    $environment: { 'surge-version': '1.0.15', 'surge-build': '198', system: 'iOS' },
    $argument: argument,
    $httpClient: http,
    $persistentStore: {
      read: key => state.get(key) ?? null,
      write: (value, key) => { state.set(key, value); return true; },
    },
    $notification: { post: (...values) => notices.push(values) },
    $done: result => { doneCount++; settle(result); },
    setTimeout: callback => queueMicrotask(callback),
    console: { log: (...values) => logs.push(values.join(' ')) },
  };
  vm.runInNewContext(source, context, { timeout: 1000 });
  const result = await done;
  assert.equal(doneCount, 1);
  return { result, requests, notices, state, logs };
}

test('Clash module supplies registration triggers and a separate read-only history panel', () => {
  assert.match(moduleText, /^#!arguments=tokens:""$/m);
  assert.match(moduleText, /IP-CIDR,124\.221\.69\.228\/32,DIRECT,no-resolve/);
  assert.match(moduleText, /type=cron, cronexp="\*\/10 \* \* \* \*"/);
  assert.match(moduleText, /type=event, event-name=network-changed/);
  assert.match(moduleText, /type=generic/);
  assert.equal(moduleText.match(/argument="tokens=\{\{\{tokens\}\}\}"/g)?.length, 3);
  assert.match(moduleText, /po0-fw-status = type=generic, script-path=.*po0-firewall-status\.js\?v=1\.0\.1/);
  assert.match(moduleText, /po0-fw-status = script-name=po0-fw-status/);
  assert.match(moduleText, /锁屏后台不保证按时运行/);
  assert.doesNotMatch(moduleText, /^\[MITM\]/mi);
});

test('registration forces direct HTTPS, uses seconds for Clash and returns a panel result', async () => {
  const { result, requests, notices, state } = await run();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://124.221.69.228/api/firewall/pgnfw_test/add');
  assert.equal(requests[0].policy, 'DIRECT');
  assert.equal(requests[0].timeout, 15);
  assert.equal(requests[0].body, '');
  assert.match(result.title, /1\/1/);
  assert.match(result.content, /203\.0\.113\.0\/24/);
  assert.equal(notices.length, 1);
  assert.ok([...state.keys()].every(key => key.startsWith('po0_clash_fw_')));
});

test('multiple tokens retain fixed-slot query and permit comma-separated input', async () => {
  const { requests, result } = await run({ argument: '"tokens=pgnfw_first@0,pgnfw_second"' });
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /pgnfw_first\/add\?slot=0$/);
  assert.match(requests[1].url, /pgnfw_second\/add$/);
  assert.ok(requests.every(request => request.policy === 'DIRECT'));
  assert.match(result.title, /2\/2/);
  assert.doesNotMatch(JSON.stringify(result), /pgnfw_first|pgnfw_second/);
});

test('unconfigured or invalid tokens do not send network requests', async () => {
  const empty = await run({ argument: 'tokens=' });
  assert.equal(empty.requests.length, 0);
  assert.match(empty.result.title, /未配置/);
  const invalid = await run({ argument: 'tokens=pgnfw_test@abc' });
  assert.equal(invalid.requests.length, 0);
  assert.match(invalid.result.content, /槽位号/);
});

test('retry transient failures and silence subsequent identical successes', async () => {
  const first = await run({ responder: (_request, number) => number < 3
    ? { status: 503, body: 'Unavailable' }
    : { status: 200, body: JSON.stringify({ enabled: true, currentIp: '203.0.113.0/24', whitelist: ['203.0.113.0/24'] }) } });
  assert.equal(first.requests.length, 3);
  assert.match(first.result.title, /1\/1/);
  const second = await run({ state: first.state });
  assert.equal(second.notices.length, 0);
  assert.equal(second.requests.length, 1);
});

test('report slot conflict once per run, and report disabled firewall', async () => {
  const conflict = await run({ responder: () => ({ status: 403, body: '{"currentIp":"203.0.113.0/24"}' }) });
  assert.equal(conflict.requests.length, 1);
  assert.match(conflict.result.content, /槽位冲突/);
  const disabled = await run({ responder: () => ({ status: 200, body: '{"enabled":false,"whitelist":[]}' }) });
  assert.match(disabled.result.content, /防火墙未启用/);
});

test('network failure retries, returns a useful panel error and redacts token paths', async () => {
  const failed = await run({ responder: options => ({ error: new Error('Request failed ' + options.url) }) });
  assert.equal(failed.requests.length, 3);
  assert.match(failed.result.content, /已重试/);
  assert.doesNotMatch(JSON.stringify([failed.result, failed.notices]), /pgnfw_test/);
  assert.match(failed.result.content, /已隐藏/);
  assert.doesNotMatch(JSON.stringify([...failed.state.values(), ...failed.logs]), /pgnfw_test/);
});

test('accept both exact IPv4 and normalized /24 in whitelist results', async () => {
  const { result } = await run({ responder: () => ({ status: 200, body: JSON.stringify({
    enabled: true, currentIp: '203.0.113.18', whitelist: [{ ip: '203.0.113.0/24', slot: 0 }], limit: 5,
  }) }) });
  assert.match(result.title, /1\/1/);
  assert.match(result.content, /📌0/);
});

test('history records quiet successes and keeps panel, cron and network runs separate', async () => {
  const first = await run({ name: 'po0-fw-cron', now: 1800000000000 });
  const second = await run({ state: first.state, name: 'po0-fw-cron', now: 1800000600000 });
  assert.equal(second.notices.length, 0);
  const cron = JSON.parse(second.state.get('po0_clash_fw_runs_cron'));
  assert.equal(cron.length, 2);
  assert.equal(cron[0].startedAt, 1800000600000);
  assert.equal(cron[0].finishedAt, 1800000600000);
  assert.equal(cron[0].ok, true);
  const savedCron = second.state.get('po0_clash_fw_runs_cron');
  await run({ state: second.state, name: 'po0-fw-event', now: 1800001200000 });
  await run({ state: second.state, now: 1800001800000 });
  assert.equal(second.state.get('po0_clash_fw_runs_cron'), savedCron);
  assert.equal(JSON.parse(second.state.get('po0_clash_fw_runs_network'))[0].source, 'network');
  assert.equal(JSON.parse(second.state.get('po0_clash_fw_runs_panel'))[0].source, 'panel');
});

test('history persists a pending start before HTTP and bounds its retained runs', async () => {
  const state = new Map();
  await run({ state, name: 'po0-fw-cron', now: 1800000000000, responder: () => {
    const pending = JSON.parse(state.get('po0_clash_fw_runs_cron'))[0];
    assert.equal(pending.finishedAt, null);
    assert.equal(pending.ok, null);
  } });
  for (let i = 1; i < 8; i++) await run({ state, name: 'po0-fw-cron', now: 1800000000000 + i * 600000 });
  const history = JSON.parse(state.get('po0_clash_fw_runs_cron'));
  assert.equal(history.length, 6);
  assert.equal(history[0].startedAt, 1800004200000);
});

test('status refresh reads history without registering IPs, changing state or exposing tokens', () => {
  const state = new Map([
    ['po0_clash_fw_runs_cron', JSON.stringify([{ source: 'cron', startedAt: 1800000000000,
      finishedAt: 1800000001000, ok: true, summary: '加白成功' }])],
    ['po0_clash_fw_runs_network', JSON.stringify([{ source: 'network', startedAt: 1800000600000,
      finishedAt: null, ok: null, summary: 'pgnfw_fake' }])],
    ['po0_clash_fw_runs_panel', '{broken'],
  ]);
  const before = JSON.stringify([...state]);
  let result;
  vm.runInNewContext(statusSource, {
    $persistentStore: {
      read: key => state.get(key),
      write: () => assert.fail('Status panel must be read-only'),
    },
    $httpClient: { post: () => assert.fail('Status must not register IPs') },
    $done: value => { result = value; },
  }, { timeout: 1000 });
  assert.match(result.content, /定时脚本/);
  assert.match(result.content, /切网脚本/);
  assert.match(result.content, /未记录完成/);
  assert.doesNotMatch(result.content, /pgnfw_fake/);
  assert.ok(result.content.indexOf('切网脚本') < result.content.indexOf('定时脚本'));
  assert.equal(JSON.stringify([...state]), before);
});
