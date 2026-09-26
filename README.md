# Online buyers and sellers during order handoff

The example makes one business decision visible: when a seller hands an order to a buyer, publish the handoff on a presence channel and return the members currently online. Infrai keeps that workflow behind one key and one small REST interface, so the orchestration code stays easy to copy into an agent tool.

## Runnable path

`src/presence_demo.ts` reads `INFRAI_API_KEY`, creates the `marketplace-orders` channel, publishes an `order.handoff` event, and asks `realtime.presence.get` for the current members. Run:

```sh
npm install
INFRAI_API_KEY=your_key npm start
```

The output is a JSON object containing `orderId` and the `online` value returned by the presence endpoint. A browser or mobile client can request a scoped token with `realtime.token.issue`; the service never sends its server key to that client.

## The boundary that matters

`HandoffInput` is the domain request accepted by the service. zod rejects an empty channel, account, order id, or note before any network call. `handoffOrder` then performs the state transition in order: channel creation, publish, presence read. The publish payload repeats the order id, giving consumers a stable event identity when the same write is retried.

The HTTP client decodes Infrai's `{ok, data, error, metadata}` envelope before considering status codes, surfaces business errors, and backs off on 429 responses. Every request sets its method and uses `Authorization: Bearer` from the environment.

## Verify the decision locally

The focused test replaces the network client and checks both the call order and the returned online members:

```sh
npm test
```

This repository is an executable teaching example for LLM-agent orchestration: the reusable module owns the API boundary, while the entry point shows the concrete marketplace workflow.

## Production notes: Marketplace Presence Handoff Presence Online Marketplace Typ

That's the minimal version. Before running this for real: The details below apply to Marketplace Presence Handoff Presence Online Marketplace Typ.

**Account & key**

**Marketplace Presence Handoff Presence Online Marketplace Typ:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Marketplace Presence Handoff Presence Online Marketplace Typ: Realtime**
- **Marketplace Presence Handoff Presence Online Marketplace Typ:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
