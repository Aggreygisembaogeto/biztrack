// Receipt and invoice generation utility

// Generate plain text receipt for SMS/WhatsApp/Email
export const generateReceiptText = (transaction, businessInfo = {}) => {
  const {
    businessName = 'BizTrack Business',
    businessPhone = '+254 700 000 000',
    businessAddress = 'Nairobi, Kenya'
  } = businessInfo;

  const receiptNumber = `RCP-${transaction.id || Date.now()}`;
  const date = new Date(transaction.created_at || Date.now()).toLocaleString();
  const unit = transaction.unit || 'units';
  
  let receiptText = `
═══════════════════════════════
${businessName}
${businessAddress}
Tel: ${businessPhone}
═══════════════════════════════
         RECEIPT
───────────────────────────────
Receipt No: ${receiptNumber}
Date: ${date}
${transaction.customer_phone ? `Customer: ${transaction.customer_phone}\n` : ''}───────────────────────────────
`;

  // Add item details
  if (transaction.item_name && transaction.quantity) {
    receiptText += `
Item: ${transaction.item_name}
Qty: ${transaction.quantity} ${unit}
Price: KES ${(transaction.unit_price || 0).toLocaleString()}
`;
  } else {
    receiptText += `
Description: ${transaction.description || 'Transaction'}
`;
  }

  receiptText += `
───────────────────────────────
TOTAL: KES ${(transaction.amount || 0).toLocaleString()}
${transaction.payment_method ? `Payment: ${transaction.payment_method}\n` : ''}Status: ${(transaction.status || 'COMPLETED').toUpperCase()}
───────────────────────────────
Thank You for Your Business!
═══════════════════════════════
`;

  return receiptText.trim();
};

export const generateReceipt = (transaction, businessInfo = {}) => {
  const {
    businessName = 'BizTrack Business',
    businessPhone = '+254 700 000 000',
    businessAddress = 'Nairobi, Kenya',
    businessEmail = 'info@biztrack.com'
  } = businessInfo;

  const receiptNumber = `RCP-${transaction.id || Date.now()}`;
  const date = new Date(transaction.created_at || Date.now()).toLocaleString();
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${receiptNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
        }
        .receipt {
          border: 2px dashed #333;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        .business-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .business-info {
          font-size: 12px;
          color: #666;
        }
        .receipt-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 15px 0;
          text-transform: uppercase;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        .info-label {
          font-weight: bold;
        }
        .divider {
          border-top: 1px dashed #333;
          margin: 15px 0;
        }
        .items {
          margin: 15px 0;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          width: 60px;
          text-align: center;
        }
        .item-price {
          width: 100px;
          text-align: right;
        }
        .total-section {
          margin-top: 20px;
          border-top: 2px solid #333;
          padding-top: 15px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 16px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #333;
          font-size: 12px;
        }
        .thank-you {
          font-size: 16px;
          font-weight: bold;
          margin: 10px 0;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
        .print-button {
          position: fixed;
          top: 10px;
          right: 10px;
          padding: 10px 20px;
          background-color: #f97316;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .print-button:hover {
          background-color: #ea580c;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Print Receipt</button>
      
      <div class="receipt">
        <div class="header">
          <div class="business-name">${businessName}</div>
          <div class="business-info">
            ${businessAddress}<br>
            Tel: ${businessPhone}<br>
            Email: ${businessEmail}
          </div>
        </div>
        
        <div class="receipt-title">Receipt</div>
        
        <div class="info-row">
          <span class="info-label">Receipt No:</span>
          <span>${receiptNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span>${date}</span>
        </div>
        ${transaction.customer_phone ? `
        <div class="info-row">
          <span class="info-label">Customer:</span>
          <span>${transaction.customer_phone}</span>
        </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="items">
          ${generateItemRows(transaction)}
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>KES ${(transaction.amount || 0).toLocaleString()}</span>
          </div>
          ${transaction.payment_method ? `
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>${transaction.payment_method}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="text-transform: uppercase;">${transaction.status || 'COMPLETED'}</span>
          </div>
        </div>
        
        <div class="footer">
          <div class="thank-you">Thank You for Your Business!</div>
          <div>Please keep this receipt for your records</div>
        </div>
      </div>
      
      <script>
        // Auto-print option (commented out by default)
        // window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};

const generateItemRows = (transaction) => {
  // For sales with item details
  if (transaction.item_name && transaction.quantity) {
    const unit = transaction.unit || 'units';
    const quantityDisplay = `${transaction.quantity} ${unit}`;
    
    return `
      <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px;">
        <span class="item-name">Item</span>
        <span class="item-qty">Qty</span>
        <span class="item-price">Price</span>
      </div>
      <div class="item-row">
        <span class="item-name">${transaction.item_name}</span>
        <span class="item-qty">${quantityDisplay}</span>
        <span class="item-price">KES ${(transaction.unit_price || 0).toLocaleString()}</span>
      </div>
      <div class="item-row" style="font-weight: bold;">
        <span class="item-name">Subtotal</span>
        <span class="item-qty"></span>
        <span class="item-price">KES ${(transaction.amount || 0).toLocaleString()}</span>
      </div>
    `;
  }
  
  // For general transactions
  return `
    <div class="item-row">
      <span class="item-name">${transaction.description || 'Transaction'}</span>
      <span class="item-price">KES ${(transaction.amount || 0).toLocaleString()}</span>
    </div>
  `;
};

export const generateInvoice = (transaction, businessInfo = {}, invoiceNumber = null) => {
  const {
    businessName = 'BizTrack Business',
    businessPhone = '+254 700 000 000',
    businessAddress = 'Nairobi, Kenya',
    businessEmail = 'info@biztrack.com',
    taxId = 'P051234567X'
  } = businessInfo;

  const invNumber = invoiceNumber || `INV-${transaction.id || Date.now()}`;
  const date = new Date(transaction.created_at || Date.now()).toLocaleDateString();
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(); // 7 days from now
  
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${invNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .invoice {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #f97316;
        }
        .business-info h1 {
          color: #f97316;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #f97316;
        }
        .invoice-number {
          font-size: 18px;
          margin-top: 5px;
        }
        .details-section {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
        }
        .detail-box {
          flex: 1;
        }
        .detail-box h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th {
          background-color: #f97316;
          color: white;
          padding: 12px;
          text-align: left;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-top: 30px;
          float: right;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
        }
        .total-row.grand-total {
          border-top: 2px solid #333;
          font-size: 20px;
          font-weight: bold;
          color: #f97316;
          margin-top: 10px;
          padding-top: 15px;
        }
        .footer {
          clear: both;
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background-color: #f97316;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .print-button:hover {
          background-color: #ea580c;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>
      
      <div class="invoice">
        <div class="header">
          <div class="business-info">
            <h1>${businessName}</h1>
            <p>${businessAddress}</p>
            <p>Tel: ${businessPhone}</p>
            <p>Email: ${businessEmail}</p>
            <p>Tax ID: ${taxId}</p>
          </div>
          <div class="invoice-info">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invNumber}</div>
          </div>
        </div>
        
        <div class="details-section">
          <div class="detail-box">
            <h3>Bill To:</h3>
            <p><strong>${transaction.customer_phone || 'Walk-in Customer'}</strong></p>
          </div>
          <div class="detail-box" style="text-align: right;">
            <h3>Invoice Details:</h3>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Status:</strong> ${(transaction.status || 'pending').toUpperCase()}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${transaction.item_name || transaction.description || 'Service/Product'}</td>
              <td class="text-right">${transaction.quantity || 1} ${transaction.unit || 'units'}</td>
              <td class="text-right">KES ${(transaction.unit_price || transaction.amount || 0).toLocaleString()}</td>
              <td class="text-right">KES ${(transaction.amount || 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>KES ${(transaction.amount || 0).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Tax (0%):</span>
            <span>KES 0</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>KES ${(transaction.amount || 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Payment Terms:</strong> Payment due within 7 days</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};

export default {
  generateReceiptText,
  generateReceipt,
  generateInvoice
};
