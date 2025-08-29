import React, { useEffect, useRef } from 'react';
import { X, Share2, Copy } from 'lucide-react';
import QRCode from 'qrcode.js';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && qrCodeRef.current) {
      // Clear any existing QR code
      qrCodeRef.current.innerHTML = '';
      
      // Generate new QR code
      const qr = new QRCode(qrCodeRef.current, {
        text: shareUrl,
        width: 200,
        height: 200,
        colorDark: '#1f2937',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
      });
    }
  }, [isOpen, shareUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Share App</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">
            Scan the QR code or copy the link to share this app
          </p>
          
          {/* QR Code Container */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
              <div ref={qrCodeRef} className="flex justify-center"></div>
            </div>
          </div>

          {/* URL Display and Copy */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-600 font-mono break-all">
                {shareUrl}
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Share this link to let others use the Things from the Future card game
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;