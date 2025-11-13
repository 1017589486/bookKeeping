import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType } from '../types';
import { exportToCsv } from '../utils/helpers';
import Button from '../components/Button';

const ImportExportPage: React.FC = () => {
    const { transactions, addTransaction, activeBillId, bills } = useAppContext();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeBillTransactions = transactions.filter(t => t.billId === activeBillId);
    const activeBillName = bills.find(b => b.id === activeBillId)?.name || "export";
    
    const handleExport = () => {
        exportToCsv(activeBillTransactions, activeBillName);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeBillId) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1); // Skip header
            rows.forEach(row => {
                const [id, date, type, categoryId, amount, notes] = row.split(',');
                if (date && type && categoryId && amount) {
                    const newTransaction: Omit<Transaction, 'id'| 'billId' | 'userId'> = {
                        date,
                        type: type as TransactionType,
                        categoryId,
                        amount: parseFloat(amount),
                        notes: notes?.replace(/"/g, '') || '',
                    };
                    addTransaction({...newTransaction, billId: activeBillId});
                }
            });
            alert(t('import_export.import_success'));
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('import_export.export_data')}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('import_export.export_description', { billName: activeBillName })}</p>
                <Button onClick={handleExport} disabled={!activeBillId}>{t('import_export.export_button')}</Button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('import_export.import_data')}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('import_export.import_description', { billName: activeBillName })}</p>
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="hidden"
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={!activeBillId}>
                    {t('import_export.import_button')}
                </Button>
            </div>
        </div>
    );
};

export default ImportExportPage;