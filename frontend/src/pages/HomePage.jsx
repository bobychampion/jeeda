import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CategoryCard from '../components/cards/CategoryCard';
import TemplateCard from '../components/cards/TemplateCard';
import { Lightbulb, FileText, Wrench, Search, ShoppingCart, MessageSquare, Package, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { templatesService } from '../services/firestoreService';
import { categoryService } from '../services/categoryService';

export default function HomePage() {
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch featured templates
    templatesService.getAll().then((templates) => {
      setFeaturedTemplates(templates.slice(0, 3));
    }).catch((error) => {
      console.error('Error fetching templates:', error);
      setFeaturedTemplates([]);
    });

    // Fetch room categories from Firestore and filter to show only specific ones
    const allowedCategories = ['Living Room', 'Bedroom', 'Kitchen', 'Office'];
    
    categoryService.getRoomCategories().then((roomCats) => {
      if (roomCats.length > 0) {
        // Filter to show only the allowed categories
        const filteredCategories = roomCats.filter(cat => 
          allowedCategories.includes(cat.name)
        );
        
        // Sort to maintain the desired order
        const sortedCategories = allowedCategories
          .map(name => filteredCategories.find(cat => cat.name === name))
          .filter(cat => cat !== undefined);
        
        if (sortedCategories.length > 0) {
          setCategories(sortedCategories);
        } else {
          // Fallback to default categories if none match
          setCategories([
            { id: 'living-room', name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
            { id: 'bedroom', name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80' },
            { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80' },
            { id: 'office', name: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
          ]);
        }
      } else {
        // Fallback to default categories if none exist
        setCategories([
          { id: 'living-room', name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
          { id: 'bedroom', name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80' },
          { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80' },
          { id: 'office', name: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
        ]);
      }
    }).catch((error) => {
      console.error('Error fetching categories:', error);
      // Fallback on error
      setCategories([
        { id: 'living-room', name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
        { id: 'bedroom', name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80' },
        { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80' },
        { id: 'office', name: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
      ]);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-text-dark mb-6">
              Craft Your Perfect Furniture, Your Way
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your vision, our blueprints. AI-powered DIY furniture design.
            </p>
            <Link
              to="/ai-assistant"
              className="inline-block px-8 py-4 bg-primary-green text-white rounded-lg text-lg font-semibold hover:bg-green-600 transition"
            >
              Start Designing with AI
            </Link>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="/hero-storage-system.jpg"
              alt="Modern modular storage system"
              className="w-full h-auto rounded-lg object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';
              }}
            />
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="bg-background-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-dark text-center mb-12">
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-dark text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            From browsing templates to building your custom furniture, here's how Jeeda makes DIY furniture design simple and accessible.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-green" />
              </div>
              <div className="text-center mb-2">
                <span className="bg-primary-green text-white text-sm font-bold px-3 py-1 rounded-full">Step 1</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3 text-center">
                Browse & Discover
              </h3>
              <p className="text-gray-600 text-center">
                Explore our curated collection of DIY furniture templates organized by room type. Browse Living Room, Bedroom, Kitchen, Office, and more. Each template includes images, difficulty level, estimated build time, and pricing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary-green" />
              </div>
              <div className="text-center mb-2">
                <span className="bg-primary-green text-white text-sm font-bold px-3 py-1 rounded-full">Step 2</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3 text-center">
                Get AI Recommendations
              </h3>
              <p className="text-gray-600 text-center">
                Use our AI Chat Assistant to describe what you're looking for. Simply tell the AI your needs (e.g., "I need a small bookshelf for my apartment" or "Show me beginner-friendly coffee tables"), and it will recommend the best matching templates from our database.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-primary-green" />
              </div>
              <div className="text-center mb-2">
                <span className="bg-primary-green text-white text-sm font-bold px-3 py-1 rounded-full">Step 3</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3 text-center">
                Customize & Order
              </h3>
              <p className="text-gray-600 text-center">
                Select your preferred template and customize it to your needs. Choose materials, colors, dimensions, and finishing options. Add to cart and proceed to checkout. For unique customizations, submit a Custom Request and our team will work with you.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary-green" />
              </div>
              <div className="text-center mb-2">
                <span className="bg-primary-green text-white text-sm font-bold px-3 py-1 rounded-full">Step 4</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3 text-center">
                Receive Your Plans
              </h3>
              <p className="text-gray-600 text-center">
                After payment, you'll receive detailed blueprints, a complete materials list with quantities, step-by-step assembly instructions, and cutting diagrams. Everything you need to build your furniture is included in a downloadable PDF.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary-green" />
              </div>
              <div className="text-center mb-2">
                <span className="bg-primary-green text-white text-sm font-bold px-3 py-1 rounded-full">Step 5</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3 text-center">
                Gather Materials
              </h3>
              <p className="text-gray-600 text-center">
                Use the provided materials list to purchase everything you need from your local hardware store or online. The list includes exact quantities, dimensions, and specifications for each component.
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary-green" />
              </div>
              <div className="text-center mb-2">
                <span className="bg-primary-green text-white text-sm font-bold px-3 py-1 rounded-full">Step 6</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3 text-center">
                Build Your Furniture
              </h3>
              <p className="text-gray-600 text-center">
                Follow the step-by-step instructions to assemble your custom furniture. Each template includes difficulty ratings (Beginner, Intermediate, Advanced) and estimated build times to help you choose the right project for your skill level.
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-text-dark mb-6 text-center">
              Why Choose Jeeda?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-primary-green mx-auto mb-3" />
                <h4 className="font-bold text-text-dark mb-2">AI-Powered Matching</h4>
                <p className="text-gray-600 text-sm">
                  Our intelligent AI assistant helps you find the perfect furniture template based on your specific needs and preferences.
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-primary-green mx-auto mb-3" />
                <h4 className="font-bold text-text-dark mb-2">Customizable Designs</h4>
                <p className="text-gray-600 text-sm">
                  Every template can be customized with different materials, colors, sizes, and finishing options to match your style.
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-primary-green mx-auto mb-3" />
                <h4 className="font-bold text-text-dark mb-2">Complete Instructions</h4>
                <p className="text-gray-600 text-sm">
                  Receive professional blueprints, detailed material lists, and easy-to-follow assembly instructions for every project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="bg-background-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-dark text-center mb-12">
            Featured Templates
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTemplates.length > 0 ? (
              featuredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-600">Loading templates...</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

