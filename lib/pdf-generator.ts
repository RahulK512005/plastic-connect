/**
 * PDF Generation utilities for invoices and certificates
 * Using HTML to PDF conversion via server-side rendering
 */

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerLocation?: string;
  sellerName: string;
  sellerEmail: string;
  sellerLocation?: string;
  materialType: string;
  quantity: number;
  gradeQuality: string;
  purity: number;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  totalAmount: number;
  issuedDate: Date;
  dueDate?: Date;
}

export interface CertificateData {
  certificateNumber: string;
  brandName: string;
  brandEmail: string;
  materialType: string;
  quantity: number;
  gradeQuality: string;
  certificationAuthority: string;
  validityStart: Date;
  validityEnd: Date;
  issuedDate: Date;
}

/**
 * Generate HTML for invoice
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const dueDateStr = data.dueDate
    ? data.dueDate.toLocaleDateString('en-IN')
    : new Date(data.issuedDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 2px solid #10b981;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #10b981;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .detail-row {
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin: 25px 0;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          background: #f0fdf4;
          padding: 10px;
          margin-bottom: 15px;
          border-left: 4px solid #10b981;
        }
        .party-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 20px 0;
        }
        .party {
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 5px;
        }
        .party-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .party-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .party-detail {
          font-size: 13px;
          color: #4b5563;
          margin: 3px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #10b981;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: bold;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .summary {
          width: 100%;
          margin: 20px 0;
        }
        .summary-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }
        .summary-row.total {
          border-bottom: 2px solid #10b981;
          border-top: 2px solid #10b981;
          font-size: 16px;
          font-weight: bold;
          padding: 15px 0;
          color: #10b981;
        }
        .summary-label {
          text-align: right;
        }
        .summary-amount {
          text-align: right;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .terms {
          background: #f3f4f6;
          padding: 15px;
          margin-top: 20px;
          border-radius: 5px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">🌱 PlasticConnect.AI</div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <div class="detail-row"><strong>${data.invoiceNumber}</strong></div>
            <div class="detail-row">Order: ${data.orderNumber}</div>
          </div>
        </div>

        <!-- Party Information -->
        <div class="party-info">
          <div class="party">
            <div class="party-label">Bill To (Buyer)</div>
            <div class="party-name">${data.buyerName}</div>
            <div class="party-detail">Email: ${data.buyerEmail}</div>
            ${data.buyerLocation ? `<div class="party-detail">Location: ${data.buyerLocation}</div>` : ''}
          </div>
          <div class="party">
            <div class="party-label">Bill From (Seller)</div>
            <div class="party-name">${data.sellerName}</div>
            <div class="party-detail">Email: ${data.sellerEmail}</div>
            ${data.sellerLocation ? `<div class="party-detail">Location: ${data.sellerLocation}</div>` : ''}
          </div>
        </div>

        <!-- Dates -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; font-size: 13px;">
          <div>
            <strong>Invoice Date:</strong> ${data.issuedDate.toLocaleDateString('en-IN')}
          </div>
          <div>
            <strong>Due Date:</strong> ${dueDateStr}
          </div>
        </div>

        <!-- Materials Section -->
        <div class="section">
          <div class="section-title">Materials & Specifications</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty (kg)</th>
                <th style="text-align: center;">Grade</th>
                <th style="text-align: center;">Purity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${data.materialType}</td>
                <td style="text-align: center;">${data.quantity}</td>
                <td style="text-align: center;">${data.gradeQuality}</td>
                <td style="text-align: center;">${data.purity}%</td>
                <td class="amount">₹${data.basePrice.toFixed(2)}</td>
                <td class="amount">₹${(data.basePrice * data.quantity).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="section">
          <div class="summary">
            <div class="summary-row">
              <div class="summary-label">Subtotal:</div>
              <div class="summary-amount">₹${(data.basePrice * data.quantity).toFixed(2)}</div>
            </div>
            ${data.discountPercentage > 0 ? `
              <div class="summary-row">
                <div class="summary-label">Discount (${data.discountPercentage}%):</div>
                <div class="summary-amount" style="color: #059669;">-₹${data.discountAmount.toFixed(2)}</div>
              </div>
            ` : ''}
            <div class="summary-row total">
              <div class="summary-label">Total Amount:</div>
              <div class="summary-amount">₹${data.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <!-- Terms -->
        <div class="terms">
          <strong>Payment Terms & Conditions:</strong><br>
          • Payment must be completed within 30 days from invoice date<br>
          • Material inspection required upon delivery<br>
          • All disputes must be raised within 7 days of delivery<br>
          • Extended Producer Responsibility (EPR) certificate will be issued upon successful payment
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>PlasticConnect.AI - Connecting Collectors with Brands</p>
          <p>This is a digitally generated invoice. No signature required.</p>
          <p style="margin-top: 20px; color: #10b981;"><strong>Thank you for your business!</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML for EPR Certificate
 */
export function generateCertificateHTML(data: CertificateData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>EPR Certificate ${data.certificateNumber}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          color: #1a1a1a;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .certificate {
          max-width: 900px;
          margin: 0 auto;
          border: 3px solid #10b981;
          padding: 50px;
          text-align: center;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .seal {
          font-size: 60px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 42px;
          font-weight: bold;
          color: #10b981;
          margin: 20px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .subtitle {
          font-size: 18px;
          color: #059669;
          margin-bottom: 30px;
          font-style: italic;
        }
        .certificate-number {
          font-size: 20px;
          font-weight: bold;
          background: #ecfdf5;
          padding: 10px 20px;
          display: inline-block;
          border-radius: 5px;
          margin: 20px 0;
          color: #10b981;
        }
        .content {
          text-align: left;
          margin: 40px 0;
          line-height: 1.8;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #059669;
          margin-top: 25px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .detail-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 20px;
          margin: 12px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e0e7ff;
        }
        .detail-label {
          font-weight: bold;
          color: #4b5563;
        }
        .detail-value {
          color: #1a1a1a;
        }
        .validity-box {
          background: #ecfdf5;
          border: 2px solid #10b981;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
        }
        .validity-date {
          font-size: 18px;
          font-weight: bold;
          color: #10b981;
          margin: 10px 0;
        }
        .authority {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #10b981;
          text-align: center;
        }
        .authority-name {
          font-size: 18px;
          font-weight: bold;
          color: #059669;
          margin: 10px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          font-size: 12px;
          color: #6b7280;
        }
        .stamp {
          display: inline-block;
          border: 3px solid #10b981;
          padding: 10px 20px;
          transform: rotate(-15deg);
          font-size: 28px;
          font-weight: bold;
          color: #10b981;
          margin: 20px 0;
          opacity: 0.3;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="seal">✓</div>
        <div class="title">EPR Certificate</div>
        <div class="subtitle">Extended Producer Responsibility Certification</div>
        
        <div class="certificate-number">Certificate No. ${data.certificateNumber}</div>

        <div class="content">
          <p style="font-size: 16px; line-height: 2; margin: 30px 0;">
            This is to certify that the plastic waste material specified below has been processed 
            and verified to meet the quality and purity standards as prescribed by the Ministry of Environment, 
            Forest and Climate Change, Government of India.
          </p>

          <div class="section-title">Material Details</div>
          <div class="detail-row">
            <div class="detail-label">Material Type:</div>
            <div class="detail-value">${data.materialType}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Quantity:</div>
            <div class="detail-value">${data.quantity} kg</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Grade Quality:</div>
            <div class="detail-value">Grade ${data.gradeQuality}</div>
          </div>

          <div class="section-title">Brand Information</div>
          <div class="detail-row">
            <div class="detail-label">Brand Name:</div>
            <div class="detail-value">${data.brandName}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${data.brandEmail}</div>
          </div>

          <div class="validity-box">
            <div>Certificate Validity Period</div>
            <div class="validity-date">
              ${data.validityStart.toLocaleDateString('en-IN')} to ${data.validityEnd.toLocaleDateString('en-IN')}
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-top: 10px;">
              Issued: ${data.issuedDate.toLocaleDateString('en-IN')}
            </div>
          </div>

          <div class="authority">
            <div class="authority-name">${data.certificationAuthority}</div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 15px;">
              Ministry of Environment, Forest and Climate Change<br>
              Government of India
            </div>
            <div class="stamp">CERTIFIED ✓</div>
          </div>
        </div>

        <div class="footer">
          <p>This certificate certifies that the above-mentioned plastic waste material has been verified and meets all applicable standards and regulations.</p>
          <p style="margin-top: 15px; color: #10b981; font-weight: bold;">
            PlasticConnect.AI - Verified by AI Technology
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convert HTML to base64 for storage/transmission
 */
export function htmlToBase64(html: string): string {
  return Buffer.from(html).toString('base64');
}

/**
 * Decode base64 HTML
 */
export function base64ToHtml(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8');
}
