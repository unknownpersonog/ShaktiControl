'use client';
import React from 'react';

interface ShareDialogProps {
  shareLink: string;
  onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ shareLink, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Share Whiteboard</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Shareable Link</label>
        <div className="flex">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 border border-gray-600 rounded-l-lg px-3 py-2 bg-gray-700 text-white"
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default ShareDialog;
