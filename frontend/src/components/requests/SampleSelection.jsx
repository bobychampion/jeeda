import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function SampleSelection({ samples, onSelect, onClose }) {
  const [selectedSample, setSelectedSample] = useState(null);

  const handleConfirm = () => {
    if (selectedSample) {
      onSelect(selectedSample);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Select Your Preferred Sample</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Please review all samples and select the one you'd like to proceed with. You can also request adjustments if needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {samples.map((sampleUrl, index) => (
              <div
                key={index}
                onClick={() => setSelectedSample(sampleUrl)}
                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedSample === sampleUrl
                    ? 'border-primary-green ring-4 ring-primary-green ring-opacity-20'
                    : 'border-gray-200 hover:border-gray-300'
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
                {selectedSample === sampleUrl && (
                  <div className="absolute top-2 right-2 bg-primary-green text-white rounded-full p-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                )}
                <div className="p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">Sample {index + 1}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedSample && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                You've selected a sample. Click "Confirm Selection" to proceed.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSample}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

