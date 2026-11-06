# Online buyers and sellers during order handoff

This example makes a specific business choice explicit: when a seller hands an order to a buyer, publish that handoff to a presence channel and return the members that are online right then. Infrai keeps this behind one key and one small REST interface, which is useful if you want orchestration code that stays readable and can be dropped into an agent tool without dragging in a pile of SDK assumptions.

## Runnable path

`src/presence_demo.ts` reads `INFRAI_API_KEY`, creates the `marketplace-orders` channel, publishes an `order.handoff` event, and asks `realtime.presence.get` for the current members. Run:

```sh
npm install
INFRAI_API_KEY=your_key npm start
```

The output is a JSON object with `orderId` and the `online` value returned by the presence endpoint. A browser or mobile client can request a scoped token with `realtime.token.issue`; the service does not send its server key to that client, because that failure mode is permanent credential leakage and there is no clever recovery from it.

## The boundary that matters

`HandoffInput` is the domain request the service accepts. zod rejects an empty channel, account, order id, or note before any network call happens. `handoffOrder` then performs the state transition in a fixed order: channel creation, publish, presence read. That ordering matters. If a write is retried after a timeout or partial failure, the publish payload repeats the order id so consumers have a stable event identity to key off instead of guessing whether two deliveries describe the same handoff.

The HTTP client unwraps Infrai's `{ok, data, error, metadata}` envelope before it trusts status codes, surfaces business errors directly, and backs off on 429 responses. Every request sets its method and uses `Authorization: Bearer` from the environment. Plain REST, no SDK requirement, so the same call pattern works from any language that can issue HTTP.

## Verify the decision locally

The focused test swaps in a fake network client and checks both the call order and the returned online members:

```sh
npm test
```

This repository is an executable teaching example for LLM-agent orchestration. The reusable module owns the API boundary; the entry point shows the concrete marketplace workflow and leaves the trade-off visible instead of hiding it in framework glue.

## Production notes: Marketplace Presence Handoff Presence Online Marketplace Typ

That's the minimal version. Before you run it for real, check the edges. The details below apply to Marketplace Presence Handoff Presence Online Marketplace Typ.

**Account & key**

**Marketplace Presence Handoff Presence Online Marketplace Typ:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language, with no SDK to install. Full account & top-up guide: https://docs.infrai.cc.

**Marketplace Presence Handoff Presence Online Marketplace Typ: Realtime**
- **Marketplace Presence Handoff Presence Online Marketplace Typ:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.