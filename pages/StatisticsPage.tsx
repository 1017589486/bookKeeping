import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import { Transaction, TransactionType, Category, Asset } from '../types';
import { formatCurrency, getDateRangeForPeriod } from '../utils/helpers';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import CategoryIcon from '../components/CategoryIcon';

const StatisticsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { transactions, categories, assets, activeBillId, isLoading } = useAppContext();
    const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [currentDate, setCurrentDate] = useState(new Date());

    const { dateRange, prevDateRange } = useMemo(() => {
        const current = getDateRangeForPeriod(currentDate, period);
        let prevDate;
        if (period === 'monthly') {
            prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        } else if (period === 'quarterly') {
            prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        } else { // yearly
            prevDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        }
        const previous = getDateRangeForPeriod(prevDate, period);
        return { dateRange: current, prevDateRange: previous };
    }, [currentDate, period]);

    const changePeriod = (delta: number) => {
        const newDate = new Date(currentDate);
        if (period === 'monthly') newDate.setMonth(newDate.getMonth() + delta);
        if (period === 'quarterly') newDate.setMonth(newDate.getMonth() + delta * 3);
        if (period === 'yearly') newDate.setFullYear(newDate.getFullYear() + delta);
        setCurrentDate(newDate);
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'monthly':
                return currentDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' });
            case 'quarterly':
                const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
                return `${currentDate.getFullYear()} Q${quarter}`;
            case 'yearly':
                return String(currentDate.getFullYear());
        }
    };
    
    const getCategoryName = (category: Category | undefined) => {
        if (!category) return t('common.uncategorized');
        return category.isSeed ? t(category.name as any) : category.name;
    };

    if (!activeBillId) {
        return <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">{t('statistics.no_bill_selected')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('statistics.title')}</h1>
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {(['monthly', 'quarterly', 'yearly'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${period === p ? 'bg-white dark:bg-gray-700 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t(`statistics.${p}`)}</button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center items-center gap-4">
                <button onClick={() => changePeriod(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&lt;</button>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{getPeriodLabel()}</span>
                <button onClick={() => changePeriod(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&gt;</button>
            </div>
            
            <PeriodSection 
              dateRange={dateRange} 
              prevDateRange={prevDateRange} 
              activeBillId={activeBillId} 
              transactions={transactions} 
              categories={categories}
              assets={assets}
              getCategoryName={getCategoryName}
              isLoading={isLoading}
            />
        </div>
    );
};

interface PeriodSectionProps {
    dateRange: { start: Date, end: Date };
    prevDateRange: { start: Date, end: Date };
    activeBillId: string;
    transactions: Transaction[];
    categories: Category[];
    assets: Asset[];
    getCategoryName: (c: Category | undefined) => string;
    isLoading: boolean;
}
const PeriodSection: React.FC<PeriodSectionProps> = ({ dateRange, prevDateRange, activeBillId, transactions, categories, assets, getCategoryName, isLoading }) => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();

    const filteredTransactions = useMemo(() => transactions.filter(tx => 
        tx.billId === activeBillId && new Date(tx.date) >= dateRange.start && new Date(tx.date) <= dateRange.end
    ), [transactions, activeBillId, dateRange]);

    const prevFilteredTransactions = useMemo(() => transactions.filter(tx => 
        tx.billId === activeBillId && new Date(tx.date) >= prevDateRange.start && new Date(tx.date) <= prevDateRange.end
    ), [transactions, activeBillId, prevDateRange]);

    const activeBillCategories = useMemo(() => categories.filter(c => c.billId === activeBillId), [categories, activeBillId]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);
    
    const prevStats = useMemo(() => {
        const income = prevFilteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const expense = prevFilteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, balance: income - expense };
    }, [prevFilteredTransactions]);

    const categoryData = useMemo(() => {
        const data = (type: TransactionType) => activeBillCategories
            .filter(c => c.type === type)
            .map(category => ({
                name: getCategoryName(category),
                value: filteredTransactions.filter(t => t.categoryId === category.id).reduce((sum, t) => sum + t.amount, 0),
                color: category.color,
                icon: category.icon,
            }))
            .filter(item => item.value > 0);
        return { income: data(TransactionType.INCOME), expense: data(TransactionType.EXPENSE) };
    }, [activeBillCategories, filteredTransactions, getCategoryName]);

    const comparativeData = [
        { name: t('transactionTypes.income'), [t('statistics.current_period')]: stats.income, [t('statistics.previous_period')]: prevStats.income },
        { name: t('transactionTypes.expense'), [t('statistics.current_period')]: stats.expense, [t('statistics.previous_period')]: prevStats.expense },
    ];
    
    const assetDistributionData = useMemo(() => assets.map(asset => ({ name: asset.name, value: asset.balance })).sort((a,b) => b.value - a.value), [assets]);

    const totalAssets = useMemo(() => assetDistributionData.reduce((sum, item) => sum + item.value, 0), [assetDistributionData]);
    const largestAsset = useMemo(() => assetDistributionData.length > 0 ? assetDistributionData[0] : null, [assetDistributionData]);

    const assetFlowData = useMemo(() => assets.map(asset => {
        const income = filteredTransactions.filter(t => t.assetId === asset.id && t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.assetId === asset.id && t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        return { name: asset.name, income, expense };
    }).filter(d => d.income > 0 || d.expense > 0), [assets, filteredTransactions]);

    if (isLoading) return <div className="text-center">{t('common.loading')}</div>
    if (filteredTransactions.length === 0) return <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">{t('statistics.no_data_for_period')}</div>

    return (
        <div className="space-y-6">
            <StatCard title={t('statistics.period_summary')} children={
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryItem title={t('statistics.total_income')} value={formatCurrency(stats.income, i18n.language)} color="text-green-500" />
                    <SummaryItem title={t('statistics.total_expense')} value={formatCurrency(stats.expense, i18n.language)} color="text-red-500" />
                    <SummaryItem title={t('statistics.net_balance')} value={formatCurrency(stats.balance, i18n.language)} color={stats.balance >= 0 ? "text-gray-800 dark:text-gray-200" : "text-red-500"} />
                </div>
            }/>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <StatCard title={t('statistics.income_by_category')}>
                     <CategoryChart data={categoryData.income} />
                 </StatCard>
                 <StatCard title={t('statistics.expense_by_category')}>
                     <CategoryChart data={categoryData.expense} />
                 </StatCard>
            </div>
            
            <StatCard title={t('statistics.comparative_analysis')}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparativeData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                        <YAxis tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} formatter={(value: number) => formatCurrency(value, i18n.language)} />
                        <Legend />
                        <Bar dataKey={t('statistics.previous_period')} fill="#a5b4fc" />
                        <Bar dataKey={t('statistics.current_period')} fill="#6366f1" />
                    </BarChart>
                </ResponsiveContainer>
            </StatCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatCard title={t('statistics.asset_distribution')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[300px]">
                        <div className="relative h-[250px] md:h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={assetDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={2}>
                                        {assetDistributionData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {largestAsset && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white text-center w-3/4 truncate" title={largestAsset.name}>{largestAsset.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{totalAssets > 0 ? ((largestAsset.value / totalAssets) * 100).toFixed(1) : '0.0'}%</span>
                                </div>
                            )}
                        </div>
                         <div className="space-y-4 self-center overflow-y-auto max-h-[280px] no-scrollbar">
                            {assetDistributionData.map((asset, index) => {
                                const percentage = totalAssets > 0 ? (asset.value / totalAssets) * 100 : 0;
                                const color = COLORS[index % COLORS.length];
                                return (
                                    <div key={asset.name}>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <div className="flex items-center truncate">
                                                <CategoryIcon icon="briefcase" color={color} size="w-8 h-8" />
                                                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200 truncate" title={asset.name}>{asset.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono flex-shrink-0 ml-2">{formatCurrency(asset.value, i18n.language)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right font-mono">{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </StatCard>
                <StatCard title={t('statistics.cash_flow_by_asset')}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={assetFlowData} layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                            <XAxis type="number" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                            <YAxis type="category" dataKey="name" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} width={80} />
                            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} formatter={(value: number) => formatCurrency(value, i18n.language)} />
                            <Legend />
                            <Bar dataKey="income" fill="#10b981" name={t('transactionTypes.income')} />
                            <Bar dataKey="expense" fill="#ef4444" name={t('transactionTypes.expense')} />
                        </BarChart>
                    </ResponsiveContainer>
                </StatCard>
            </div>
        </div>
    );
};

const StatCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        {children}
    </div>
);

const SummaryItem: React.FC<{title: string, value: string, color: string}> = ({title, value, color}) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#f97316'];

const CategoryChart: React.FC<{ data: { name: string; value: number; color: string; icon: string; }[] }> = ({ data }) => {
    const { t, i18n } = useTranslation();
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const largestCategory = useMemo(() => {
        if (data.length === 0) return null;
        return data.slice().sort((a, b) => b.value - a.value)[0];
    }, [data]);

    if (data.length === 0) return <div className="h-[300px] flex items-center justify-center text-gray-500">{t('dashboard.no_data')}</div>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[300px]">
            <div className="h-[250px] md:h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={2}>
                            {data.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {largestCategory && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-bold text-gray-900 dark:text-white text-center w-3/4 truncate" title={largestCategory.name}>{largestCategory.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{total > 0 ? ((largestCategory.value / total) * 100).toFixed(1) : '0.0'}%</span>
                    </div>
                )}
            </div>
            <div className="space-y-4 self-center overflow-y-auto max-h-[280px] no-scrollbar">
                {data.slice().sort((a,b) => b.value - a.value).map(item => {
                    const percentage = total > 0 ? (item.value / total * 100) : 0;
                    return (
                        <div key={item.name}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <div className="flex items-center truncate">
                                    <CategoryIcon icon={item.icon} color={item.color} size="w-8 h-8" />
                                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200 truncate" title={item.name}>{item.name}</span>
                                </div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono flex-shrink-0 ml-2">{formatCurrency(item.value, i18n.language)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right font-mono">{percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};


export default StatisticsPage;