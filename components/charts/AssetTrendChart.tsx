
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/helpers';

interface AssetTrendChartProps {
  data: { name: string; balance: number }[];
}

const AssetTrendChart: React.FC<AssetTrendChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">{t('dashboard.no_chart_data')}</div>;
  }

  const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
        <YAxis 
            tick={{ fill: tickColor, fontSize: 12 }} 
            tickFormatter={(value: number) => {
                if (Math.abs(value) >= 1000000) return `${(value / 1000000).toPrecision(3)}M`;
                if (Math.abs(value) >= 1000) return `${(value / 1000).toPrecision(3)}K`;
                return String(value);
            }}
            axisLine={false}
            tickLine={false}
        />
        <Tooltip 
            formatter={(value: number) => [formatCurrency(value, i18n.language), t('dashboard.balance')]} 
            contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderRadius: '0.5rem',
            }}
            labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
        <Line type="monotone" dataKey="balance" stroke="#4f46e5" name={t('assets.total_assets')} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AssetTrendChart;
