import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { Category, Transaction, TransactionType } from '../../types';

interface ExpensePieChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ transactions, categories }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
  
  const data = categories
    .filter(c => c.type === TransactionType.EXPENSE)
    .map(category => {
      const total = expenseTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: category.name,
        value: total,
        color: category.color,
      };
    })
    .filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">{t('dashboard.no_expense_data')}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
          }}
        />
        <Legend wrapperStyle={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensePieChart;