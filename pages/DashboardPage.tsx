
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { TransactionType } from '../types';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import { formatDate, formatCurrency } from '../utils/helpers';
import CategoryIcon from '../components/CategoryIcon';

const DashboardPage: React.FC = () => {
  const { transactions, categories, activeBillId, isLoading } = useAppContext();
  const { t, i18n } = useTranslation();

  const activeBillTransactions = useMemo(
    () => transactions.filter(t => t.billId === activeBillId), 
    [transactions, activeBillId]
  );
  
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    activeBillTransactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [activeBillTransactions]);

  const recentTransactions = [...activeBillTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const activeBillCategories = useMemo(() => {
    return categories.filter(c => c.billId === activeBillId);
  }, [categories, activeBillId]);

  const translatedCategories = useMemo(() => {
    return activeBillCategories.map(c => ({
        ...c,
        name: c.isSeed ? t(c.name as any) : c.name,
    }));
  }, [activeBillCategories, t]);

  if (isLoading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading financial data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('dashboard.total_income')} value={totalIncome} type="income" />
        <StatCard title={t('dashboard.total_expense')} value={totalExpense} type="expense" />
        <StatCard title={t('dashboard.balance')} value={balance} type="balance" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.expense_by_category')}</h3>
          </div>
          <ExpensePieChart transactions={activeBillTransactions} categories={translatedCategories} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.monthly_overview')}</h3>
          </div>
          <IncomeExpenseBarChart transactions={activeBillTransactions} />
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.recent_transactions')}</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900">
                      <tr>
                          <th scope="col" className="px-6 py-3 font-medium">{t('dashboard.category')}</th>
                          <th scope="col" className="px-6 py-3 font-medium">{t('dashboard.date')}</th>
                          <th scope="col" className="px-6 py-3 font-medium">{t('dashboard.notes')}</th>
                          <th scope="col" className="px-6 py-3 font-medium text-right">{t('dashboard.amount')}</th>
                      </tr>
                  </thead>
                  <tbody>
                      {recentTransactions.length > 0 ? recentTransactions.map(transaction => {
                          const category = translatedCategories.find(c => c.id === transaction.categoryId);
                          return (
                              <tr key={transaction.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {category && <CategoryIcon icon={category.icon} color={category.color} />}
                                        <span className="ml-3">{category?.name || t('common.uncategorized')}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">{formatDate(transaction.date, i18n.language)}</td>
                                  <td className="px-6 py-4 truncate max-w-xs">{transaction.notes}</td>
                                  <td className={`px-6 py-4 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-secondary' : 'text-danger'}`}>
                                    {transaction.type === TransactionType.INCOME ? '+' : ''}{formatCurrency(transaction.amount, i18n.language)}
                                  </td>
                              </tr>
                          );
                      }) : (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">{t('dashboard.no_recent_transactions')}</td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: number;
    type: 'income' | 'expense' | 'balance';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, type }) => {
    const { i18n } = useTranslation();
    const colors = {
        income: 'text-secondary',
        expense: 'text-danger',
        balance: 'text-primary'
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
            <p className={`text-3xl font-bold mt-2 ${colors[type]}`}>{formatCurrency(value, i18n.language)}</p>
        </div>
    );
};

export default DashboardPage;
