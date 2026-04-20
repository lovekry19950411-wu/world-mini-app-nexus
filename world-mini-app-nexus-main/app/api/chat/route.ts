import { createThirdwebAI } from "@thirdweb-dev/ai-sdk-provider";
import { streamText } from "ai";

const thirdwebAI = createThirdwebAI({
  // 金鑰只會從「環境變數」讀取，這裡完全不會出現你的 key
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: thirdwebAI.chat({
      context: {
        chain_ids: [480], // 運行於 World Chain 主網
      },
    }),
    tools: thirdwebAI.tools(),
    messages,
  });

  return result;
}
