// Export utilities for generating CSV and PDF reports

// CSV Export Functions
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Specific report generators
export const exportSalesReport = (sales) => {
  const headers = ['id', 'date', 'item_name', 'quantity', 'unit_price', 'amount', 'customer_phone', 'status'];
  const data = sales.map(sale => ({
    id: sale.id,
    date: new Date(sale.created_at).toLocaleDateString(),
    item_name: sale.item_name || sale.description,
    quantity: sale.quantity || '',
    unit_price: sale.unit_price || '',
    amount: sale.amount,
    customer_phone: sale.customer_phone || '',
    status: sale.status
  }));
  
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, 'sales_report');
};

export const exportExpensesReport = (expenses) => {
  const headers = ['id', 'date', 'description', 'category', 'amount', 'status'];
  const data = expenses.map(expense => ({
    id: expense.id,
    date: new Date(expense.created_at).toLocaleDateString(),
    description: expense.description,
    category: expense.category || 'General',
    amount: Math.abs(expense.amount),
    status: expense.status
  }));
  
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, 'expenses_report');
};

export const exportInventoryReport = (inventory) => {
  const headers = ['id', 'name', 'category', 'quantity', 'unit', 'minStock', 'price', 'totalValue', 'supplier', 'lastRestocked'];
  const data = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    minStock: item.minStock,
    price: item.price,
    totalValue: item.quantity * item.price,
    supplier: item.supplier || '',
    lastRestocked: item.lastRestocked || ''
  }));
  
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, 'inventory_report');
};

export const exportTransactionsReport = (transactions) => {
  const headers = ['id', 'date', 'type', 'description', 'category', 'amount', 'customer_phone', 'status'];
  const data = transactions.map(txn => ({
    id: txn.id,
    date: new Date(txn.created_at).toLocaleDateString(),
    type: txn.type,
    description: txn.description || txn.item_name || '',
    category: txn.category || '',
    amount: txn.amount,
    customer_phone: txn.customer_phone || '',
    status: txn.status
  }));
  
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, 'transactions_report');
};

export const exportProfitLossReport = (sales, expenses) => {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;
  
  const data = [
    { category: 'Revenue', subcategory: 'Total Sales', amount: totalRevenue },
    { category: 'Expenses', subcategory: 'Total Expenses', amount: totalExpenses },
    { category: 'Profit', subcategory: 'Net Profit', amount: netProfit },
    { category: 'Metrics', subcategory: 'Profit Margin (%)', amount: profitMargin }
  ];
  
  const headers = ['category', 'subcategory', 'amount'];
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, 'profit_loss_report');
};

// Simple PDF generation using HTML and print
export const generatePDFReport = (title, content) => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #f97316;
          border-bottom: 2px solid #f97316;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f97316;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .summary {
          margin: 20px 0;
          padding: 15px;
          background-color: #f0f0f0;
          border-radius: 5px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      ${content}
      <div class="footer">
        Generated on ${new Date().toLocaleString()} | BizTrack Business Management System
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 100);
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateSalesPDF = (sales) => {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  
  const tableRows = sales.map(sale => `
    <tr>
      <td>${new Date(sale.created_at).toLocaleDateString()}</td>
      <td>${sale.item_name || sale.description}</td>
      <td>${sale.quantity || '-'}</td>
      <td>KES ${(sale.amount || 0).toLocaleString()}</td>
      <td>${sale.status}</td>
    </tr>
  `).join('');
  
  const content = `
    <h1>Sales Report</h1>
    <div class="summary">
      <strong>Total Revenue:</strong> KES ${totalRevenue.toLocaleString()}<br>
      <strong>Total Transactions:</strong> ${sales.length}<br>
      <strong>Average Sale:</strong> KES ${(totalRevenue / sales.length || 0).toFixed(2)}
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Item</th>
          <th>Quantity</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
  
  generatePDFReport('Sales Report', content);
};

export const generateInventoryPDF = (inventory) => {
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  
  const tableRows = inventory.map(item => {
    const status = item.quantity <= item.minStock ? 
      '<span style="color: red;">⚠ Low Stock</span>' : 
      '<span style="color: green;">✓ Good</span>';
    
    return `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.quantity} ${item.unit}</td>
        <td>${item.minStock} ${item.unit}</td>
        <td>KES ${item.price.toLocaleString()}</td>
        <td>KES ${(item.quantity * item.price).toLocaleString()}</td>
        <td>${status}</td>
      </tr>
    `;
  }).join('');
  
  const content = `
    <h1>Inventory Report</h1>
    <div class="summary">
      <strong>Total Items:</strong> ${inventory.length}<br>
      <strong>Total Inventory Value:</strong> KES ${totalValue.toLocaleString()}<br>
      <strong>Low Stock Items:</strong> ${lowStockItems.length}
    </div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Min Stock</th>
          <th>Unit Price</th>
          <th>Total Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
  
  generatePDFReport('Inventory Report', content);
};

export default {
  convertToCSV,
  downloadCSV,
  exportSalesReport,
  exportExpensesReport,
  exportInventoryReport,
  exportTransactionsReport,
  exportProfitLossReport,
  generatePDFReport,
  generateSalesPDF,
  generateInventoryPDF
};
