export default async function handler(req, res) {
  const targetUrl = process.env.GAS_URL; // store in .env

  try {
    const gasRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded'
      },
      body: req.method === 'POST' ? await req.text() : undefined
    });

    const text = await gasRes.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    res.status(gasRes.status).send(text);

  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ success: false, error: err.message });
  }
}
