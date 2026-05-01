const OpenAI = require('openai');
const pool = require('../config/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a question' 
      });
    }

    // Get business data for context
    const todayRevenue = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as revenue 
       FROM transactions 
       WHERE user_id = $1 
       AND status = 'completed' 
       AND DATE(created_at) = CURRENT_DATE`,
      [userId]
    );

    const todayTransactions = await pool.query(
      `SELECT COUNT(*) as count 
       FROM transactions 
       WHERE user_id = $1 
       AND DATE(created_at) = CURRENT_DATE`,
      [userId]
    );

    const totalRevenue = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as revenue 
       FROM transactions 
       WHERE user_id = $1 
       AND status = 'completed'`,
      [userId]
    );

    const recentTransactions = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Prepare context for AI
    const context = `
Business Data:
- Today's Revenue: KES ${todayRevenue.rows[0].revenue}
- Today's Transactions: ${todayTransactions.rows[0].count}
- Total Revenue (All Time): KES ${totalRevenue.rows[0].revenue}
- Recent Transactions: ${JSON.stringify(recentTransactions.rows)}

User Question: ${question}

Please provide a clear, concise answer based on the business data above. Keep it simple and actionable.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful business assistant for a restaurant in Nairobi, Kenya. Provide clear, concise answers about business performance and transactions. Use KES for currency."
        },
        {
          role: "user",
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const answer = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        question,
        answer
      }
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    
    // Handle OpenAI API errors gracefully
    if (error.status === 401) {
      return res.status(500).json({ 
        success: false, 
        message: 'AI service configuration error. Please check API key.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error processing your question' 
    });
  }
};
