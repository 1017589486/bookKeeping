import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface IncomeExpenseBarChartProps {
  transactions: Transaction[];
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ transactions }) => {
  const { t } = useTranslation();
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
    return <div className="flex items-center justify-center h-full text-text-secondary">{t('dashboard.no_chart_data')}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="income" fill="#10B981" name={t('transactionTypes.income')} />
        <Bar dataKey="expense" fill="#EF4444" name={t('transactionTypes.expense')} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBarChart;