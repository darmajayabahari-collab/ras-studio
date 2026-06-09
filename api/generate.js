export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, negative, model = 'flux', width = 1024, height = 1024, seed } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cleanPrompt = prompt.trim().slice(0, 1800);
    const finalSeed = seed || Math.floor(Math.random() * 999999);

    const params = new URLSearchParams({
      model, width: String(width), height: String(height),
      seed: String(finalSeed), nologo: 'true', enhance: 'true', safe: 'false'
    });
    if (negative && negative.trim()) params.append('negative', negative.trim());

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?${params.toString()}`;
    const imageRes = await fetch(url, {
      headers: { 'User-Agent': 'RAS-Studio/1.0' },
      signal: AbortSignal.timeout(60000)
    });

    if (!imageRes.ok) return res.status(502).json({ error: `Upstream error: ${imageRes.status}` });

    const buffer = await imageRes.arrayBuffer();
    res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    if (err.name === 'TimeoutError') return res.status(504).json({ error: 'Timeout. Coba lagi.' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
