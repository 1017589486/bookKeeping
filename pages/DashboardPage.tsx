// Fix: Imported `useEffect` from React to resolve 'Cannot find name' error.
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, Category, Asset } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '../hooks/useTheme';
import { formatCurrency } from '../utils/helpers';

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; }> = ({ icon, title, value }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center space-x-4 shadow-lg">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">{icon}</div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(value)}</p>
            </div>
        </div>
    );
};

const DailyDistributionChart: React.FC<{ transactions: Transaction[], currentDate: Date }> = ({ transactions, currentDate }) => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();

    const data = useMemo(() => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ day: String(i + 1).padStart(2, '0'), expense: 0, income: 0 }));

        transactions.forEach(t => {
            // FIX: Parse day from string to avoid timezone issues
            const day = parseInt(t.date.substring(8, 10), 10);
            const dayIndex = day - 1;

            if (dayIndex >= 0 && dayIndex < daysInMonth) {
                if (t.type === TransactionType.EXPENSE) {
                    dailyData[dayIndex].expense += t.amount;
                } else if (t.type === TransactionType.INCOME) {
                    dailyData[dayIndex].income += t.amount;
                }
            }
        });
        return dailyData;
    }, [transactions, currentDate]);
    
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl h-[300px] flex flex-col shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.income_expense_distribution')}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: -10 }}>
                        <CartesianGrid stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} strokeDasharray="0" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 12 }} tickLine={false} axisLine={false} interval={1} />
                        <YAxis tick={{ fill: tickColor, fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 'dataMax + 1000']} />
                         <Tooltip
                            cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                borderRadius: '0.5rem',
                            }}
                            formatter={(value: number, name: string) => [formatCurrency(value, i18n.language), name === t('transactionTypes.income') ? t('transactionTypes.income') : t('transactionTypes.expense')]}
                            labelFormatter={(label) => `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${label}`}
                        />
                        <Legend verticalAlign="top" formatter={(value) => value} />
                        <Bar dataKey="income" fill="#34C759" name={t('transactionTypes.income')} barSize={4} radius={[2, 2, 0, 0]} />
                        <Bar dataKey="expense" fill="#FF453A" name={t('transactionTypes.expense')} barSize={4} radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const CategoryDonutChart: React.FC<{ transactions: Transaction[], categories: Category[] }> = ({ transactions, categories }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();

    const data = useMemo(() => {
        return categories
            .filter(c => c.type === type)
            .map(category => {
                const total = transactions
                    .filter(t => t.categoryId === category.id && t.type === type)
                    .reduce((sum, t) => sum + t.amount, 0);
                return { name: category.name, value: total, color: category.color };
            })
            .filter(item => item.value > 0);
    }, [transactions, categories, type]);

    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const largestCategory = useMemo(() => data.length > 0 ? data.slice().sort((a,b) => b.value - a.value)[0] : null, [data]);

    const [activeCategory, setActiveCategory] = useState(largestCategory);

    useEffect(() => {
        setActiveCategory(largestCategory);
    }, [largestCategory]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.expense_by_category')}</h3>
                 <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-1 text-sm rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('transactionTypes.expense')}</button>
                    <button onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-1 text-sm rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('transactionTypes.income')}</button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
                <div className="relative h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                dataKey="value" 
                                nameKey="name" 
                                paddingAngle={0}
                                onMouseEnter={(entry) => setActiveCategory(entry)}
                                onMouseLeave={() => setActiveCategory(largestCategory)}
                            >
                                {data.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={theme === 'dark' ? '#1f2937' : '#ffffff'} strokeWidth={2} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {activeCategory && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-bold text-gray-900 dark:text-white text-center w-3/4 truncate">{activeCategory.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{total > 0 ? ((activeCategory.value / total) * 100).toFixed(2) : '0.00'}%</span>
                        </div>
                    )}
                     {data.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">{t('dashboard.no_data')}</span>
                        </div>
                    )}
                </div>
                <div className="space-y-2 self-center overflow-y-auto max-h-[200px]">
                  {data.slice().sort((a,b) => b.value - a.value).map(item => (
                    <div key={item.name} className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{item.name}</span>
                        <span className="text-gray-900 dark:text-white text-sm ml-auto font-medium">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    );
};

const Calendar: React.FC<{
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    transactions: Transaction[];
}> = ({ currentDate, setCurrentDate, selectedDate, setSelectedDate, transactions }) => {
    const { i18n } = useTranslation();
    
    const days = useMemo(() => {
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;
        const calendarDays: (Date | null)[] = Array(startDayOfWeek).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(new Date(year, month, i));
        }
        return calendarDays;
    }, [currentDate]);

    const dailyTotals = useMemo(() => {
        const totals = new Map<string, number>();
        transactions.forEach(t => {
            const dateKey = t.date.substring(0, 10); // "YYYY-MM-DD"
            const currentTotal = totals.get(dateKey) || 0;
            const amount = t.type === TransactionType.EXPENSE ? -t.amount : t.amount;
            totals.set(dateKey, currentTotal + amount);
        });
        return totals;
    }, [transactions]);

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(1); // Avoid month skipping issues
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full">&lt;</button>
                <h4 className="font-semibold text-gray-900 dark:text-white">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h4>
                <button onClick={() => changeMonth(1)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                {weekdays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {days.map((day, index) => {
                    if (!day) return <div key={index} className="flex flex-col items-center justify-start h-12 py-1" />;

                    const y = day.getFullYear();
                    const m = String(day.getMonth() + 1).padStart(2, '0');
                    const d = String(day.getDate()).padStart(2, '0');
                    const dateKey = `${y}-${m}-${d}`;
                    
                    return (
                        <div key={index} className="flex flex-col items-center justify-start h-12 py-1">
                            <button onClick={() => setSelectedDate(day)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${selectedDate?.toDateString() === day.toDateString() ? 'bg-primary text-white' : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {day.getDate()}
                            </button>
                            {dailyTotals.has(dateKey) && (
                                <span className={`text-xs mt-1 font-mono ${dailyTotals.get(dateKey)! < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {dailyTotals.get(dateKey)!.toFixed(0)}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const DailyTransactionList: React.FC<{ transactions: Transaction[], categories: Category[], assets: Asset[] }> = ({ transactions, categories, assets }) => {
    const groupedTransactions = useMemo(() => {
        return transactions.reduce((acc, tx) => {
            const dateKey = tx.date.substring(0, 10);
            if (!acc[dateKey]) {
                acc[dateKey] = { txs: [], totalExpense: 0 };
            }
            acc[dateKey].txs.push(tx);
            if (tx.type === TransactionType.EXPENSE) {
                acc[dateKey].totalExpense += tx.amount;
            }
            return acc;
        }, {} as Record<string, { txs: Transaction[], totalExpense: number }>);
    }, [transactions]);

    const formatGroupedDate = (dateKey: string) => {
        const date = new Date(`${dateKey}T00:00:00`);
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + date.toLocaleDateString('zh-CN', { weekday: 'short' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl space-y-2 overflow-y-auto max-h-[300px] shadow-lg no-scrollbar">
            {Object.entries(groupedTransactions).sort(([dateA], [dateB]) => dateB.localeCompare(dateA)).map(([dateKey, { txs, totalExpense }]) => (
                <div key={dateKey}>
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatGroupedDate(dateKey)}</span>
                        {totalExpense > 0 && <span className="text-sm text-gray-500 dark:text-gray-400">支:{formatNumber(totalExpense)}</span>}
                    </div>
                    <div className="space-y-1">
                        {txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                            const category = categories.find(c => c.id === tx.categoryId);
                            const asset = assets.find(a => a.id === tx.assetId);
                            const time = new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                            
                            const details = [asset?.name, tx.notes, time].filter(Boolean).join('  ·  ');

                            return (
                                <div key={tx.id} className="flex items-center justify-between py-1.5">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: category?.color ?? '#9ca3af' }}></span>
                                        <div className="flex-grow">
                                            <p className="text-gray-900 dark:text-white text-sm">{category?.name || 'Uncategorized'}</p>
                                            {details && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate" title={details}>{details}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right ml-4 flex-shrink-0">
                                        <span className={`font-mono text-sm ${tx.type === TransactionType.EXPENSE ? 'text-red-500' : 'text-green-500'}`}>
                                            {tx.type === TransactionType.EXPENSE ? '-' : '+'}{formatNumber(tx.amount)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions this month.</p>}
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { transactions, categories, activeBillId, isLoading, assets } = useAppContext();
    const { t } = useTranslation();
    
    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        return new Date(year, month, 1);
    });

    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }, []);

    const transactionsForMonth = useMemo(() => {
        if (!activeBillId) return [];
        return transactions.filter(t => {
            // FIX: Parse date parts from string to avoid timezone issues
            const [year, month] = t.date.substring(0, 10).split('-').map(Number);
            return t.billId === activeBillId &&
                year === currentDate.getFullYear() &&
                month === currentDate.getMonth() + 1;
        });
    }, [transactions, activeBillId, currentDate]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        let income = 0;
        let expense = 0;
        
        transactionsForMonth.forEach(tx => {
            if (tx.type === TransactionType.INCOME) income += tx.amount;
            else expense += tx.amount;
        });
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [transactionsForMonth]);
    
    const activeBillCategories = useMemo(() => {
        const billCategories = categories.filter(c => c.billId === activeBillId);
        return billCategories.map(c => ({...c, name: c.isSeed ? t(c.name as any) : c.name }));
    }, [categories, activeBillId, t]);

    if (isLoading) {
        return <div className="text-center text-gray-500 dark:text-gray-400">Loading financial data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="支出" value={totalExpense} icon={<div className="bg-[#FF3B30] w-full h-full rounded-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>}/>
                <StatCard title="收入" value={totalIncome} icon={<div className="bg-[#34C759] w-full h-full rounded-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0a5 5 0 01-10 0m10 0a2 2 0 11-4 0 2 2 0 014 0zM12 15v2m-3-2v2m6-2v2M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg></div>}/>
                <StatCard title="结余" value={balance} icon={<div className="bg-[#007AFF] w-full h-full rounded-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" /></svg></div>}/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <DailyDistributionChart transactions={transactionsForMonth} currentDate={currentDate} />
                    <CategoryDonutChart transactions={transactionsForMonth} categories={activeBillCategories} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Calendar 
                        currentDate={currentDate} 
                        setCurrentDate={setCurrentDate} 
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        transactions={transactionsForMonth} 
                    />
                    <DailyTransactionList 
                        transactions={transactionsForMonth} 
                        categories={activeBillCategories}
                        assets={assets}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;