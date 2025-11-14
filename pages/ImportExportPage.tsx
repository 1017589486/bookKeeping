

// Fix: Imported `useEffect` from React to resolve 'Cannot find name' error.
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, Category } from '../types';
import { exportToCsv } from '../utils/helpers';
import Button from '../components/Button';
import CalendarInput from '../components/CalendarInput';
import Select from '../components/Select';
import { getCurrentDateString } from '../utils/helpers';

const exportToJson = (data: any[], filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none w-full ${
            isActive
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border-b-2 border-transparent'
        }`}
    >
        {title}
    </button>
);


const ImportExportPage: React.FC = () => {
    const { transactions, categories, addTransaction, activeBillId, bills } = useAppContext();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

    const activeBillName = bills.find(b => b.id === activeBillId)?.name || "data";

    if (!activeBillId) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                 <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{t('import_export.noActiveBillTitle')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('import_export.noActiveBill')}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <TabButton title={t('import_export.exportTab')} isActive={activeTab === 'export'} onClick={() => setActiveTab('export')} />
                <TabButton title={t('import_export.importTab')} isActive={activeTab === 'import'} onClick={() => setActiveTab('import')} />
            </div>

            <div className="p-6">
                {activeTab === 'export' ? 
                    <ExportSection transactions={transactions} activeBillId={activeBillId} activeBillName={activeBillName} /> : 
                    <ImportSection addTransaction={addTransaction} categories={categories} activeBillId={activeBillId} />
                }
            </div>
        </div>
    );
};


// --- EXPORT COMPONENT ---
interface ExportSectionProps {
    transactions: Transaction[];
    activeBillId: string;
    activeBillName: string;
}
const ExportSection: React.FC<ExportSectionProps> = ({ transactions, activeBillId, activeBillName }) => {
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [format, setFormat] = useState<'csv' | 'json'>('csv');

    const handleExport = () => {
        let dataToExport = transactions.filter(t => t.billId === activeBillId);
        if (startDate && endDate) {
            dataToExport = dataToExport.filter(t => t.date >= startDate && t.date <= endDate);
        }
        
        const filename = `${activeBillName}_${getCurrentDateString()}`;

        if (format === 'csv') {
            exportToCsv(dataToExport, filename);
        } else {
            exportToJson(dataToExport, filename);
        }
    };
    
    return (
        <div className="space-y-6">
             <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('import_export.export_data')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('import_export.export_description', { billName: activeBillName })}</p>
            </div>
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('import_export.exportSettings')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CalendarInput label={t('import_export.from')} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <CalendarInput label={t('import_export.to')} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <Select label={t('import_export.fileFormat')} value={format} onChange={e => setFormat(e.target.value as 'csv' | 'json')}>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                </Select>
            </div>
            <Button onClick={handleExport}>{t('import_export.export_button')}</Button>
        </div>
    );
};

// --- IMPORT COMPONENT ---
interface ImportSectionProps {
    addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
    categories: Category[];
    activeBillId: string;
}
type ParsedRow = { data: Partial<Transaction>, errors: string[] };
const ImportSection: React.FC<ImportSectionProps> = ({ addTransaction, categories, activeBillId }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [importing, setImporting] = useState(false);
    const [importSuccessMessage, setImportSuccessMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeBillCategories = useMemo(() => categories.filter(c => c.billId === activeBillId), [categories, activeBillId]);

    const handleFileParse = useCallback((fileToParse: File) => {
        setImportSuccessMessage('');
        setParsedData([]);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1); // Skip header
            const data: ParsedRow[] = [];
            rows.forEach(rowStr => {
                if (!rowStr.trim()) return;
                const columns = rowStr.split(',');
                const [date, type, categoryName, amountStr, notes] = columns;
                
                const errors: string[] = [];
                if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(t('import_export.errors.invalidDate'));
                if (!type || !['income', 'expense'].includes(type)) errors.push(t('import_export.errors.invalidType'));
                const amount = parseFloat(amountStr);
                if (isNaN(amount)) errors.push(t('import_export.errors.invalidAmount'));

                const category = activeBillCategories.find(c => c.name.toLowerCase() === categoryName?.trim().toLowerCase() && c.type === type);
                if (!categoryName || !category) errors.push(t('import_export.errors.invalidCategory'));

                data.push({
                    data: {
                        date,
                        type: type as TransactionType,
                        categoryId: category?.id,
                        amount,
                        notes: notes?.replace(/"/g, '') || '',
                        billId: activeBillId,
                    },
                    errors
                });
            });
            setParsedData(data);
        };
        reader.readAsText(fileToParse);
    }, [activeBillId, activeBillCategories, t]);

    useEffect(() => {
        if(file) {
            handleFileParse(file);
        }
    }, [file, handleFileParse]);

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type === "text/csv") {
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };
    
    const handleDownloadTemplate = () => {
        const headers = ['date', 'type', 'categoryName', 'amount', 'notes'];
        const exampleRow = ['2024-01-01', 'expense', 'Groceries', '55.43', 'Weekly shopping'];
        const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'import_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImport = async () => {
        const validRows = parsedData.filter(row => row.errors.length === 0);
        if(validRows.length === 0) return;

        setImporting(true);
        setImportSuccessMessage('');
        let importedCount = 0;
        for (const row of validRows) {
            await addTransaction(row.data as Omit<Transaction, 'id' | 'userId'>);
            importedCount++;
        }
        setImporting(false);
        setImportSuccessMessage(t('import_export.importSuccess', { count: importedCount }));
        setFile(null);
        setParsedData([]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('import_export.import_data')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('import_export.import_description')}</p>
            </div>

            {!file && (
                <div
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${isDragging ? 'border-primary bg-indigo-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}`}
                >
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                        {t('import_export.dragAndDrop')}{' '}
                        <button onClick={() => fileInputRef.current?.click()} className="font-semibold text-primary hover:text-indigo-500">{t('import_export.browseFile')}</button>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('import_export.supportedFormats')}</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                </div>
            )}
            
            <Button variant="ghost" onClick={handleDownloadTemplate} className="text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {t('import_export.downloadTemplate')}
            </Button>
            
            {importSuccessMessage && <p className="text-green-600 dark:text-green-400 font-semibold">{importSuccessMessage}</p>}

            {parsedData.length > 0 && (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('import_export.importPreview')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('import_export.previewDescription')}</p>
                    </div>
                    <div className="overflow-x-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded-md">
                        <table className="w-full text-sm">
                             <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                <tr>
                                    {['date', 'type', 'categoryId', 'amount', 'notes'].map(h => 
                                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(`transactions.${h}` as any, h)}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {parsedData.map((row, index) => (
                                    <tr key={index} className={row.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                        <td className="px-4 py-2 whitespace-nowrap">{row.data.date}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{row.data.type}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{activeBillCategories.find(c=>c.id === row.data.categoryId)?.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{row.data.amount}</td>
                                        <td className="px-4 py-2">{row.data.notes}
                                            {row.errors.length > 0 && <span className="block text-xs text-red-500 mt-1">{row.errors.join(', ')}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => { setFile(null); setParsedData([]); }}>{t('common.cancel')}</Button>
                        <Button onClick={handleImport} disabled={importing || parsedData.every(r => r.errors.length > 0)}>
                            {importing ? t('import_export.importingStatus') : t('import_export.import_button')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportExportPage;