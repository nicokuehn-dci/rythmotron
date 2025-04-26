import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import withErrorBoundary from './withErrorBoundary';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

export const ModalBase: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOutsideClick = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-6xl w-full h-[90vh]'
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`${
          sizeClasses[size]
        } w-full bg-zinc-900 border border-zinc-800 shadow-2xl shadow-purple-900/20 rounded-xl overflow-hidden transition-all duration-300 transform ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ maxHeight: size === 'full' ? '90vh' : 'calc(100vh - 2rem)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800">
          <h2 className="text-xl font-medium">{title}</h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleClose}
            >
              <i className="fa-solid fa-xmark"></i>
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        <div className="overflow-auto" style={{ maxHeight: size === 'full' ? 'calc(90vh - 4rem)' : 'calc(100vh - 8rem)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Mit ErrorBoundary umwickeln
const Modal = withErrorBoundary(ModalBase, 'Modal');
export default Modal;