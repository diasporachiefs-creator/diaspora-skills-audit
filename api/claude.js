// Place this file at:  api/claude.js  (repo root /api folder)
// In Vercel project settings, add an environment variable:
//   ANTHROPIC_API_KEY = your real key
// Then redeploy.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        ...req.body, // client can send max_tokens, system, messages (and override model if needed)
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Claude proxy error:", err);
    return res.status(500).json({ error: "Failed to reach Claude" });
  }
}
