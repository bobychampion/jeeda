import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Mail, User, Calendar, Image as ImageIcon, Send } from 'lucide-react';

export default function RequestCard({ request, onSendSamples, onUpdate }) {
  const navigate = useNavigate();

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
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-text-dark">{request.templateName || 'Unknown Template'}</h3>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="capitalize">{request.status?.replace('_', ' ') || 'Unknown'}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{request.userEmail || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(request.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modifications */}
      {request.modifications && Object.keys(request.modifications).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Modifications:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(request.modifications).map(([key, value]) => {
              if (!value || value === '') return null;
              return (
                <span key={key} className="px-2 py-1 bg-white rounded text-xs text-gray-700">
                  <span className="capitalize">{key}:</span> {value}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {request.additionalNotes && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
          <p className="text-sm text-gray-600">{request.additionalNotes}</p>
        </div>
      )}

      {/* Samples */}
      {request.samples && request.samples.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Samples Sent:</p>
          <div className="flex gap-2 flex-wrap">
            {request.samples.map((sampleUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={sampleUrl}
                  alt={`Sample ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80?text=Image';
                  }}
                />
                {request.selectedSample === sampleUrl && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {request.selectedSample && (
            <p className="text-xs text-green-600 mt-2">✓ Sample selected by customer</p>
          )}
        </div>
      )}

      {/* Adjustment Requests */}
      {request.adjustmentRequests && request.adjustmentRequests.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            Adjustment Requests: {request.adjustmentRequests.length}
          </p>
          {request.adjustmentRequests.slice(-1).map((adj, index) => (
            <p key={index} className="text-xs text-yellow-700">
              Latest: {adj.description || 'See details'}
            </p>
          ))}
        </div>
      )}

      {/* Admin Notes */}
      {request.adminNotes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Admin Notes:</p>
          <p className="text-xs text-blue-700">{request.adminNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        {request.status === 'pending' || request.status === 'in_progress' ? (
          <button
            onClick={() => onSendSamples(request)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 text-sm"
          >
            <Send className="w-4 h-4" />
            Send Samples
          </button>
        ) : request.status === 'samples_sent' && !request.selectedSample ? (
          <span className="text-sm text-gray-600">Waiting for customer selection...</span>
        ) : request.selectedSample ? (
          <span className="text-sm text-green-600">✓ Customer approved sample</span>
        ) : null}

        <button
          onClick={() => navigate(`/custom-requests/${request.id}`)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

