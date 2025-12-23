import React from 'react';
import { X } from 'lucide-react';
import ClayButton from './ClayButton';

interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ClayModal: React.FC<ClayModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-gray-100 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-gray-200 bg-gray-50/50 rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClayModal;
