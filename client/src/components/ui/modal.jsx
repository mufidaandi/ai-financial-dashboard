import * as React from "react";
import { Button } from "./button";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-80 p-4">
    <div className="overflow-y-auto p-6 pt-12 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] relative flex flex-col">
        <Button
          onClick={onClose}
          className="px-4 py-1 border-none absolute top-4 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl z-10"
          aria-label="Close"
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
