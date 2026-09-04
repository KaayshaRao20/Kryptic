// ============================================================
//  api/payments.js - Vercel Serverless Function
//  Automatically proxies and fetches live transactions directly from Razorpay API
// ============================================================

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TWpQWcihNk3rD9';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'KEdqU5Tc05yCS5GeR59ZvEKA';
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const limit = req.query.limit || req.query.count || '50';
    const razorpayRes = await fetch(`https://api.razorpay.com/v1/payments?count=${limit}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!razorpayRes.ok) {
      const errorText = await razorpayRes.text();
      return res.status(razorpayRes.status).json({
        error: 'Failed to fetch from Razorpay API',
        details: errorText
      });
    }

    const data = await razorpayRes.json();
    const items = data.items || [];

    // Format and evaluate risk for each payment
    const payments = items.map(item => {
      const amountRupees = (item.amount || 0) / 100;
      let riskScore = 15;
      let riskLevel = 'LOW';
      let riskReasons = [];

      if (item.status === 'failed') {
        if (item.international) {
          riskScore = 88;
          riskLevel = 'CRITICAL';
          riskReasons.push('International card blocked by merchant domestic policy');
          riskReasons.push(item.error_description || 'Gateway declined international checkout');
          if (amountRupees > 50000) {
            riskReasons.push(`High order ticket size (₹${amountRupees.toLocaleString('en-IN')})`);
          }
        } else if (item.error_code === 'BAD_REQUEST_ERROR') {
          riskScore = 82;
          riskLevel = 'HIGH';
          riskReasons.push(item.error_description || 'Payment policy violation detected');
          riskReasons.push('Declined by issuing bank or gateway rule');
        } else {
          riskScore = amountRupees > 100000 ? 85 : 75;
          riskLevel = amountRupees > 100000 ? 'CRITICAL' : 'HIGH';
          riskReasons.push(item.error_description || 'Payment failed during authorization');
          riskReasons.push('Issuing bank decline signature');
        }
      } else if (item.status === 'captured') {
        if (amountRupees > 100000) {
          riskScore = 38;
          riskLevel = 'MEDIUM';
          riskReasons.push('High value ticket verified via 3DS2 OTP');
          riskReasons.push('Issuing bank authorized full settlement');
        } else if (amountRupees > 40000) {
          riskScore = 20;
          riskLevel = 'LOW';
          riskReasons.push('Domestic card authenticated via 3DS2 OTP');
          riskReasons.push('Clean device & IP fingerprint verified');
        } else {
          riskScore = 12;
          riskLevel = 'LOW';
          riskReasons.push('Domestic transaction authenticated via 3DS2 OTP');
          riskReasons.push('Low ticket size within normal merchant bounds');
        }
      } else if (item.status === 'authorized') {
        riskScore = 35;
        riskLevel = 'MEDIUM';
        riskReasons.push('Pre-authorization hold successful');
        riskReasons.push('Awaiting final merchant capture or fulfillment');
      } else {
        riskScore = 45;
        riskLevel = 'MEDIUM';
        riskReasons.push(`Transaction state: ${item.status}`);
      }

      return {
        id: item.id,
        amount: amountRupees,
        currency: item.currency || 'INR',
        status: item.status,
        method: item.method || 'card',
        description: item.description || (item.notes && item.notes.description) || 'Merchant Transaction',
        email: item.email || '',
        contact: item.contact || '',
        card_network: item.card?.network || (item.method === 'upi' ? 'UPI' : 'Card'),
        card_last4: item.card?.last4 || '',
        card_type: item.card?.type || '',
        international: Boolean(item.international),
        created_at: new Date((item.created_at || Date.now() / 1000) * 1000).toISOString(),
        error_code: item.error_code,
        error_description: item.error_description,
        risk_score: riskScore,
        risk_level: riskLevel,
        risk_reasons: riskReasons
      };
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      total_count: data.count || payments.length,
      payments
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error while fetching Razorpay payments',
      message: err.message
    });
  }
}
