// api/get-ip.js
export default async function handler(req, res) {
  // Hanya terima POST dari website kita
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');

    // Pastikan persetujuan eksplisit
    if (!body.consent) {
      return res.status(400).json({ error: 'Consent required' });
    }

    // Ambil IP dari header x-forwarded-for (Vercel memberikan ini), fallback ke socket remote
    const xff = req.headers['x-forwarded-for'];
    const ip = (typeof xff === 'string' ? xff.split(',')[0].trim() : null) || req.socket?.remoteAddress || null;

    // INFO: Di lingkungan produksi, Anda mungkin ingin normalisasi alamat IPv6 (::ffff:1.2.3.4) -> ipv4
    const normalizedIp = ip ? ip.replace(/^::ffff:/, '') : null;

    // Contoh payload yang akan disimpan
    const record = {
      ip: normalizedIp,
      obtainedAt: new Date().toISOString(),
      purpose: body.purpose || null,
      userAgent: req.headers['user-agent'] || null,
      // Jangan simpan personal info lain tanpa persetujuan
    };

    // -------------------------
    // SIMPAN KE DATABASE (CONTOH MONGODB)
    // -------------------------
    // Gunakan env var MONGODB_URI di Vercel (Settings > Environment Variables)
    // Jika Anda tidak memakai DB, Anda bisa mengirim ke logging service seperti Papertrail, Datadog, dsb.
    if (process.env.MONGODB_URI) {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || 'vercel-data');
      await db.collection('visitor_ips').insertOne(record);
      await client.close();
    } else {
      // Jika tidak ada DB, jangan gagal — cukup log di console (untuk debugging).
      console.log('[get-ip] record:', record);
    }

    // Balas ke client (tidak mengungkapkan lebih dari yang perlu)
    return res.status(200).json({ success: true, ip: normalizedIp ? normalizedIp : 'unknown' });
  } catch (err) {
    console.error('get-ip error', err);
    return res.status(500).json({ error: 'Server error' });
  }
                }
