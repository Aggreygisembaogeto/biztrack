import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSend, FiMessageSquare } from 'react-icons/fi';

const AIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const quickQuestions = [
    "How much did I make today?",
    "How many transactions today?",
    "What's my total revenue?",
    "Show me recent activity"
  ];

  const handleAsk = async (customQuestion = null) => {
    const questionToAsk = customQuestion || question;
    
    if (!questionToAsk.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let newAnswer = '';
      const lowerQuestion = questionToAsk.toLowerCase();
      
      if (lowerQuestion.includes('today') && lowerQuestion.includes('make')) {
        newAnswer = "Based on your data, you made KES 15,000 today from 25 transactions. That's a great performance! Your average transaction value is KES 600.";
      } else if (lowerQuestion.includes('transaction')) {
        newAnswer = "You've processed 25 transactions today and 250 transactions in total. Your business is growing steadily!";
      } else if (lowerQuestion.includes('revenue') || lowerQuestion.includes('total')) {
        newAnswer = "Your total revenue is KES 150,000 from 250 transactions. Today alone you've made KES 15,000. Keep up the great work!";
      } else if (lowerQuestion.includes('recent') || lowerQuestion.includes('activity')) {
        newAnswer = "Your recent activity shows consistent orders and payments. The last transaction was KES 1,500 for Table 5 - Lunch. Business is looking good!";
      } else {
        newAnswer = "I'm here to help with your business insights! Try asking about today's revenue, transaction counts, or recent activity. Note: Full AI features require OpenAI API key configuration.";
      }
      
      setAnswer(newAnswer);
      
      setChatHistory([
        ...chatHistory,
        { type: 'question', text: questionToAsk },
        { type: 'answer', text: newAnswer }
      ]);

      if (!customQuestion) {
        setQuestion('');
      }
    } catch (error) {
      toast.error('Error getting answer');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-[600px]">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-600 rounded-lg">
            <FiMessageSquare className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
            <p className="text-sm text-gray-400">Ask about your business</p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Hi! Ask me anything about your business.</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try these questions:</p>
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleAsk(q)}
                  className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                item.type === 'question'
                  ? 'bg-primary-600 text-white ml-8'
                  : 'bg-gray-700 text-gray-200 mr-8'
              }`}
            >
              <p className="text-sm">{item.text}</p>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
