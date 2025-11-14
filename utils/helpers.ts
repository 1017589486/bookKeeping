
import { Transaction, Category } from '../types';

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
    // Note: This simple CSV export doesn't handle category names.
    // The import expects category names, so a more advanced export might map categoryId to name.
    const headers = ['date', 'type', 'categoryId', 'amount', 'notes', 'assetId'];
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(fieldName => {
                const value = row[fieldName as keyof Transaction];
                // Handle notes with commas by wrapping in quotes
                if (fieldName === 'notes' && typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const getDateRangeForPeriod = (date: Date, period: 'monthly' | 'quarterly' | 'yearly'): { start: Date, end: Date } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    let start, end;

    switch (period) {
        case 'monthly':
            start = new Date(year, month, 1);
            end = new Date(year, month + 1, 0, 23, 59, 59, 999);
            break;
        case 'quarterly':
            const quarter = Math.floor(month / 3);
            start = new Date(year, quarter * 3, 1);
            end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999);
            break;
        case 'yearly':
            start = new Date(year, 0, 1);
            end = new Date(year, 11, 31, 23, 59, 59, 999);
            break;
    }
    start.setHours(0,0,0,0);
    return { start, end };
};