import {
  createAgentKitHooks,
  createAgentBookVerifier,
  InMemoryStorage,
} from "@worldcoin/agentkit";
import { x402ResourceServer } from "@x402/server";
import { createThirdwebAI } from "@thirdweb-dev/ai-sdk-provider";
import { streamText } from "ai";

const agentBook = createAgentBookVerifier();
const storage = new InMemoryStorage();
const hooks = createAgentKitHooks({
  agentBook,
  storage,
  mode: "paid-only",
  freeUses: 0,
});

const thirdwebAI = createThirdwebAI({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

// 新增收費專用 chat handler
const paidChatHandler = async (req, res) => {
  try {
    const { messages } = req.body;
    const result = await streamText({
      model: thirdwebAI.chat({
        context: { chain_ids: [480] },
      }),
      tools: thirdwebAI.tools(),
      messages,
    });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } catch (err) {
    res.status(500).json({ error: err.message || "internal error" });
  }
};

const server = x402ResourceServer({
  endpoints: [
    {
      path: "/api/paid-chat",
      method: "POST",
      price: "0.05",
      currency: "USDC",
      chain: "world-chain",
      hooks,
      handler: paidChatHandler,
    },
  ],
  payee: "0x8bfe4647304e9564c48f4457e5082275f200042f",
});

server.listen(3000, () => {
  console.log(
    "x402 paid-only chat+收費啟動（/api/paid-chat） on port 3000；USDC 直達你的錢包",
  );
});
