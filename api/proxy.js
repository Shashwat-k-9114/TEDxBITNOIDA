// api/proxy.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your Google Apps Script endpoint
  const gScriptUrl = 'https://script.google.com/macros/s/AKfycbw_RrPUeTmQGvlbBiAzuPeALP99Jft11g7ha7xlGzavQKB3LsfMXlDudsf4RtTT8KgjgA/exec';

  try {
    // Handle GET requests for registration count
    if (req.method === 'GET') {
      const urlParams = new URLSearchParams(req.query);
      const url = `${gScriptUrl}?${urlParams.toString()}`;
      
      const gRes = await fetch(url);
      const text = await gRes.text();
      
      try {
        const json = JSON.parse(text);
        return res.status(gRes.status).json(json);
      } catch {
        return res.status(gRes.status).json({ 
          success: false, 
          error: 'Invalid JSON response',
          rawResponse: text 
        });
      }
    }

    // Handle POST requests
    if (req.method === 'POST') {
      // Read raw request body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString();

      // Forward request to Google Apps Script
      const gRes = await fetch(gScriptUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: rawBody
      });

      // Get response from Google Apps Script
      const text = await gRes.text();

      // Try returning JSON if possible
      try {
        const json = JSON.parse(text);
        return res.status(gRes.status).json(json);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        // If it's not JSON, wrap it in a JSON object
        return res.status(gRes.status).json({ 
          success: false, 
          error: 'Invalid response format',
          rawResponse: text 
        });
      }
    }

    // Handle other methods
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}