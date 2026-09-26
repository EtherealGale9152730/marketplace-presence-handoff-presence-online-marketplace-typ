import assert from "node:assert/strict";
import { handoffOrder } from "../src/marketplace_presence.ts";

const calls: string[] = [];
const fake = {
  async createChannel(channel: string) { calls.push(`create:${channel}`); },
  async publishHandoff(input: { orderId: string }) { calls.push(`publish:${input.orderId}`); },
  async presence(channel: string) { calls.push(`presence:${channel}`); return ["seller-42", "buyer-17"]; }
};
const result = await handoffOrder(fake as never, { channel: "orders", sellerAccount: "seller-42", buyerAccount: "buyer-17", orderId: "o-1", note: "ready" });
assert.deepEqual(calls, ["create:orders", "publish:o-1", "presence:orders"]);
assert.deepEqual(result, { orderId: "o-1", online: ["seller-42", "buyer-17"] });
console.log("presence handoff test passed");
