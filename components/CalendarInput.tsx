
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
  const [displayDate, setDisplayDate] = useState(new Date());
  const [isPositionedAbove, setIsPositionedAbove] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialDate = new Date(value);
    if (!isNaN(initialDate.getTime())) {
        setDisplayDate(initialDate);
    } else {
        setDisplayDate(new Date());
    }
  }, [value, isOpen]);

  useEffect(() => {
    const calculatePosition = () => {
        if (!isOpen || !containerRef.current) return;
        
        const inputRect = containerRef.current.getBoundingClientRect();
        if (!inputRect) return;

        const spaceBelow = window.innerHeight - inputRect.bottom;
        const calendarHeight = 380; // Approximate height of the calendar popup in pixels

        if (spaceBelow < calendarHeight && inputRect.top > calendarHeight) {
            setIsPositionedAbove(true);
        } else {
            setIsPositionedAbove(false);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
        calculatePosition();
        window.addEventListener('resize', calculatePosition);
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        window.removeEventListener('resize', calculatePosition);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const currentYear = displayDate.getFullYear();
  const years = useMemo(() => {
    const yearArr = [];
    for (let i = currentYear - 50; i <= currentYear + 10; i++) {
        yearArr.push(i);
    }
    return yearArr;
  }, [currentYear]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: new Date(0, i).toLocaleString(i18n.language, { month: 'long' })
    }));
  }, [i18n.language]);

  const calendarDays = useMemo(() => {
    const date = new Date(displayDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() === 0) ? 6 : firstDay.getDay() - 1;

    const days: (Date | null)[] = Array(startDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    while (days.length % 7 !== 0) {
        days.push(null);
    }
    return days;
  }, [displayDate]);

  const handleDateSelect = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    onChange({ target: { value: dateString } });
    setIsOpen(false);
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newYear);
        return newDate;
    });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newMonth);
        return newDate;
    });
  };

  const changeMonth = (delta: number) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(value);
  if (!isNaN(selectedDate.getTime())) {
    selectedDate.setHours(0, 0, 0, 0);
  }
  
  const popoverClasses = [
    'absolute',
    'z-50',
    'bg-white dark:bg-gray-800',
    'rounded-lg shadow-xl border border-gray-200 dark:border-gray-700',
    'p-4',
    'w-72', // A bit smaller to fit better on small screens
    isPositionedAbove ? 'bottom-full mb-2' : 'mt-2'
  ].join(' ');

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
          <div className={popoverClasses}>
            <div className="flex justify-between items-center mb-3">
              <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
               <div className="flex-grow flex justify-center items-center space-x-2">
                 <select value={displayDate.getMonth()} onChange={handleMonthChange} className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-semibold">
                      {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                  </select>
                  <select value={displayDate.getFullYear()} onChange={handleYearChange} className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-semibold">
                      {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                      ))}
                  </select>
               </div>
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
                        !isNaN(selectedDate.getTime()) && day.getTime() === selectedDate.getTime()
                          ? 'bg-primary text-white font-bold'
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
