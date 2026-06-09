export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, model, width, height, seed } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const HF_TOKEN = process.env.HF_TOKEN;
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.slice(0, 800),
          num_inference_steps: 4,
          width: width || 1024,
          height: height || 1024
        }),
        signal: AbortSignal.timeout(60000)
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'HTTP ' + response.status }));
      return res.status(502).json({ error: err.error || 'Generation failed' });
    }

    const data = await response.json();
    const b64 = data.images?.[0]?.b64_json || data.data?.[0]?.b64_json;
    if (!b64) return res.status(502).json({ error: 'No image returned' });

    return res.status(200).json({ image: b64 });

  } catch(err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
