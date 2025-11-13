import React, { ReactNode, useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
    } else {
      // Allows for exit animation before unmounting
      const timer = setTimeout(() => setIsRendering(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendering) return null;

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-200 ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-200 border border-gray-200 dark:border-gray-700 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;