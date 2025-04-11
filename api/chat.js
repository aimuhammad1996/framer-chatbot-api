export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { message, session_id } = req.body;
    if (!message || !session_id) {
      return res.status(400).json({ error: 'Missing input' });
    }

    const memoryKey = `chat_memory_${session_id}`;
    globalThis.memory = globalThis.memory || {};
    globalThis.memory[memoryKey] = globalThis.memory[memoryKey] || [];

    globalThis.memory[memoryKey].push({ role: "user", content: message });

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: globalThis.memory[memoryKey],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Something went wrong.";

    globalThis.memory[memoryKey].push({ role: "assistant", content: reply });

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
