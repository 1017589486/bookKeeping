
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, Category, Asset } from '../types';
import AssetTrendChart from '../components/charts/AssetTrendChart';
import { formatDate, formatCurrency, getCurrentDateString } from '../utils/helpers';
import CategoryIcon from '../components/CategoryIcon';
import Button from '../components/Button';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Input from '../components/Input';

interface ToggleButtonProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}
const ToggleButton: React.FC<ToggleButtonProps> = ({ children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
            active ? 'bg-white dark:bg-gray-800 text-primary shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);

const SummaryCard: React.FC<{title: string, value: string, color?: string}> = ({title, value, color = 'text-gray-900 dark:text-gray-100'}) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </div>
);


const AssetDetailPage: React.FC = () => {
    const { assetId } = useParams<{ assetId: string }>();
    const { user, assets, transactions, categories, bills, addTransaction, addCategory } = useAppContext();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [trendView, setTrendView] = useState<'monthly' | 'daily'>('monthly');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

    const asset = useMemo(() => assets.find(a => a.id === assetId), [assets, assetId]);
    const assetTransactions = useMemo(() => {
        if (!assetId) return [];
        return transactions
            .filter(t => t.assetId === assetId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, assetId]);

    const availableYears = useMemo(() => {
      if (assetTransactions.length === 0) return ['all'];
      const years = [...new Set(assetTransactions.map(tx => new Date(tx.date).getFullYear()))];
      return ['all', ...years.sort((a, b) => b - a).map(String)];
    }, [assetTransactions]);

    const filteredTransactions = useMemo(() => {
        return assetTransactions.filter(t => {
            const txDate = new Date(t.date);
            const yearMatch = selectedYear === 'all' || txDate.getFullYear() === parseInt(selectedYear, 10);
            const monthMatch = selectedMonth === 'all' || (txDate.getMonth() + 1) === parseInt(selectedMonth, 10);
            return yearMatch && monthMatch;
        });
    }, [assetTransactions, selectedYear, selectedMonth]);

    const summaryStats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const total = income + expense;
        return {
            income,
            expense,
            incomeRatio: total > 0 ? (income / total) * 100 : 0,
            expenseRatio: total > 0 ? (expense / total) * 100 : 0,
        };
    }, [filteredTransactions]);

    const trendData = useMemo(() => {
        if (!asset) return [];
        const currentBalance = asset.balance;
        
        if (trendView === 'daily') {
            const data: { name: string; balance: number }[] = [];
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setHours(23, 59, 59, 999);
                date.setDate(today.getDate() - i);

                const transactionsAfter = assetTransactions.filter(t => new Date(t.date) > date);
                const netChangeAfter = transactionsAfter.reduce((sum, tx) => {
                    return sum + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount);
                }, 0);

                const balanceOnDate = currentBalance - netChangeAfter;
                data.push({
                    name: date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
                    balance: balanceOnDate,
                });
            }
            return data.reverse();
        }

        if (trendView === 'monthly') {
            const data: { name: string; balance: number }[] = [];
            const today = new Date();
            for (let i = 0; i < 12; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
                date.setHours(23, 59, 59, 999);

                const transactionsAfter = assetTransactions.filter(t => new Date(t.date) > date);
                const netChangeAfter = transactionsAfter.reduce((sum, tx) => {
                    return sum + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount);
                }, 0);
                
                const balanceOnDate = currentBalance - netChangeAfter;
                data.push({
                    name: date.toLocaleDateString(i18n.language, { month: 'short', year: '2-digit' }),
                    balance: balanceOnDate,
                });
            }
            return data.reverse();
        }
        return [];

    }, [asset, assetTransactions, trendView, i18n.language]);

    const handleSaveBalance = async (newBalanceStr: string) => {
        if (!asset || !user) return;
        const newBalance = parseFloat(newBalanceStr);
        if (isNaN(newBalance)) return;

        const adjustmentAmount = newBalance - asset.balance;

        if (Math.abs(adjustmentAmount) < 0.01) {
            setIsBalanceModalOpen(false);
            return; // No change needed
        }

        const ownedBills = bills.filter(b => b.userId === user.id);
        if (ownedBills.length === 0) {
            alert(t('assets.no_bill_for_adjustment'));
            setIsBalanceModalOpen(false);
            return;
        }
        const defaultBillId = ownedBills[0].id;

        const adjustmentType = adjustmentAmount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
        const categoryNameKey = 'seedCategories.balance_adjustment';
        
        let adjustmentCategory = categories.find(c => c.name === categoryNameKey && c.billId === defaultBillId && c.type === adjustmentType);
        
        if (!adjustmentCategory) {
            const newCategory = await addCategory({
                name: categoryNameKey,
                isSeed: true,
                type: adjustmentType,
                icon: 'briefcase',
                color: '#6366F1',
                billId: defaultBillId,
            });
            adjustmentCategory = newCategory;
        }

        if (adjustmentCategory) {
            await addTransaction({
                billId: defaultBillId,
                categoryId: adjustmentCategory.id,
                type: adjustmentType,
                amount: Math.abs(adjustmentAmount),
                date: getCurrentDateString(),
                notes: t('assets.balance_adjustment_notes'),
                assetId: asset.id
            });
        }

        setIsBalanceModalOpen(false);
    };

    if (!asset) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Asset not found</h2>
                <Button onClick={() => navigate('/assets')} className="mt-4">Back to Assets</Button>
            </div>
        );
    }
    
    const getCategoryName = (category: Category | undefined) => {
        if (!category) return t('common.uncategorized');
        return category.isSeed ? t(category.name as any) : category.name;
    };
    
    const getBillName = (billId: string) => bills.find(b => b.id === billId)?.name || 'N/A';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/assets')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{asset.name}</h2>
                 </div>
                 <Button onClick={() => setIsBalanceModalOpen(true)} variant="secondary">
                    {t('assets.balance_bill')}
                </Button>
            </div>

             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-primary uppercase tracking-wide">{asset.type}</p>
                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-gray-200">{formatCurrency(asset.balance, i18n.language)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('assets.asset_trend_analysis')}</h3>
                    </div>
                     <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
                        <ToggleButton active={trendView === 'monthly'} onClick={() => setTrendView('monthly')}>{t('assets.monthly')}</ToggleButton>
                        <ToggleButton active={trendView === 'daily'} onClick={() => setTrendView('daily')}>{t('assets.daily')}</ToggleButton>
                    </div>
                </div>
                <AssetTrendChart data={trendData} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="flex items-center">
                        <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('assets.asset_transactions')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} aria-label={t('assets.select_year')}>
                            {availableYears.map(year => <option key={year} value={year}>{year === 'all' ? t('assets.all_years') : year}</option>)}
                        </Select>
                        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} aria-label={t('assets.select_month')}>
                            <option value="all">{t('assets.all_months')}</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => <option key={month} value={month}>{new Date(0, month - 1).toLocaleString(i18n.language, { month: 'long' })}</option>)}
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <SummaryCard title={t('assets.period_income')} value={formatCurrency(summaryStats.income, i18n.language)} color="text-green-500" />
                    <SummaryCard title={t('assets.period_expense')} value={formatCurrency(summaryStats.expense, i18n.language)} color="text-red-500" />
                    <SummaryCard title={t('assets.income_ratio')} value={`${summaryStats.incomeRatio.toFixed(1)}%`} />
                    <SummaryCard title={t('assets.expense_ratio')} value={`${summaryStats.expenseRatio.toFixed(1)}%`} />
                </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">{t('transactions.date')}</th>
                                <th scope="col" className="px-6 py-3 font-medium">{t('transactions.category')}</th>
                                <th scope="col" className="px-6 py-3 font-medium">{t('nav.bills')}</th>
                                <th scope="col" className="px-6 py-3 font-medium text-right">{t('dashboard.amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(transaction => {
                                const category = categories.find(c => c.id === transaction.categoryId);
                                return (
                                    <tr key={transaction.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">{formatDate(transaction.date, i18n.language)}</td>
                                        <td className="px-6 py-4 flex items-center">
                                            {category && <CategoryIcon icon={category.icon} color={category.color} />}
                                            <span className="ml-3 font-medium text-gray-900 dark:text-gray-100">{getCategoryName(category)}</span>
                                        </td>
                                        <td className="px-6 py-4">{getBillName(transaction.billId)}</td>
                                        <td className={`px-6 py-4 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-secondary' : 'text-danger'}`}>
                                            {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, i18n.language)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('assets.no_transactions')}</p>}
                </div>
            </div>
            <BalanceAssetModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                onSave={handleSaveBalance}
                asset={asset}
            />
        </div>
    );
};

interface BalanceAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newBalance: string) => void;
    asset: Asset | null;
}

const BalanceAssetModal: React.FC<BalanceAssetModalProps> = ({ isOpen, onClose, onSave, asset }) => {
    const { t, i18n } = useTranslation();
    const [newBalance, setNewBalance] = useState('');

    useEffect(() => {
        if (asset) {
            setNewBalance(String(asset.balance));
        }
    }, [asset, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(newBalance);
    };

    if (!asset) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('assets.balance_asset_title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('assets.current_balance')}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(asset.balance, i18n.language)}</p>
                </div>
                <Input
                    label={t('assets.actual_balance')}
                    type="number"
                    step="0.01"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    required
                />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                </div>
            </form>
        </Modal>
    );
};


export default AssetDetailPage;