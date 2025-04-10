export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  let body = {}
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON body" })
  }

  const { message, session_id } = body || {}

  if (!message || !session_id) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      })
    })

    const data = await openaiRes.json()
    const reply = data.choices?.[0]?.message?.content ?? "Something went wrong"

    res.status(200).json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "OpenAI request failed" })
  }
}
