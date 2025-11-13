import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <input
        id={id}
        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
        {...props}
      />
    </div>
  );
};

export default Input;