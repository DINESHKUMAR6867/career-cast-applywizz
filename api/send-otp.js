import { createClient } from '@supabase/supabase-js';

// --- Serverless Function: runs automatically on each request ---
export default async function handler(req, res) {
  // ✅ Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    // --- Supabase ---
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- Microsoft Graph API Setup ---
    const tenantId = process.env.MS365_TENANT_ID;
    const clientId = process.env.MS365_CLIENT_ID;
    const clientSecret = process.env.MS365_CLIENT_SECRET;
    const senderEmail = process.env.MS365_SENDER_EMAIL;

    // Get token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const tokenResp = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const { access_token } = await tokenResp.json();

    // Send mail
    const mailUrl = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;
    const mailBody = {
      message: {
        subject: 'Your CareerCast OTP',
        body: {
          contentType: 'HTML',
          content: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
        },
        toRecipients: [{ emailAddress: { address: email } }],
      },
      saveToSentItems: 'false',
    };

    await fetch(mailUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailBody),
    });

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
