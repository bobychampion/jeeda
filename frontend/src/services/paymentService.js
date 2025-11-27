/**
 * Initialize Paystack payment
 * Uses Paystack inline script
 */
export const initializePayment = (config) => {
  return new Promise((resolve, reject) => {
    // Load Paystack inline script if not already loaded
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        setupPayment(config, resolve, reject);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'));
      };
      document.body.appendChild(script);
    } else {
      setupPayment(config, resolve, reject);
    }
  });
};

const setupPayment = (config, resolve, reject) => {
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || config.publicKey,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo
    ref: config.reference || `RC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      custom_fields: [
        {
          display_name: 'Order ID',
          variable_name: 'order_id',
          value: config.orderId || '',
        },
      ],
      ...config.metadata,
    },
    callback: (response) => {
      resolve({
        status: true,
        reference: response.reference,
        transaction: response,
      });
    },
    onClose: () => {
      reject(new Error('Payment window closed'));
    },
  });

  handler.openIframe();
};

/**
 * Verify payment (this would typically be done server-side, but for frontend-only,
 * you can use Paystack's verify endpoint directly)
 */
export const verifyPayment = async (reference) => {
  // Note: This requires the secret key, which should not be in frontend
  // For frontend-only, you might want to create a Firebase Function or
  // use a different approach
  // For now, we'll just return the reference
  return {
    status: true,
    reference,
    message: 'Payment verification should be done server-side',
  };
};

