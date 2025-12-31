import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, footer, className, maxWidth = "max-w-md" }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div
        className={clsx(
            "bg-gray-800 rounded-xl w-full shadow-2xl border border-gray-600 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200",
            maxWidth,
            className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
           <div className="text-xl font-bold text-white truncate flex-1 pr-4">{title}</div>
           <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar text-white">
            {children}
        </div>
        {footer && (
            <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-xl shrink-0">
                {footer}
            </div>
        )}
      </div>
    </div>
  );
};
