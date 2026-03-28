import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = await streamText({
    model: "openai/gpt-4-turbo",
    messages,
  })
  return result.toUIMessageStreamResponse()
}
