export default async function handler(req, res) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  // Handle POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const { message, session_id } = req.body

    if (!message || !session_id) {
      return res.status(400).json({ error: 'Missing input' })
    }

    // Replace this with actual OpenAI or Supabase logic
    const reply = `You said: ${message}`

    return res.status(200).json({ reply })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
