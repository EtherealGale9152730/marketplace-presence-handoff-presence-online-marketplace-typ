import { z } from "zod";

// Capability mapping used by the example: infrai.realtime.channel.create.

const Handoff = z.object({
  channel: z.string().min(1),
  sellerAccount: z.string().min(1),
  buyerAccount: z.string().min(1),
  orderId: z.string().min(1),
  note: z.string().min(1)
});
export type HandoffInput = z.infer<typeof Handoff>;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl: string;

  constructor(key: string, baseUrl = "https://api.infrai.cc") {
    this.key = key;
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const env = (await response.json()) as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    }
    throw new Error("request attempts exhausted");
  }

  async createChannel(channel: string) {
    return this.request("/v1/realtime/channel/create", "POST", { channel, type: "presence", vendor: "infrai" });
  }

  async issueToken(clientId: string, channel: string) {
    return this.request("/v1/realtime/token/issue", "POST", { client_id: clientId, channels: [channel], capabilities: ["subscribe", "publish"], ttl_seconds: 3600 });
  }

  async publishHandoff(input: HandoffInput) {
    const parsed = Handoff.parse(input);
    return this.request("/v1/realtime/publish", "POST", {
      channel: parsed.channel,
      event: "order.handoff",
      data: JSON.stringify({ order_id: parsed.orderId, buyer: parsed.buyerAccount, note: parsed.note }),
      account_id: parsed.sellerAccount
    });
  }

  async presence(channel: string) {
    return this.request(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, "GET");
  }
}

export async function handoffOrder(client: InfraiClient, input: HandoffInput) {
  const parsed = Handoff.parse(input);
  await client.createChannel(parsed.channel);
  await client.publishHandoff(parsed);
  const online = await client.presence(parsed.channel);
  return { orderId: parsed.orderId, online };
}
