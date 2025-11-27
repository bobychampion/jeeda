import Paystack from 'paystack';
import dotenv from 'dotenv';

dotenv.config();

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY || '');

/**
 * Initialize Paystack payment
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.amount - Amount in kobo (NGN)
 * @param {string} paymentData.email - Customer email
 * @param {string} paymentData.reference - Unique reference
 * @param {Object} paymentData.metadata - Additional metadata
 * @returns {Promise<Object>} - Payment initialization response
 */
export async function initializePayment(paymentData) {
  try {
    const response = await paystack.transaction.initialize({
      amount: paymentData.amount * 100, // Convert to kobo
      email: paymentData.email,
      reference: paymentData.reference,
      metadata: paymentData.metadata || {},
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success`,
    });

    return {
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      reference: response.data.reference,
    };
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw new Error('Failed to initialize payment');
  }
}

/**
 * Verify Paystack payment
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} - Payment verification response
 */
export async function verifyPayment(reference) {
  try {
    const response = await paystack.transaction.verify(reference);
    
    return {
      status: response.data.status === 'success',
      amount: response.data.amount / 100, // Convert from kobo
      reference: response.data.reference,
      customer: response.data.customer,
      metadata: response.data.metadata,
    };
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new Error('Failed to verify payment');
  }
}

export default paystack;

