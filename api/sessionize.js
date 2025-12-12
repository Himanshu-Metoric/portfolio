export default async function handler(req, res) {
  const target = 'https://sessionize.com/api/speaker/json/wmcraxy4nq';
  try {
    const fetchFn = global.fetch || (await import('node-fetch')).then(m => m.default);
    const r = await fetchFn(target);
    const text = await r.text();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(r.status).send(text);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: err.message });
  }
}
