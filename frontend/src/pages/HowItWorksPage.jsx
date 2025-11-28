import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Search, MessageSquare, ShoppingCart, Package, FileText, Wrench, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function HowItWorksPage() {
  const stepsRef = useRef([]);

  useEffect(() => {
    // Intersection Observer for scroll animations
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

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => {
      stepsRef.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Browse & Discover',
      icon: Search,
      description: 'Explore our extensive library of furniture templates, from minimalist shelves to rustic coffee tables, and find inspiration for your next project.',
      imagePlaceholder: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=400&h=300&fit=crop',
    },
    {
      number: '02',
      title: 'Get AI Recommendations',
      icon: MessageSquare,
      description: 'Use our AI Chat Assistant to describe what you\'re looking for. Get personalized design recommendations that perfectly match your style, space, and skill level.',
      imagePlaceholder: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    },
    {
      number: '03',
      title: 'Customize & Order',
      icon: ShoppingCart,
      description: 'Adjust dimensions, select materials, and tweak details in our easy-to-use customizer. Once you\'re happy, order your unique plans.',
      imagePlaceholder: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    },
    {
      number: '04',
      title: 'Receive Your Plans',
      icon: Package,
      description: 'Instantly receive your comprehensive digital blueprints, step-by-step instructions, and a complete materials list delivered directly to your inbox.',
      imagePlaceholder: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    },
    {
      number: '05',
      title: 'Gather Materials',
      icon: FileText,
      description: 'We provide a complete shopping list for all the necessary tools and materials, making your trip to the hardware store a breeze.',
      imagePlaceholder: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    },
    {
      number: '06',
      title: 'Build Your Furniture',
      icon: Wrench,
      description: 'Follow the clear, detailed instructions to assemble your piece. Experience the pride and satisfaction of building your own custom furniture.',
      imagePlaceholder: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            How It Works
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
            Your dream furniture, from idea to reality in six simple steps.
          </p>
        </div>
      </section>

      {/* Steps Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  ref={(el) => (stepsRef.current[index] = el)}
                  className="group opacity-0 transition-all duration-700 ease-out hover:scale-105"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    {/* Step Number */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{step.number}</span>
                        <Icon className="w-8 h-8 opacity-90" />
                      </div>
                    </div>

                    {/* Image Placeholder */}
                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Icon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Image Placeholder</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed flex-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-500 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Join thousands of DIY enthusiasts creating beautiful, custom furniture with Jeeda.
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Designing Now
            <ArrowRight className="w-5 h-5" />
          </Link>
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
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

