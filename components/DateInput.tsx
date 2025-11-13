import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const DateInput: React.FC<DateInputProps> = ({ label, id, ...props }) => {
  const { theme } = useTheme();

  // Style for the calendar icon to work in dark mode
  const style = {
    colorScheme: theme,
  };

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type="date"
          className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
          style={style}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DateInput;