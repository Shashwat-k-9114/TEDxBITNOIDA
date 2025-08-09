// pages/api/proxy.js (Next.js)
// or api/proxy.js (Vercel Serverless)

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read raw request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString();

    // Your Google Apps Script endpoint
    const gScriptUrl =
      'https://script.google.com/macros/s/AKfycbw_RrPUeTmQGvlbBiAzuPeALP99Jft11g7ha7xlGzavQKB3LsfMXlDudsf4RtTT8KgjgA/exec';

    // Forward request to Google Apps Script
    const url = gScriptUrl + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');

    const gRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody
    });

    // Get response from Google Apps Script
    const text = await gRes.text();

    // Allow browser access
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Try returning JSON if possible
    try {
      const json = JSON.parse(text);
      res.status(gRes.status).json(json);
    } catch {
      res.status(gRes.status).send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
}
