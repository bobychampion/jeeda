import React, { useState } from 'react';
import { X, Upload, Send, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api.js';

export default function SendSamplesModal({ request, onClose, onSuccess }) {
  const { userData } = useAuth();
  const [samples, setSamples] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setSamples(prev => [...prev, ...uploadedUrls.map(u => u.url)]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeSample = (index) => {
    setSamples(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (samples.length === 0) {
      alert('Please upload at least one sample image.');
      return;
    }

    setSending(true);
    try {
      // API_URL is imported from config/api.js
      const token = await userData?.getIdToken?.();
      
      const response = await fetch(`${API_URL}/api/custom-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          samples,
          status: 'samples_sent',
          adminNotes: adminNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send samples');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending samples:', error);
      alert('Failed to send samples. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Samples</h2>
            <p className="text-sm text-gray-600 mt-1">{request.templateName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={sending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Customer Request:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> {request.userEmail}</p>
              {request.modifications && Object.keys(request.modifications).length > 0 && (
                <div>
                  <strong>Modifications:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {Object.entries(request.modifications).map(([key, value]) => {
                      if (!value || value === '') return null;
                      return <li key={key} className="capitalize">{key}: {value}</li>;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Upload Samples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Images <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Upload sample images showing the customized furniture. These will be sent to the customer via email.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="sample-upload"
                disabled={uploading || sending}
              />
              <label
                htmlFor="sample-upload"
                className={`cursor-pointer flex flex-col items-center ${uploading || sending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload sample images'}
                </span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</span>
              </label>
            </div>

            {/* Uploaded Samples Preview */}
            {samples.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {samples.map((sampleUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={sampleUrl}
                      alt={`Sample ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200?text=Image';
                      }}
                    />
                    <button
                      onClick={() => removeSample(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={sending}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div>
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Add any internal notes about these samples..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              disabled={sending}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={samples.length === 0 || sending || uploading}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Samples
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

