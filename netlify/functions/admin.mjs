export default async (req, context) => {
  const h = { 'Content-Type': 'application/json' };
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return new Response(JSON.stringify({ error: 'Admin password not configured.' }), { status: 500, headers: h });
    if (password === adminPassword) return new Response(JSON.stringify({ success: true, token: adminPassword }), { headers: h });
    return new Response(JSON.stringify({ success: false, message: 'Incorrect password.' }), { status: 401, headers: h });
  } catch (e) { return new Response(JSON.stringify({ success: false, message: 'Auth error.' }), { status: 500, headers: h }); }
};

export const config = { path: '/api/admin' };
