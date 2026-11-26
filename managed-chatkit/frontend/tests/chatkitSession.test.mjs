import assert from "node:assert/strict";
import process from "node:process";
import { after, before, test } from "node:test";
import { createServer } from "vite";

let server;
let createClientSecretFetcher;

before(async () => {
  const previous = process.env.VITE_CHATKIT_WORKFLOW_ID;
  process.env.VITE_CHATKIT_WORKFLOW_ID = "wf_test";
  try {
    server = await createServer({
      configFile: false,
      envFile: false,
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
      appType: "custom",
    });
    ({ createClientSecretFetcher } = await server.ssrLoadModule(
      "/src/lib/chatkitSession.ts"
    ));
  } finally {
    if (previous === undefined) {
      delete process.env.VITE_CHATKIT_WORKFLOW_ID;
    } else {
      process.env.VITE_CHATKIT_WORKFLOW_ID = previous;
    }
  }
});

after(async () => {
  await server?.close();
});

test("requests a fresh client secret on initial load and refresh", async (t) => {
  const secrets = ["initial-secret", "refreshed-secret"];
  const fetch = t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ client_secret: secrets.shift() }),
  }));

  const getClientSecret = createClientSecretFetcher("wf_test");
  const initial = await getClientSecret(null);
  const refreshed = await getClientSecret(initial);

  assert.equal(initial, "initial-secret");
  assert.equal(refreshed, "refreshed-secret");
  assert.equal(fetch.mock.callCount(), 2);
  for (const call of fetch.mock.calls) {
    assert.deepEqual(call.arguments, [
      "/api/create-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: { id: "wf_test" } }),
      },
    ]);
  }
});

test("reports failed refreshes instead of returning an expired secret", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: false,
    json: async () => ({ error: "Session creation failed" }),
  }));
  await assert.rejects(
    createClientSecretFetcher("wf_test")("expired-secret"),
    /Session creation failed/
  );
});

test("rejects a refresh response without a client secret", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({}),
  }));
  await assert.rejects(
    createClientSecretFetcher("wf_test")("expired-secret"),
    /Missing client secret/
  );
});
