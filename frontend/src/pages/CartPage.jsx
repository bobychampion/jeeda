import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cartService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    }
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      const cartData = await cartService.get(currentUser.uid);
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (templateId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateItem(currentUser.uid, templateId, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (templateId) => {
    try {
      await cartService.removeItem(currentUser.uid, templateId);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const subtotal = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">Please log in to view your cart.</p>
          <Link to="/login" className="text-primary-green hover:underline">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-text-dark mb-2">Your Cart</h1>
        <p className="text-gray-600 mb-8">
          You have {cart.items?.length || 0} items in your cart.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : cart.items?.length > 0 ? (
              cart.items.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 flex gap-6 shadow-sm">
                  <div className="w-32 h-32 bg-background-light rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-text-dark">{item.name || 'Template'}</h3>
                      {item.isCustomRequest && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    {item.isCustomRequest && item.customRequestId && (
                      <p className="text-xs text-gray-500 mb-2">
                        Custom Request ID: {item.customRequestId}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-2">
                      {item.customizations?.color && `Color: ${item.customizations.color}, `}
                      {item.customizations?.material && `Material: ${item.customizations.material}, `}
                      {item.customizations?.style && `Style: ${item.customizations.style}, `}
                      {item.customizations?.size && `Size: ${item.customizations.size}`}
                    </p>
                    <p className="text-lg font-bold text-text-dark mb-4">₦{item.price}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.templateId, (item.quantity || 1) - 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.templateId, (item.quantity || 1) + 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.templateId)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">Your cart is empty.</p>
                <Link
                  to="/categories"
                  className="inline-block px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-text-dark mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping & Taxes</span>
                  <span className="text-gray-500 text-sm">Calculated at checkout</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-bold text-text-dark">Total</span>
                  <span className="font-bold text-lg">₦{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full text-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition mb-4"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/categories"
                className="block w-full text-center px-6 py-3 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

