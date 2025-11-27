import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { customRequestsService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle, Clock, Mail, Image as ImageIcon, ArrowLeft, Edit } from 'lucide-react';
import SampleSelection from '../components/requests/SampleSelection';
import RequestAdjustments from '../components/requests/RequestAdjustments';
import { API_URL } from '../config/api.js';

export default function CustomRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSampleSelection, setShowSampleSelection] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  useEffect(() => {
    if (!userData?.id) {
      navigate('/login');
      return;
    }
    fetchRequest();
  }, [id, userData]);

  const fetchRequest = async () => {
    try {
      // API_URL is imported from config/api.js
      const token = await userData.getIdToken?.();
      
      const response = await fetch(`${API_URL}/api/custom-requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request');
      }

      const data = await response.json();
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request:', error);
      alert('Failed to load request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = async (sampleUrl) => {
    try {
      // API_URL is imported from config/api.js
      const token = await userData.getIdToken?.();
      
      const response = await fetch(`${API_URL}/api/custom-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedSample: sampleUrl,
          status: 'approved',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to select sample');
      }

      await fetchRequest();
      setShowSampleSelection(false);
      alert('Sample selected successfully! You can now proceed to checkout.');
    } catch (error) {
      console.error('Error selecting sample:', error);
      alert('Failed to select sample. Please try again.');
    }
  };

  const handleRequestAdjustments = async (adjustmentData) => {
    try {
      // API_URL is imported from config/api.js
      const token = await userData.getIdToken?.();
      
      const adjustmentRequest = {
        requestedAt: new Date().toISOString(),
        ...adjustmentData,
      };

      const response = await fetch(`${API_URL}/api/custom-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adjustmentRequests: [...(request.adjustmentRequests || []), adjustmentRequest],
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit adjustment request');
      }

      await fetchRequest();
      setShowAdjustments(false);
      alert('Adjustment request submitted. We will create new samples based on your feedback.');
    } catch (error) {
      console.error('Error requesting adjustments:', error);
      alert('Failed to submit adjustment request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'samples_sent':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_cart':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-green" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
          <p className="text-gray-600 mb-6">The custom request you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/ai-assistant" className="inline-block px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600">
            Go to AI Assistant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <Sidebar type="dashboard" />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-text-dark mb-2">Custom Request</h1>
                  <p className="text-gray-600">{request.templateName}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="capitalize">{request.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Request Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Template</label>
                  <p className="text-gray-900">{request.templateName}</p>
                </div>

                {request.modifications && Object.keys(request.modifications).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Your Modifications</label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(request.modifications).map(([key, value]) => {
                        if (!value || value === '') return null;
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="capitalize text-gray-600">{key}:</span>
                            <span className="text-gray-900 font-medium">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {request.additionalNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Additional Notes</label>
                    <p className="text-gray-900">{request.additionalNotes}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Requested On</label>
                  <p className="text-gray-900">
                    {request.createdAt?.toDate ? 
                      request.createdAt.toDate().toLocaleDateString() : 
                      new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Samples Section */}
            {request.samples && request.samples.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-dark">Samples</h2>
                  {request.status === 'samples_sent' && !request.selectedSample && (
                    <button
                      onClick={() => setShowSampleSelection(true)}
                      className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Select Sample
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.samples.map((sampleUrl, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg overflow-hidden ${
                        request.selectedSample === sampleUrl
                          ? 'border-primary-green'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={sampleUrl}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Available';
                        }}
                      />
                      {request.selectedSample === sampleUrl && (
                        <div className="bg-primary-green text-white p-2 text-center">
                          <CheckCircle className="w-5 h-5 inline-block mr-2" />
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {request.status === 'samples_sent' && !request.selectedSample && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      Please review the samples above and select your preferred option. You can also request adjustments if needed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Adjustment Requests */}
            {request.adjustmentRequests && request.adjustmentRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-text-dark mb-4">Adjustment Requests</h2>
                <div className="space-y-4">
                  {request.adjustmentRequests.map((adjustment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Request #{index + 1} - {new Date(adjustment.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {adjustment.description && (
                        <p className="text-gray-900">{adjustment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Actions</h2>
              
              <div className="flex flex-wrap gap-3">
                {request.status === 'samples_sent' && !request.selectedSample && (
                  <>
                    <button
                      onClick={() => setShowSampleSelection(true)}
                      className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Select Sample
                    </button>
                    <button
                      onClick={() => setShowAdjustments(true)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Request Adjustments
                    </button>
                  </>
                )}

                {request.selectedSample && request.status === 'approved' && (
                  <button
                    onClick={async () => {
                      try {
                        if (!userData?.id) {
                          navigate('/login');
                          return;
                        }

                        // Get template details for pricing
                        const template = request.templateId 
                          ? await templatesService.getById(request.templateId)
                          : null;

                        const cartItem = {
                          templateId: request.templateId || 'custom',
                          name: `Custom ${request.templateName}`,
                          image: request.selectedSample,
                          customizations: request.modifications || {},
                          price: template?.basePrice || 0, // Use template base price or 0
                          quantity: 1,
                          customRequestId: request.id,
                          isCustomRequest: true,
                        };

                        await cartService.addItem(userData.id, cartItem);
                        
                        // Update custom request status
                        // API_URL is imported from config/api.js
                        const token = await userData.getIdToken?.();
                        await fetch(`${API_URL}/api/custom-requests/${request.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            status: 'in_cart',
                          }),
                        });

                        navigate('/cart');
                      } catch (error) {
                        console.error('Error adding to cart:', error);
                        alert('Failed to add to cart. Please try again.');
                      }
                    }}
                    className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart & Checkout
                  </button>
                )}

                {request.status === 'pending' && (
                  <div className="w-full p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Your request is being processed. We'll send you samples via email once they're ready.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showSampleSelection && (
        <SampleSelection
          samples={request.samples || []}
          onSelect={handleSelectSample}
          onClose={() => setShowSampleSelection(false)}
        />
      )}

      {showAdjustments && (
        <RequestAdjustments
          originalModifications={request.modifications}
          onSubmit={handleRequestAdjustments}
          onClose={() => setShowAdjustments(false)}
        />
      )}
    </div>
  );
}

