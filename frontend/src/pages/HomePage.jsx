import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CategoryCard from '../components/cards/CategoryCard';
import TemplateCard from '../components/cards/TemplateCard';
import { Sparkles, ArrowRight, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { templatesService } from '../services/firestoreService';
import { categoryService } from '../services/categoryService';

export default function HomePage() {
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

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
        const filteredCategories = roomCats.filter(cat => 
          allowedCategories.includes(cat.name)
        );
        
        const sortedCategories = allowedCategories
          .map(name => filteredCategories.find(cat => cat.name === name))
          .filter(cat => cat !== undefined);
        
        if (sortedCategories.length > 0) {
          setCategories(sortedCategories);
        } else {
          setCategories([
            { id: 'living-room', name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
            { id: 'bedroom', name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80' },
            { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80' },
            { id: 'office', name: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
          ]);
        }
      } else {
        setCategories([
          { id: 'living-room', name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
          { id: 'bedroom', name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80' },
          { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80' },
          { id: 'office', name: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
        ]);
      }
    }).catch((error) => {
      console.error('Error fetching categories:', error);
      setCategories([
        { id: 'living-room', name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80' },
        { id: 'bedroom', name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80' },
        { id: 'kitchen', name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80' },
        { id: 'office', name: 'Office', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
      ]);
    });

    // Scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
      if (featuresRef.current) observer.unobserve(featuresRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section - Animated */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 py-20 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="opacity-0">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-slide-in-left">
                <Sparkles className="w-4 h-4" />
                AI-Powered Furniture Design
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Craft Your Perfect
                <span className="block text-green-600">Furniture, Your Way</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Transform your space with custom DIY furniture. Get AI-powered recommendations, detailed blueprints, and step-by-step instructions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/categories"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Explore Templates
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-all duration-300"
                >
                  Learn How It Works
                </Link>
              </div>
            </div>
            <div className="opacity-0 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="aspect-square bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Sparkles className="w-24 h-24 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-semibold">Hero Image Placeholder</p>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-300 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Jeeda?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create beautiful, custom furniture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI-Powered',
                description: 'Get instant recommendations tailored to your style and space',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                icon: Shield,
                title: 'Expert Plans',
                description: 'Professional blueprints and detailed instructions for every project',
                color: 'from-blue-400 to-blue-600',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Join thousands of DIY enthusiasts building amazing furniture',
                color: 'from-purple-400 to-purple-600',
              },
              {
                icon: TrendingUp,
                title: 'Customizable',
                description: 'Adjust dimensions, materials, and styles to match your vision',
                color: 'from-green-400 to-green-600',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group opacity-0 bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore by Room
            </h2>
            <p className="text-xl text-gray-600">
              Find the perfect furniture for every space in your home
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <div key={category.id} className="opacity-0" style={{ animationDelay: `${index * 100}ms` }}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Templates
            </h2>
            <p className="text-xl text-gray-600">
              Handpicked designs to inspire your next project
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredTemplates.length > 0 ? (
              featuredTemplates.map((template, index) => (
                <div key={template.id} className="opacity-0" style={{ animationDelay: `${index * 150}ms` }}>
                  <TemplateCard template={template} />
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-600">Loading templates...</p>
            )}
          </div>
          {featuredTemplates.length > 0 && (
            <div className="text-center mt-12 opacity-0">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                View All Templates
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Join thousands of DIY enthusiasts creating beautiful, custom furniture with Jeeda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Browse Templates
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
