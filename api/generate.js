export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, negative, model = 'flux', width = 1024, height = 1024, seed } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const finalSeed = seed || Math.floor(Math.random() * 999999);
    const params = new URLSearchParams({
      model, width: String(width), height: String(height),
      seed: String(finalSeed), nologo: 'true'
    });
    if (negative) params.append('negative', negative);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0,1000))}?${params}`;
    return res.status(200).json({ url: imageUrl });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}