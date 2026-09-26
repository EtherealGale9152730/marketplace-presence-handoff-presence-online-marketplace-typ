import { InfraiClient, handoffOrder } from "./marketplace_presence.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the demo");
const client = new InfraiClient(key);
const result = await handoffOrder(client, {
  channel: "marketplace-orders",
  sellerAccount: "seller-42",
  buyerAccount: "buyer-17",
  orderId: "order-9001",
  note: "Buyer is ready for the seller handoff"
});
console.log(JSON.stringify(result, null, 2));
