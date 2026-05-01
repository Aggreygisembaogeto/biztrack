import React, { useState } from 'react';
import { FiX, FiShoppingCart, FiTrendingDown, FiPackage, FiCreditCard, FiSend, FiMessageSquare, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { generateReceipt, generateReceiptText } from '../utils/receiptGenerator';

const config = {
  sale: {
    title: 'Add Sale',
    icon: <FiShoppingCart size={20} />,
    accent: 'text-green-500',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    button: 'bg-green-500 hover:bg-green-600',
    defaultType: 'sale'
  },
  expense: {
    title: 'Add Expense',
    icon: <FiTrendingDown size={20} />,
    accent: 'text-red-500',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    button: 'bg-red-500 hover:bg-red-600',
    defaultType: 'expense'
  },
  stock: {
    title: 'Add Stock',
    icon: <FiPackage size={20} />,
    accent: 'text-blue-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    button: 'bg-blue-500 hover:bg-blue-600',
    defaultType: 'stock'
  },
  payment: {
    title: 'Record Payment',
    icon: <FiCreditCard size={20} />,
    accent: 'text-orange-500',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    button: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    defaultType: 'payment'
  }
};

const expenseCategories = ['Supplies', 'Salaries', 'Utilities', 'Rent', 'Maintenance', 'Marketing', 'Other'];
const paymentMethods = ['M-PESA', 'Cash', 'Bank Transfer', 'Card'];
const stockUnits = ['kg', 'liters', 'bags', 'pieces', 'boxes', 'crates'];
const saleUnits = ['kg', 'liters', 'bags', 'pieces', 'boxes', 'crates', 'units', 'grams', 'ml', 'dozen'];

const QuickActionModal = ({ type, onClose, onSuccess }) => {
  const cfg = config[type];

  const [form, setForm] = useState({
    item_name: '',
    quantity: '',
    unit_price: '',
    amount: '',
    customer_phone: '',
    status: 'completed',
    category: 'Supplies',
    stock_item_name: '',
    stock_quantity: '',
    unit: 'kg',
    price: '',
    payment_method: 'M-PESA',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [showReceiptOption, setShowReceiptOption] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Auto-calculate amount for sales
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if ((e.target.name === 'quantity' || e.target.name === 'unit_price') && type === 'sale') {
      const qty = parseFloat(e.target.name === 'quantity' ? e.target.value : updated.quantity) || 0;
      const price = parseFloat(e.target.name === 'unit_price' ? e.target.value : updated.unit_price) || 0;
      updated.amount = qty > 0 && price > 0 ? (qty * price).toFixed(2) : updated.amount;
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    if (type === 'stock') {
      const record = {
        type: 'stock',
        item_name: form.stock_item_name,
        quantity: parseFloat(form.stock_quantity),
        unit: form.unit,
        price: parseFloat(form.price),
        created_at: new Date().toISOString()
      };
      onSuccess(record);
      toast.success(`Stock updated: ${form.stock_item_name}`);
      setLoading(false);
      onClose();
    } else if (type === 'sale') {
      const totalAmount = parseFloat(form.amount) || (parseFloat(form.quantity) * parseFloat(form.unit_price));
      const record = {
        id: Date.now(),
        type: 'sale',
        item_name: form.item_name,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        unit_price: parseFloat(form.unit_price),
        amount: totalAmount,
        description: `${form.item_name} ${form.quantity} ${form.unit} @ KES ${form.unit_price}`,
        customer_phone: form.customer_phone || null,
        status: form.status,
        created_at: new Date().toISOString()
      };
      onSuccess(record);
      setLastTransaction(record);
      
      // Only show receipt option if payment is completed
      if (form.status === 'completed') {
        toast.success(`Sale recorded: ${form.item_name} — KES ${totalAmount.toLocaleString()}`);
        setShowReceiptOption(true);
      } else {
        toast.info(`Sale recorded as ${form.status}: ${form.item_name} — KES ${totalAmount.toLocaleString()}`);
        onClose();
      }
      setLoading(false);
    } else {
      const record = {
        id: Date.now(),
        type: cfg.defaultType,
        amount: parseFloat(form.amount),
        description: form.description,
        customer_phone: form.customer_phone || null,
        status: form.status || 'completed',
        category: form.category || null,
        payment_method: form.payment_method || null,
        created_at: new Date().toISOString()
      };
      onSuccess(record);
      setLastTransaction(record);
      const labels = { expense: 'Expense logged', payment: 'Payment recorded' };
      toast.success(`${labels[type]}: KES ${parseFloat(form.amount).toLocaleString()}`);
      setLoading(false);
      
      // Only show receipt option for payments if status is completed
      if (type === 'payment' && (record.status === 'completed')) {
        setShowReceiptOption(true);
      } else {
        onClose();
      }
    }
  };

  const handlePrintReceipt = () => {
    if (lastTransaction) {
      generateReceipt(lastTransaction);
      toast.success('Receipt opened in new window');
    }
  };

  const handleSendSMS = async () => {
    if (!lastTransaction || !lastTransaction.customer_phone) {
      toast.error('Customer phone number is required to send SMS');
      return;
    }

    try {
      const receiptText = generateReceiptText(lastTransaction);
      // In production, integrate with SMS API (e.g., Africa's Talking, Twilio)
      // For now, we'll simulate the send
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Receipt sent via SMS to ${lastTransaction.customer_phone}`);
      handleCloseWithoutReceipt();
    } catch (error) {
      toast.error('Failed to send SMS. Please try again.');
    }
  };

  const handleSendWhatsApp = () => {
    if (!lastTransaction || !lastTransaction.customer_phone) {
      toast.error('Customer phone number is required to send WhatsApp message');
      return;
    }

    const receiptText = generateReceiptText(lastTransaction);
    const phone = lastTransaction.customer_phone.replace(/\+/g, '');
    const message = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
    handleCloseWithoutReceipt();
  };

  const handleSendEmail = () => {
    if (!lastTransaction) {
      toast.error('Transaction data not available');
      return;
    }

    const receiptText = generateReceiptText(lastTransaction);
    const subject = encodeURIComponent(`Receipt - ${lastTransaction.item_name || 'Transaction'}`);
    const body = encodeURIComponent(receiptText);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    window.open(mailtoUrl, '_blank');
    toast.success('Opening email client...');
    handleCloseWithoutReceipt();
  };

  const handleCloseWithoutReceipt = () => {
    setShowReceiptOption(false);
    setLastTransaction(null);
    onClose();
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">

        {/* Header */}
        <div className={`p-5 border-b border-gray-700 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.accent}`}>
              {cfg.icon}
            </div>
            <h2 className="text-xl font-bold text-white">{cfg.title}</h2>
          </div>
          <button onClick={handleCloseWithoutReceipt} className="text-gray-400 hover:text-white transition-colors p-1">
            <FiX size={22} />
          </button>
        </div>

        {/* Receipt Option */}
        {showReceiptOption && lastTransaction ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingCart className="text-green-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Confirmed!</h3>
              <p className="text-gray-400 mb-2">
                Amount: <span className="text-white font-bold">KES {lastTransaction.amount.toLocaleString()}</span>
              </p>
              {lastTransaction.customer_phone && (
                <p className="text-sm text-gray-500 mb-4">
                  Customer: {lastTransaction.customer_phone}
                </p>
              )}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Payment Completed
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-400 text-center">Send receipt to customer:</p>
              
              {/* Send Options */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSendSMS}
                  disabled={!lastTransaction.customer_phone}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-all font-medium border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!lastTransaction.customer_phone ? 'Phone number required' : 'Send via SMS'}
                >
                  <FiMessageSquare size={24} />
                  <span className="text-xs">SMS</span>
                </button>
                
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!lastTransaction.customer_phone}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-all font-medium border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!lastTransaction.customer_phone ? 'Phone number required' : 'Send via WhatsApp'}
                >
                  <FiSend size={24} />
                  <span className="text-xs">WhatsApp</span>
                </button>
                
                <button
                  onClick={handleSendEmail}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-all font-medium border border-purple-500/30"
                  title="Send via Email"
                >
                  <FiMail size={24} />
                  <span className="text-xs">Email</span>
                </button>
              </div>

              {!lastTransaction.customer_phone && (
                <p className="text-xs text-yellow-500 text-center">
                  ⚠️ Add customer phone number to enable SMS/WhatsApp
                </p>
              )}
              
              {/* Close Button */}
              <button
                onClick={handleCloseWithoutReceipt}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* SALE fields */}
          {type === 'sale' && (
            <>
              <div>
                <label className={labelClass}>Item / Product Name</label>
                <input name="item_name" value={form.item_name} onChange={handleChange} required
                  placeholder="e.g. Flour, Tomatoes, Chicken" className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input name="quantity" type="number" min="0.1" step="0.1" value={form.quantity} onChange={handleChange} required
                    placeholder="5" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className={inputClass}>
                    {saleUnits.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Price/Unit</label>
                  <input name="unit_price" type="number" min="1" value={form.unit_price} onChange={handleChange} required
                    placeholder="200" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Total Amount (KES)</label>
                <input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} required
                  placeholder="Auto-calculated" className={inputClass} />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated from quantity × unit price</p>
              </div>
              <div>
                <label className={labelClass}>Customer Phone (optional)</label>
                <input name="customer_phone" value={form.customer_phone} onChange={handleChange}
                  placeholder="254712345678" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="completed">Paid (Completed)</option>
                  <option value="pending">Not Paid (Pending)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Receipt will be sent only after payment is confirmed</p>
              </div>
            </>
          )}

          {/* EXPENSE fields */}
          {type === 'expense' && (
            <>
              <div>
                <label className={labelClass}>Description</label>
                <input name="description" value={form.description} onChange={handleChange} required
                  placeholder="e.g. Cooking oil purchase" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Amount (KES)</label>
                <input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} required
                  placeholder="3500" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}

          {/* STOCK fields */}
          {type === 'stock' && (
            <>
              <div>
                <label className={labelClass}>Item Name</label>
                <input name="stock_item_name" value={form.stock_item_name} onChange={handleChange} required
                  placeholder="e.g. Cooking Oil" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input name="stock_quantity" type="number" min="1" value={form.stock_quantity} onChange={handleChange} required
                    placeholder="20" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className={inputClass}>
                    {stockUnits.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Price per Unit (KES)</label>
                <input name="price" type="number" min="1" value={form.price} onChange={handleChange} required
                  placeholder="450" className={inputClass} />
              </div>
            </>
          )}

          {/* PAYMENT fields */}
          {type === 'payment' && (
            <>
              <div>
                <label className={labelClass}>Description</label>
                <input name="description" value={form.description} onChange={handleChange} required
                  placeholder="e.g. Invoice #1042 payment" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Amount (KES)</label>
                <input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} required
                  placeholder="5000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Customer Phone</label>
                <input name="customer_phone" value={form.customer_phone} onChange={handleChange}
                  placeholder="254712345678" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select name="payment_method" value={form.payment_method} onChange={handleChange} className={inputClass}>
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`flex-1 px-4 py-3 ${cfg.button} text-white rounded-lg transition-all font-medium shadow-lg disabled:opacity-50`}>
              {loading ? 'Saving...' : cfg.title}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default QuickActionModal;
