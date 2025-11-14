
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// FIX: Import the 'Button' component to fix reference errors.
import Button from '../Button';

const DateSelectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (date: Date) => void; currentDate: Date }> = ({ isOpen, onClose, onSelect, currentDate }) => {
    const { t, i18n } = useTranslation();
    const [displayDate, setDisplayDate] = useState(new Date(currentDate));
    const [selectedTime, setSelectedTime] = useState({ 
        hour: currentDate.getHours(), 
        minute: currentDate.getMinutes() 
    });
    
    useEffect(() => {
        if(isOpen) {
            setDisplayDate(new Date(currentDate));
            setSelectedTime({
                hour: currentDate.getHours(),
                minute: currentDate.getMinutes()
            });
        }
    }, [isOpen, currentDate]);

    const changeMonth = (delta: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };
    
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
        return days;
    }, [displayDate]);

    const handleConfirm = () => {
        const finalDate = new Date(displayDate);
        finalDate.setHours(selectedTime.hour, selectedTime.minute);
        onSelect(finalDate);
    }
    
    const years = useMemo(() => Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - 50 + i), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString(i18n.language, { month: 'long' })), [i18n.language]);

    if (!isOpen) return null;

    const quickSelectDate = (daysAgo: number) => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() - daysAgo);
        setDisplayDate(newDate);
    }
    
    const handleTimeChange = (part: 'hour' | 'minute', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;
        if (part === 'hour' && numValue >= 0 && numValue <= 23) {
            setSelectedTime(prev => ({ ...prev, hour: numValue }));
        }
        if (part === 'minute' && numValue >= 0 && numValue <= 59) {
            setSelectedTime(prev => ({...prev, minute: numValue}));
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full max-w-sm rounded-2xl p-4 m-4 shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&lt;</button>
                    <div className="flex space-x-2">
                        <select 
                            value={displayDate.getFullYear()} 
                            onChange={(e) => setDisplayDate(new Date(parseInt(e.target.value), displayDate.getMonth()))}
                            className="bg-transparent font-semibold focus:outline-none p-1 rounded-md border border-gray-300 dark:border-gray-600"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select 
                            value={displayDate.getMonth()} 
                            onChange={(e) => setDisplayDate(new Date(displayDate.getFullYear(), parseInt(e.target.value)))}
                            className="bg-transparent font-semibold focus:outline-none p-1 rounded-md border border-gray-300 dark:border-gray-600"
                        >
                            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day}>{day}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                        <div key={index} className="flex justify-center items-center h-10">
                            {day && (
                                <button
                                    onClick={() => setDisplayDate(day)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${displayDate.toDateString() === day.toDateString() ? 'bg-danger text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {day.getDate()}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                 <div className="mt-4 flex justify-around">
                    <button onClick={() => quickSelectDate(0)} className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm">{t('add_transaction.today')}</button>
                    <button onClick={() => quickSelectDate(1)} className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm">{t('add_transaction.yesterday')}</button>
                    <button onClick={() => quickSelectDate(2)} className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm">{t('add_transaction.day_before')}</button>
                </div>

                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">Time</span>
                        <input type="number" min="0" max="23" value={String(selectedTime.hour).padStart(2, '0')} onChange={(e) => handleTimeChange('hour', e.target.value)} className="w-14 bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-center" />
                        <span>:</span>
                        <input type="number" min="0" max="59" value={String(selectedTime.minute).padStart(2, '0')} onChange={(e) => handleTimeChange('minute', e.target.value)} className="w-14 bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-center" />
                    </div>
                    <div>
                        <Button onClick={handleConfirm} variant="primary">{t('common.confirm')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateSelectModal;