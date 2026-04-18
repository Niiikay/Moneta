export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { summary, imageBase64, mediaType } = req.body
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in environment variables.' })
  }

  const insightPrompt = `You are a sharp, direct personal finance coach analysing someone's monthly bank transactions.
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

  const extractPrompt = `This is a bank statement. Extract all transactions and return ONLY a JSON array.
Each object must have: "date" (YYYY-MM-DD or as shown), "description" (merchant name), "amount" (negative number for debits).
Include only debit/expense transactions. Respond ONLY with the JSON array, no markdown, no preamble.`

  try {
    if (imageBase64 && mediaType) {
      const extractRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
              { type: 'text', text: extractPrompt }
            ]
          }],
          temperature: 0.1,
          max_tokens: 2000
        })
      })

      const extractData = await extractRes.json()
      if (!extractRes.ok) {
        return res.status(500).json({ error: 'Failed to extract transactions from image', detail: JSON.stringify(extractData) })
      }

      const extractedText = extractData.choices?.[0]?.message?.content || ''
      const cleanExtracted = extractedText.replace(/```json|```/g, '').trim()
      const transactions = JSON.parse(cleanExtracted)
      return res.status(200).json({ transactions })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: insightPrompt }],
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
