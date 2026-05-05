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
    const { amount, phone_number, description = 'Payment', customer_name } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || !phone_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide amount and phone number' 
      });
    }

    // Validate amount
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Validate phone number format
    const phoneRegex = /^254\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format. Use 254XXXXXXXXX' 
      });
    }

    // Check if M-PESA is configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      console.log('M-PESA not configured, using mock payment');
      
      // Mock payment for development
      const mockReceipt = `MOCK${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO transactions (user_id, amount, type, status, description, customer_phone, mpesa_receipt, payment_method) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [userId, amount, 'payment', 'completed', description, phone_number, mockReceipt, 'M-Pesa']
      );

      const transaction = result.rows[0];

      // Emit socket event if available
      try {
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${userId}`).emit('new_transaction', transaction);
        }
      } catch (socketError) {
        console.log('Socket not available:', socketError.message);
      }

      return res.json({
        success: true,
        message: 'Mock payment processed successfully (M-Pesa not configured)',
        data: {
          transaction,
          mpesa_response: {
            CheckoutRequestID: mockReceipt,
            ResponseDescription: 'Mock payment - M-Pesa credentials not configured'
          }
        }
      });
    }

    // Real M-PESA integration
    console.log('Initiating real M-PESA payment...');
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
        Amount: Math.round(parseFloat(amount)),
        PartyA: phone_number,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone_number,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback',
        AccountReference: customer_name || `Order${Date.now()}`,
        TransactionDesc: description
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log('M-PESA STK Push Response:', stkPushResponse.data);

    // Create pending transaction
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, status, description, customer_phone, payment_method) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [userId, amount, 'payment', 'pending', description, phone_number, 'M-Pesa']
    );

    res.json({
      success: true,
      message: 'STK Push sent successfully. Please check your phone.',
      data: {
        transaction: result.rows[0],
        mpesa_response: stkPushResponse.data
      }
    });
  } catch (error) {
    console.error('M-PESA payment error:', error.response?.data || error.message);
    
    // Provide more specific error messages
    let errorMessage = 'Error initiating payment';
    if (error.response?.data) {
      errorMessage = error.response.data.errorMessage || error.response.data.ResponseDescription || errorMessage;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      details: error.response?.data || error.message
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
