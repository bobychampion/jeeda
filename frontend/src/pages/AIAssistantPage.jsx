import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import CustomRequestForm from '../components/forms/CustomRequestForm';
import { Mic, Send, Star, Edit2, Wand2, Loader2, X } from 'lucide-react';
import { getRecommendations } from '../services/aiService';
import { templatesService } from '../services/firestoreService';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

export default function AIAssistantPage() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: "Hi! I'm your Jeeda design assistant. What are you looking to build today? You can say something like 'I need a small bookshelf for my apartment' or 'Show me beginner-friendly coffee tables'.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showCustomRequestForm, setShowCustomRequestForm] = useState(false);
  const [selectedTemplateForRequest, setSelectedTemplateForRequest] = useState(null);
  const messagesEndRef = useRef(null);

  // Load previous conversation on mount
  useEffect(() => {
    if (userData?.id) {
      loadPreviousConversation();
    }
  }, [userData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load template details for messages that have recommendations but no templateDetails
  useEffect(() => {
    const loadMissingTemplateDetails = async () => {
      const messagesToLoad = messages.filter(
        msg => msg.type === 'ai' &&
               msg.recommendations && 
               msg.recommendations.length > 0 && 
               (!msg.templateDetails || msg.templateDetails.length === 0) &&
               !msg.templateLoadError // Don't retry if already marked as error
      );

      if (messagesToLoad.length === 0) return;

      // Load templates for all messages that need them
      for (const message of messagesToLoad) {
        try {
          console.log('Loading template details for message:', message.recommendations);
          const templatePromises = message.recommendations.map((id) => 
            templatesService.getById(id).catch(err => {
              console.error(`Error loading template ${id}:`, err);
              return null;
            })
          );
          const templateDetails = (await Promise.all(templatePromises)).filter(t => t !== null);
          
          console.log(`Loaded ${templateDetails.length} templates for message`);
          
          // Update the message with template details
          setMessages(prev => prev.map(msg => 
            msg === message 
              ? { ...msg, templateDetails, templateLoadError: templateDetails.length === 0 }
              : msg
          ));
        } catch (error) {
          console.error('Error loading template details:', error);
          // Mark as failed to prevent infinite loading
          setMessages(prev => prev.map(msg => 
            msg === message 
              ? { ...msg, templateDetails: [], templateLoadError: true }
              : msg
          ));
        }
      }
    };

    loadMissingTemplateDetails();
  }, [messages.length]); // Only run when number of messages changes

  const loadPreviousConversation = async () => {
    try {
      const conversation = await chatService.getLatestConversation(userData.id);
      if (conversation && conversation.messages && conversation.messages.length > 0) {
        // Convert Firestore timestamps to Date objects and load template details
        const formattedMessages = await Promise.all(
          conversation.messages.map(async (msg) => {
            const formattedMsg = {
              ...msg,
              timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp),
            };
            
            // If message has recommendations but no templateDetails, load them
            if (formattedMsg.recommendations && formattedMsg.recommendations.length > 0 && !formattedMsg.templateDetails) {
              try {
                const templatePromises = formattedMsg.recommendations.map((id) => templatesService.getById(id));
                const templateDetails = (await Promise.all(templatePromises)).filter(t => t !== null);
                formattedMsg.templateDetails = templateDetails;
              } catch (error) {
                console.error('Error loading template details for message:', error);
              }
            }
            
            return formattedMsg;
          })
        );
        
        setMessages(formattedMessages);
        setConversationId(conversation.id);
        
        // Load recommendations for sidebar from all messages
        const allRecommendations = formattedMessages
          .flatMap(msg => msg.recommendations || [])
          .filter((id, index, self) => self.indexOf(id) === index); // Unique IDs
        
        if (allRecommendations.length > 0) {
          await loadTemplateDetails(allRecommendations);
        }
      }
    } catch (error) {
      console.error('Error loading previous conversation:', error);
    }
  };

  const saveMessage = async (message) => {
    if (!userData?.id) return;
    
    try {
      const messageToSave = {
        ...message,
        timestamp: new Date(),
      };
      
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        // Create new conversation
        currentConversationId = await chatService.saveMessage(userData.id, messageToSave);
        setConversationId(currentConversationId);
      } else {
        // Add to existing conversation
        await chatService.saveMessage(userData.id, messageToSave, currentConversationId);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const loadTemplateDetails = async (templateIds) => {
    try {
      const templatePromises = templateIds.map((id) => templatesService.getById(id));
      const templates = await Promise.all(templatePromises);
      setRecommendations(templates.filter(t => t !== null));
    } catch (error) {
      console.error('Error loading template details:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(userMessage);
    
    const queryText = input;
    setInput('');
    setLoading(true);

    try {
      const result = await getRecommendations(queryText);
      
      // Fetch recommended templates immediately
      let templateDetails = [];
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('Fetching templates for IDs:', result.recommendations);
        const templatePromises = result.recommendations.map((id) => 
          templatesService.getById(id).catch(err => {
            console.error(`Error loading template ${id}:`, err);
            return null;
          })
        );
        templateDetails = (await Promise.all(templatePromises)).filter(t => t !== null);
        console.log(`Successfully loaded ${templateDetails.length} of ${result.recommendations.length} templates`);
        
        if (templateDetails.length === 0) {
          console.warn('No templates found for recommended IDs:', result.recommendations);
        }
        
        setRecommendations(templateDetails);
      } else {
        setRecommendations([]);
      }

      const aiResponse = {
        type: 'ai',
        text: result.message,
        recommendations: result.recommendations || [],
        templateDetails: templateDetails, // Store full template objects for display
        availableCategories: result.availableCategories || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      await saveMessage(aiResponse);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      const errorMessage = {
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCustomization = (template) => {
    setSelectedTemplateForRequest(template);
    setShowCustomRequestForm(true);
  };

  const handleCustomRequestSuccess = () => {
    setShowCustomRequestForm(false);
    setSelectedTemplateForRequest(null);
    // Optionally add a message to chat
    const successMessage = {
      type: 'ai',
      text: `Great! I've submitted your customization request for ${selectedTemplateForRequest?.name}. Our team will create samples and send them to your email.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, successMessage]);
    saveMessage(successMessage);
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <Sidebar type="dashboard" />
        <main className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text-dark mb-2">Design with AI</h1>
              <p className="text-gray-600">
                Describe the furniture you want to build and let our AI assistant help you find the perfect plan.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      R
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-primary-green text-white'
                        : 'bg-white text-text-dark shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    
                    {/* Display template images if recommendations exist */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {(message.templateDetails || []).map((template) => {
                          if (!template) return null;
                          
                          return (
                            <div key={template.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex gap-3">
                                {template.images?.[0] && (
                                  <img
                                    src={template.images[0]}
                                    alt={template.name}
                                    className="w-24 h-24 object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-text-dark mb-1">{template.name}</h4>
                                  {template.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleRequestCustomization(template)}
                                      className="flex items-center gap-1 px-3 py-1 bg-primary-green text-white rounded-lg hover:bg-green-600 text-sm transition"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Request Customization
                                    </button>
                                    <Link
                                      to={`/templates/${template.id}`}
                                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm transition"
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {/* If templateDetails not loaded yet, show message */}
                        {(!message.templateDetails || message.templateDetails.length === 0) && message.recommendations && message.recommendations.length > 0 && (
                          <div className="text-sm text-gray-500 italic">
                            {message.templateLoadError 
                              ? 'Unable to load template details. The recommended templates may no longer be available.'
                              : 'Loading template details...'}
                          </div>
                        )}
                      </div>
                    )}


                    {message.availableCategories && message.availableCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.availableCategories.map((cat, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-primary-green bg-opacity-20 text-primary-green rounded-full text-sm"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold flex-shrink-0">
                      {userData?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    R
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Custom Request Form Modal */}
            {showCustomRequestForm && (
              <CustomRequestForm
                template={selectedTemplateForRequest}
                onClose={() => {
                  setShowCustomRequestForm(false);
                  setSelectedTemplateForRequest(null);
                }}
                onSuccess={handleCustomRequestSuccess}
              />
            )}

            {/* Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Describe the furniture you want to build..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                disabled={loading}
              />
              <button 
                className="p-3 text-gray-600 hover:text-primary-green"
                title="Voice input (coming soon)"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-3 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-text-dark mb-4">Recommended for you</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                    <div className="aspect-square bg-background-light overflow-hidden">
                      <img
                        src={template.images?.[0] || '/placeholder.jpg'}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-text-dark mb-2">{template.name}</h4>
                      <div className="flex items-center justify-between mb-2">
                        {template.difficulty && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {template.difficulty}
                          </span>
                        )}
                        {template.estimatedBuildTime && (
                          <span className="text-xs text-gray-600">{template.estimatedBuildTime}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestCustomization(template)}
                          className="flex-1 text-center px-3 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          Request Customization
                        </button>
                        <Link
                          to={`/templates/${template.id}`}
                          className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
                        >
                          View Plan
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Start a conversation to see recommendations.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
