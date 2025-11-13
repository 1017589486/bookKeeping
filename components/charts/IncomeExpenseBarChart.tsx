import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { Transaction, TransactionType } from '../../types';

interface IncomeExpenseBarChartProps {
  transactions: Transaction[];
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ transactions }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const monthlyData: { [key: string]: { month: string; income: number; expense: number } } = {};

  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expense: 0 };
    }
    if (t.type === TransactionType.INCOME) {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += t.amount;
    }
  });

  const data = Object.values(monthlyData).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">{t('dashboard.no_chart_data')}</div>;
  }

  const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
        <XAxis dataKey="month" tick={{ fill: tickColor }} />
        <YAxis tick={{ fill: tickColor }} />
        <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`} 
            contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
            }}
        />
        <Legend wrapperStyle={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
        <Bar dataKey="income" fill="#10B981" name={t('transactionTypes.income')} />
        <Bar dataKey="expense" fill="#EF4444" name={t('transactionTypes.expense')} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBarChart;