const axios = require('axios');
const pool = require('../config/database');

// Get M-PESA access token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-PESA access token:', error);
    throw error;
  }
};

// Initiate STK Push (Lipa Na M-PESA Online)
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, phone_number, description = 'Payment' } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || !phone_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide amount and phone number' 
      });
    }

    // Check if M-PESA is configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      // Mock payment for development
      const result = await pool.query(
        `INSERT INTO transactions (user_id, amount, type, status, description, customer_phone, mpesa_receipt) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [userId, amount, 'payment', 'completed', description, phone_number, `MOCK${Date.now()}`]
      );

      const transaction = result.rows[0];

      // Emit socket event
      const io = req.app.get('io');
      io.to(`user_${userId}`).emit('new_transaction', transaction);

      return res.json({
        success: true,
        message: 'Mock payment processed successfully (M-PESA not configured)',
        data: transaction
      });
    }

    // Real M-PESA integration
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const stkPushResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone_number,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone_number,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `Order${Date.now()}`,
        TransactionDesc: description
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // Create pending transaction
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, status, description, customer_phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, amount, 'payment', 'pending', description, phone_number]
    );

    res.json({
      success: true,
      message: 'Payment initiated. Please check your phone.',
      data: {
        transaction: result.rows[0],
        mpesa_response: stkPushResponse.data
      }
    });
  } catch (error) {
    console.error('M-PESA payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error initiating payment' 
    });
  }
};

// M-PESA callback handler
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;

    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const items = Body.stkCallback.CallbackMetadata.Item;
      const amount = items.find(item => item.Name === 'Amount').Value;
      const mpesaReceipt = items.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const phoneNumber = items.find(item => item.Name === 'PhoneNumber').Value;

      // Update transaction status
      await pool.query(
        `UPDATE transactions 
         SET status = 'completed', mpesa_receipt = $1 
         WHERE customer_phone = $2 AND amount = $3 AND status = 'pending'`,
        [mpesaReceipt, phoneNumber, amount]
      );

      console.log('M-PESA payment completed:', mpesaReceipt);
    } else {
      // Payment failed
      console.log('M-PESA payment failed:', Body.stkCallback.ResultDesc);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('M-PESA callback error:', error);
    res.json({ success: true }); // Always return success to M-PESA
  }
};
