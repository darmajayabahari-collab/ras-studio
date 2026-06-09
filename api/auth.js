export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, name, email, password } = req.body || {};

  if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  if (!email.includes('@')) return res.status(400).json({ error: 'Format email tidak valid.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  if (action === 'register' && (!name || name.trim().length < 2)) return res.status(400).json({ error: 'Nama minimal 2 karakter.' });

  return res.status(200).json({ ok: true, action });
}
