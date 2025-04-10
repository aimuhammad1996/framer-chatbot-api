import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { message, session_id } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ error: "Missing input" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: pastMessages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("session_id", session_id)
    .order("created_at", { ascending: true });

  const messages = pastMessages || [];
  messages.push({ role: "user", content: message });

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
    }),
  });

  const data = await openaiRes.json();
  const reply = data.choices?.[0]?.message?.content || "Something went wrong.";

  await supabase.from("messages").insert([
    { session_id, role: "user", content: message },
    { session_id, role: "assistant", content: reply },
  ]);

  res.status(200).json({ reply });
}
