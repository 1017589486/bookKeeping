
import { Transaction } from '../types';

export const formatDate = (dateString: string, locale: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale, options);
};

export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const exportToCsv = (transactions: Transaction[], billName: string) => {
    if (transactions.length === 0) {
        alert("No transactions to export.");
        return;
    }
    const headers = ['ID', 'Date', 'Type', 'Category ID', 'Amount', 'Notes'];
    const rows = transactions.map(t => [
        t.id,
        t.date,
        t.type,
        t.categoryId,
        t.amount.toString(),
        `"${t.notes.replace(/"/g, '""')}"`
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${billName}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
