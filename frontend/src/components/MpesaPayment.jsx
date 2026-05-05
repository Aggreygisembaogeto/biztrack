import React, { useState } from 'react';
import {
  FiX, FiCreditCard, FiPhone, FiDollarSign, FiCheckCircle,
  FiAlertCircle, FiLoader, FiClock, FiUser, FiFileText
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const MpesaPayment = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('form'); // form, processing, success, failed
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    customerName: '',
    description: 'Payment for goods/services'
  });
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (!formData.phoneNumber) {
      toast.error('Please enter a phone number');
      return false;
    }

    const phone = formatPhoneNumber(formData.phoneNumber);
    if (phone.length !== 12) {
      toast.error('Please enter a valid Kenyan phone number');
      return false;
    }

    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setStep('processing');

    try {
      const phone = formatPhoneNumber(formData.phoneNumber);
      
      // Call backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/mpesa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('biztrack_token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          phone_number: phone,
          description: formData.description,
          customer_name: formData.customerName
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentDetails({
          amount: formData.amount,
          phone: phone,
          customerName: formData.customerName,
          transactionId: data.data.transaction?.id || 'PENDING',
          mpesaRef: data.data.mpesa_response?.CheckoutRequestID || 'N/A',
          timestamp: new Date().toISOString()
        });

        // Simulate payment confirmation (in production, this would be from callback)
        setTimeout(() => {
          setStep('success');
          setLoading(false);
          toast.success('Payment completed successfully!');
          
          if (onSuccess) {
            onSuccess({
              type: 'payment',
              amount: parseFloat(formData.amount),
              customer_name: formData.customerName,
              customer_phone: phone,
              description: formData.description,
              payment_method: 'M-Pesa',
              status: 'completed',
              created_at: new Date().toISOString()
            });
          }
        }, 3000);
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStep('failed');
      setLoading(false);
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  const resetForm = () => {
    setStep('form');
    setFormData({
      amount: '',
      phoneNumber: '',
      customerName: '',
      description: 'Payment for goods/services'
    });
    setPaymentDetails(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-green-500/10 to-green-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <FiCreditCard className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">M-Pesa Payment</h2>
                <p className="text-gray-400 text-sm">Lipa Na M-Pesa Online</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Form Step */}
          {step === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiDollarSign className="inline mr-1" />
                  Amount (KES)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiPhone className="inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="0712345678 or 254712345678"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter Kenyan phone number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiUser className="inline mr-1" />
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiFileText className="inline mr-1" />
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Payment description"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-blue-500 mt-0.5" size={20} />
                  <div>
                    <p className="text-blue-400 text-sm font-medium mb-1">How it works:</p>
                    <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                      <li>Enter payment details and click "Send Payment Request"</li>
                      <li>Customer will receive STK Push on their phone</li>
                      <li>Customer enters M-Pesa PIN to complete payment</li>
                      <li>You'll receive confirmation once payment is successful</li>
                    </ol>
                  </div>
                </div>
              </div>

              <button
                onClick={initiatePayment}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Payment Request
              </button>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-500 mx-auto mb-4"></div>
                <FiPhone className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-400 mb-4">
                STK Push sent to <span className="text-green-500 font-medium">{formData.phoneNumber}</span>
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FiClock className="text-yellow-500 mt-0.5" size={20} />
                  <div className="text-left">
                    <p className="text-yellow-400 text-sm font-medium mb-1">Waiting for customer</p>
                    <p className="text-xs text-gray-400">
                      Customer should check their phone and enter M-Pesa PIN to complete the payment.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <FiLoader className="animate-spin" />
                <span>This may take a few seconds...</span>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && paymentDetails && (
            <div className="text-center py-8">
              <div className="p-4 bg-green-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FiCheckCircle className="text-green-500 text-5xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-400 mb-6">Transaction completed successfully</p>

              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 text-left mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Amount:</span>
                  <span className="text-white font-bold">KES {parseFloat(paymentDetails.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Phone:</span>
                  <span className="text-white">{paymentDetails.phone}</span>
                </div>
                {paymentDetails.customerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Customer:</span>
                    <span className="text-white">{paymentDetails.customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Transaction ID:</span>
                  <span className="text-white text-xs">{paymentDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Time:</span>
                  <span className="text-white text-xs">
                    {new Date(paymentDetails.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  New Payment
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Failed Step */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <div className="p-4 bg-red-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FiAlertCircle className="text-red-500 text-5xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
              <p className="text-gray-400 mb-6">
                The payment could not be completed. Please try again.
              </p>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">
                  Common reasons for failure:
                </p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1 text-left list-disc list-inside">
                  <li>Customer cancelled the transaction</li>
                  <li>Insufficient M-Pesa balance</li>
                  <li>Wrong PIN entered multiple times</li>
                  <li>Network timeout</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <FiCreditCard />
            <span>Powered by Safaricom M-Pesa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MpesaPayment;
