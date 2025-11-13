
import { Transaction } from '../types';

export const formatDate = (dateString: string, locale: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale, options);
};

export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatCurrency = (value: number, locale: string): string => {
    const currency = locale.toLowerCase().startsWith('zh') ? 'CNY' : 'USD';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(value);
};

export const exportToCsv = (data: Transaction[], filename: string) => {
    const headers = ['id', 'date', 'type', 'categoryId', 'amount', 'notes', 'assetId'];
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName as keyof Transaction] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
