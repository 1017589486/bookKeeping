
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface CalendarInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (e: { target: { value: string } }) => void;
}

const CalendarInput: React.FC<CalendarInputProps> = ({ label, id, value, onChange, ...props }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date(value || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayDate(new Date(value || new Date()));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calendarDays = useMemo(() => {
    const date = new Date(displayDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() === 0) ? 6 : firstDay.getDay() - 1; // Monday as first day

    const days: (Date | null)[] = Array(startDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [displayDate]);

  const handleDateSelect = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    onChange({ target: { value: dateString } });
    setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Avoid month skipping issues
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(value);
  selectedDate.setHours(0, 0, 0, 0);

  return (
    <div ref={containerRef}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          value={value}
          className="w-full pl-3 pr-10 py-2 cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {displayDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="flex justify-center items-center h-9">
                  {day && (
                    <button
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                        day.getTime() === selectedDate.getTime()
                          ? 'bg-primary text-white'
                          : day.getTime() === today.getTime()
                          ? 'border-2 border-primary text-primary'
                          : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarInput;