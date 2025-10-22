import * as React from "react";
import { Button } from "./button";

const Modal = ({ open, onClose, children }) => {
  const modalRef = React.useRef(null);
  const previousActiveElement = React.useRef(null);

  // Focus management
  React.useEffect(() => {
    if (open) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restore background scrolling
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  // Focus trap
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className="overflow-y-auto p-6 pt-12 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <Button
          onClick={onClose}
          className="px-4 py-1 border-none absolute top-4 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl z-10 focus:outline-none focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-400"
          aria-label="Close modal"
        >
          &times;
        </Button>
        <div className="">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
