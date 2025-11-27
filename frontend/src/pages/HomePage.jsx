import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CategoryCard from '../components/cards/CategoryCard';
import TemplateCard from '../components/cards/TemplateCard';
import { Lightbulb, FileText, Wrench } from 'lucide-react';
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-dark text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary-green" />
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                1. Describe Your Idea
              </h3>
              <p className="text-gray-600">
                Tell our AI what you want to build. From a minimalist bookshelf to a rustic dining table, no idea is too big or small.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary-green" />
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                2. Get Your Custom Plans
              </h3>
              <p className="text-gray-600">
                Receive detailed, easy-to-follow blueprints, a complete materials list, and step-by-step instructions generated just for you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary-green" />
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">
                3. Build Your Masterpiece
              </h3>
              <p className="text-gray-600">
                Gather your materials and bring your custom furniture to life. Enjoy the satisfaction of building something with your own hands.
              </p>
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

