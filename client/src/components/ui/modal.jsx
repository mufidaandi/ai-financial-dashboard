import * as React from "react";
import { Button } from "./button";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-80">
  <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <Button
          onClick={onClose}
          className="px-4 py-1 border-none absolute top-4 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl"
          aria-label="Close"
        >
          &times;
        </Button>
        {children}
      </div>
    </div>
  );
};

export { Modal };
