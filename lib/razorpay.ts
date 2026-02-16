import crypto from 'crypto';

/**
 * Razorpay Payment Gateway Configuration
 */

export interface RazorpayOrderData {
  amount: number;
  currency: string;
  receipt: string;
  description: string;
  customer_notify: number;
  notes: {
    orderId: string;
    buyerId: string;
  };
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

/**
 * Create Razorpay order
 * Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment
 */
export async function createRazorpayOrder(
  orderData: RazorpayOrderData
): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys not configured');
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Razorpay error: ${error.description || 'Failed to create order'}`);
  }

  return response.json();
}

/**
 * Verify payment signature from Razorpay webhook
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error('Razorpay key secret not configured');
  }

  const message = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac('sha256', keySecret)
    .update(message)
    .digest('hex');

  return generated_signature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPaymentDetails(paymentId: string): Promise<any> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys not configured');
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payment details');
  }

  return response.json();
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentId: string,
  amount: number,
  notes?: Record<string, string>
): Promise<any> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys not configured');
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const body: any = {
    amount: Math.round(amount * 100) // Convert to paise
  };

  if (notes) {
    body.notes = notes;
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Failed to refund payment');
  }

  return response.json();
}

/**
 * Format amount to paise (smallest unit in INR)
 */
export function formatAmountToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format paise back to rupees
 */
export function formatPaiseToAmount(paise: number): number {
  return paise / 100;
}
