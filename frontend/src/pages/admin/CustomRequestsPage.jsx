import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import RequestCard from '../../components/admin/RequestCard';
import SendSamplesModal from '../../components/admin/SendSamplesModal';
import { customRequestsService } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Filter, Mail } from 'lucide-react';

export default function CustomRequestsPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSendSamples, setShowSendSamples] = useState(false);

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [userData, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const filters = filterStatus === 'all' ? {} : { status: filterStatus };
      const data = await customRequestsService.getAll(filters);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching custom requests:', error);
      alert('Failed to load custom requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSamples = (request) => {
    setSelectedRequest(request);
    setShowSendSamples(true);
  };

  const handleSamplesSent = () => {
    fetchRequests();
    setShowSendSamples(false);
    setSelectedRequest(null);
  };

  const getStatusCounts = () => {
    const counts = {
      all: requests.length,
      pending: 0,
      in_progress: 0,
      samples_sent: 0,
      approved: 0,
      in_cart: 0,
      completed: 0,
      cancelled: 0,
    };

    requests.forEach(req => {
      if (req.status && counts.hasOwnProperty(req.status)) {
        counts[req.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header />
        <AdminSidebar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-green" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text-dark mb-2">Custom Requests</h1>
              <p className="text-gray-600">Manage customer customization requests</p>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'all', label: 'All', count: statusCounts.all },
                    { value: 'pending', label: 'Pending', count: statusCounts.pending },
                    { value: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                    { value: 'samples_sent', label: 'Samples Sent', count: statusCounts.samples_sent },
                    { value: 'approved', label: 'Approved', count: statusCounts.approved },
                    { value: 'in_cart', label: 'In Cart', count: statusCounts.in_cart },
                    { value: 'completed', label: 'Completed', count: statusCounts.completed },
                    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
                  ].map(({ value, label, count }) => (
                    <button
                      key={value}
                      onClick={() => setFilterStatus(value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filterStatus === value
                          ? 'bg-primary-green text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Custom Requests</h3>
                <p className="text-gray-600">
                  {filterStatus === 'all' 
                    ? 'No custom requests have been submitted yet.'
                    : `No requests with status "${filterStatus.replace('_', ' ')}".`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onSendSamples={handleSendSamples}
                    onUpdate={fetchRequests}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Send Samples Modal */}
      {showSendSamples && selectedRequest && (
        <SendSamplesModal
          request={selectedRequest}
          onClose={() => {
            setShowSendSamples(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleSamplesSent}
        />
      )}
    </div>
  );
}

