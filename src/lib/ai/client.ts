import Anthropic from "@anthropic-ai/sdk";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
  buildKeywordExtractionPrompt,
  buildKeywordUserPrompt,
} from "./prompts";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return new Anthropic({ apiKey });
}

interface ImageInput {
  data: string;
  media_type: string;
}

export async function streamAnalysis(
  rawInput: string,
  onDelta: (text: string) => void,
  image?: ImageInput,
  existingContext?: string
): Promise<string> {
  const client = getClient();

  const textPrompt = buildAnalysisUserPrompt(rawInput, existingContext);

  const userContent: Anthropic.MessageParam["content"] = image
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.media_type as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: image.data,
          },
        },
        { type: "text", text: textPrompt },
      ]
    : textPrompt;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  let accumulated = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      accumulated += event.delta.text;
      onDelta(event.delta.text);
    }
  }

  return accumulated;
}

export async function extractKeywords(
  analysisJson: string,
  existingKeywords: string[]
): Promise<{ name: string; category: string }[]> {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: buildKeywordExtractionPrompt(existingKeywords),
    messages: [
      { role: "user", content: buildKeywordUserPrompt(analysisJson) },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return [];
  }
}
