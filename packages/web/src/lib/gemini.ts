// Direct browser → Gemini API call (BYOK). This is the ONLY network destination
// in the app. No proxy, no Start-X backend, no telemetry.
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const DEFAULT_MODEL = "gemini-2.5-flash";

export async function generateText(
  prompt: string,
  apiKey: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "Gemini API キーが未設定です（設定画面で入力してください）。",
    );
  }
  const url = `${GEMINI_ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Gemini API error (${res.status}): ${detail.slice(0, 300)}`,
    );
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("");
  return text ?? "";
}

export const GEMINI_MODEL_LABEL = DEFAULT_MODEL;
