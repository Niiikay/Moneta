export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { summary } = req.body
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in environment variables.' })
  }

  const prompt = `You are a sharp, direct personal finance coach analysing someone's monthly bank transactions.
Here is their spending summary:
${summary}
Give exactly 4 insights. Each insight must:
1. Reveal a NON-OBVIOUS pattern or behaviour (not just "you spent X on Y")
2. Include a specific dollar amount or percentage
3. End with one concrete action they can take THIS WEEK
Format your response as a JSON array of 4 objects, each with:
- "title": short punchy headline (max 6 words)
- "type": one of "pattern", "spike", "habit", "prediction"
- "insight": 2 sentences max, specific and direct
- "action": one sentence, starts with a verb, concrete and immediate
- "color": one of "red", "amber", "green", "blue", "purple"
Respond ONLY with the JSON array. No markdown, no preamble.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: 'Groq API error', detail: JSON.stringify(data) })
    }

    const text = data.choices?.[0]?.message?.content || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(clean)
    res.status(200).json({ insights })
  } catch (e) {
    res.status(500).json({ error: 'Failed to get insights from Groq.', detail: e.message })
  }
}
