import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { Lock } from 'lucide-react';
import { cartService, ordersService } from '../services/firestoreService';
import { initializePayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [assemblyService, setAssemblyService] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      const cartData = await cartService.get(currentUser.uid);
      setOrderItems(cartData.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = 15.00;
  const assemblyFee = assemblyService ? 50.00 : 0;
  const total = subtotal + shipping + assemblyFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order in Firestore
      const orderData = await ordersService.create(currentUser.uid, {
        items: orderItems,
        deliveryAddress: formData,
        deliveryFee: shipping,
        assemblyService,
        totalAmount: total,
      });

      // Initialize Paystack payment
      await initializePayment({
        email: currentUser.email,
        amount: total,
        reference: orderData.orderId,
        orderId: orderData.id,
        metadata: {
          orderId: orderData.id,
          userId: currentUser.uid,
        },
        callback: async (response) => {
          // Payment successful - clear cart
          await cartService.clear(currentUser.uid);
          navigate('/dashboard?payment=success');
        },
        onClose: () => {
          alert('Payment was cancelled. Your order has been saved.');
          navigate('/dashboard');
        },
      });
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          Cart / Shipping / Payment
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-8">
              Final Step: Payment & Delivery
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Delivery Address */}
              <div>
                <h2 className="text-xl font-semibold text-text-dark mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <input
                      type="text"
                      placeholder="State / Province"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    >
                      <option>United States</option>
                      <option>Nigeria</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Services */}
              <div>
                <h2 className="text-xl font-semibold text-text-dark mb-4">Optional Services</h2>
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="assembly"
                      checked={assemblyService}
                      onChange={(e) => setAssemblyService(e.target.checked)}
                      className="w-5 h-5 text-primary-green focus:ring-primary-green"
                    />
                    <label htmlFor="assembly" className="font-medium text-text-dark">
                      Need help with assembly?
                    </label>
                  </div>
                  <span className="text-text-dark font-semibold">₦{assemblyFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-dark">Payment Information</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Secure Payment with Paystack</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={paymentData.cvc}
                      onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-text-dark mb-6">Your Order</h2>
              <div className="space-y-4 mb-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-background-light rounded-lg overflow-hidden">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-dark">{item.name || 'Template'}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="font-semibold">₦{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">₦{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={assemblyService ? 'text-gray-600' : 'text-primary-green'}>
                    Assembly Service
                  </span>
                  <span className={assemblyService ? 'font-semibold' : 'text-primary-green'}>
                    ₦{assemblyFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <span className="text-xl font-bold text-text-dark">Total</span>
                  <span className="text-2xl font-bold text-text-dark">₦{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-green text-white rounded-lg hover:bg-green-600 transition font-semibold"
              >
                <Lock className="w-5 h-5" />
                <span>{loading ? 'Processing...' : 'Confirm & Pay'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

