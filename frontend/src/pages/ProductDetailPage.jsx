import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Plus, Minus } from 'lucide-react';
import { templatesService } from '../services/firestoreService';
import { cartService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState({
    color: '',
    material: '',
    dimensions: {},
  });
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  useEffect(() => {
    if (template) {
      calculatePrice();
      updatePreviewImage();
    }
  }, [customizations, template]);

  const fetchTemplate = async () => {
    try {
      const templateData = await templatesService.getById(id);
      if (templateData) {
        setTemplate(templateData);
        setPrice(templateData.basePrice || 0);
        setPreviewImage(templateData.images?.[0] || '');
        if (templateData.availableColors?.[0]) {
          setCustomizations((prev) => ({ ...prev, color: templateData.availableColors[0] }));
        }
        if (templateData.availableMaterials?.[0]) {
          setCustomizations((prev) => ({ ...prev, material: templateData.availableMaterials[0] }));
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!template) return;
    let calculatedPrice = template.basePrice || 0;

    // Material multiplier (example)
    const materialMultipliers = {
      Oak: 1.0,
      Pine: 0.9,
      Walnut: 1.2,
      Birch: 1.0,
    };
    if (customizations.material) {
      calculatedPrice *= materialMultipliers[customizations.material] || 1.0;
    }

    setPrice(calculatedPrice);
  };

  const updatePreviewImage = async () => {
    if (!template || !customizations.color) return;
    // For now, just use the original image
    // Image transformation can be added later if needed
    setPreviewImage(template.images?.[0] || '');
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      await cartService.addItem(currentUser.uid, {
        templateId: id,
        name: template.name,
        image: previewImage || template.images?.[0],
        customizations,
        price,
        quantity,
      });
      alert('Item added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p>Template not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-background-light rounded-lg overflow-hidden mb-4">
              <img
                src={previewImage || template.images?.[0] || '/placeholder.jpg'}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
            {template.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {template.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setPreviewImage(img)}
                    className="aspect-square bg-background-light rounded-lg overflow-hidden"
                  >
                    <img src={img} alt={`${template.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-4">{template.name}</h1>
            <p className="text-2xl font-bold text-primary-green mb-6">₦{price.toFixed(2)}</p>
            <p className="text-gray-600 mb-8">{template.description}</p>

            {/* Customization */}
            <div className="space-y-6 mb-8">
              {/* Color Selector */}
              {template.availableColors && template.availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-3">Color</label>
                  <div className="flex flex-wrap gap-3">
                    {template.availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCustomizations({ ...customizations, color })}
                        className={`px-4 py-2 border-2 rounded-lg ${
                          customizations.color === color
                            ? 'border-primary-green bg-primary-green bg-opacity-10'
                            : 'border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Selector */}
              {template.availableMaterials && template.availableMaterials.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-3">Material</label>
                  <select
                    value={customizations.material}
                    onChange={(e) => setCustomizations({ ...customizations, material: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    {template.availableMaterials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-3">Quantity</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="bg-background-light rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-text-dark">Total Price</span>
                <span className="text-3xl font-bold text-primary-green">₦{(price * quantity).toFixed(2)}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full px-6 py-4 bg-primary-green text-white rounded-lg hover:bg-green-600 transition font-semibold text-lg"
            >
              Add to Cart
            </button>

            {/* Product Info */}
            <div className="mt-8 space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>SKU:</span>
                <span className="font-semibold">{template.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="font-semibold">{template.difficulty || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Build Time:</span>
                <span className="font-semibold">{template.estimatedBuildTime || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

