import React, { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  maxWidth = "max-w-md",
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200">
      <div
        className={clsx(
          "animate-in zoom-in-95 flex max-h-[90vh] w-full flex-col rounded-xl border border-gray-600 bg-gray-800 shadow-2xl duration-200",
          maxWidth,
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-700 p-4">
          <div className="flex-1 truncate pr-4 text-xl font-bold text-white">
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <div className="custom-scrollbar overflow-y-auto p-6 text-white">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 rounded-b-xl border-t border-gray-700 bg-gray-900/50 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
