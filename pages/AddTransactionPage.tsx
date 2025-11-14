
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { TransactionType, Category } from '../types';
import AccountSelectModal from '../components/modals/AccountSelectModal';
import BillSelectModal from '../components/modals/BillSelectModal';
import DateSelectModal from '../components/modals/DateSelectModal';
import { useTheme } from '../hooks/useTheme';

const AddTransactionPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { categories, assets, bills, activeBillId, setActiveBillId, addTransaction } = useAppContext();

    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [amountStr, setAmountStr] = useState('0.00');
    
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(assets[0]?.id);

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    const billCategories = useMemo(() => categories.filter(c => c.billId === activeBillId), [categories, activeBillId]);
    const mainCategories = useMemo(() => billCategories.filter(c => c.type === type && !c.parentId).sort((a,b) => a.name.localeCompare(b.name)), [billCategories, type]);

    useEffect(() => {
        const defaultCategoryName = type === TransactionType.EXPENSE ? t('seedCategories.shopping') : t('seedCategories.salary');
        const initialCategory = mainCategories.find(c => getCategoryName(c) === defaultCategoryName) || mainCategories[0];
        setSelectedCategory(initialCategory || null);
    }, [type, mainCategories, t]);

    const handleKeyPress = (key: string) => {
        setAmountStr(currentAmount => {
            if (currentAmount.includes('.') && currentAmount.split('.')[1].length >= 2) return currentAmount;

            if (key === '.') {
                return currentAmount.includes('.') ? currentAmount : `${currentAmount}.`;
            }

            if (currentAmount === '0.00' || currentAmount === '0') {
                 return key;
            }

            return currentAmount + key;
        });
    };

    const handleBackspace = () => {
        setAmountStr(prev => {
            if (prev.length === 1) return '0.00';
            const newStr = prev.slice(0, -1);
            return newStr === '' ? '0.00' : newStr;
        });
    };

    const handleClear = () => {
        setAmountStr('0.00');
    }
    
    const handleSave = async (addAnother = false) => {
        const amount = parseFloat(amountStr);

        if (!activeBillId || !selectedCategory?.id || isNaN(amount) || amount === 0) {
            alert("Please ensure a bill, category, and valid amount are selected.");
            return;
        }

        try {
            await addTransaction({
                billId: activeBillId,
                categoryId: selectedCategory.id,
                type,
                amount,
                date: date.toISOString().split('T')[0],
                notes,
                assetId: selectedAssetId,
            });

            if (addAnother) {
                setAmountStr('0.00');
                setNotes('');
            } else {
                navigate(-1);
            }
        } catch (error) {
            console.error("Failed to save transaction:", error);
            alert("Failed to save transaction.");
        }
    };
    
    const getCategoryName = (category: Category) => category.isSeed ? t(category.name as any) : category.name;
    const selectedAsset = assets.find(a => a.id === selectedAssetId);
    const selectedBill = bills.find(b => b.id === activeBillId);

    const typeColor = type === TransactionType.EXPENSE ? 'danger' : 'secondary';
    const typeColorHex = theme === 'dark' ? (type === TransactionType.EXPENSE ? '#ef4444' : '#10b981') : (type === TransactionType.EXPENSE ? '#ef4444' : '#10b981');


    return (
        <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between p-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center space-x-4 text-lg bg-gray-200 dark:bg-gray-800 p-1 rounded-full">
                    <button onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-1 rounded-full font-semibold ${type === TransactionType.EXPENSE ? 'bg-danger text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t('transactionTypes.expense')}</button>
                    <button onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-1 rounded-full font-semibold ${type === TransactionType.INCOME ? 'bg-secondary text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t('transactionTypes.income')}</button>
                </div>
                 <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                </button>
            </header>

            {/* Category Grid */}
            <main className="flex-grow p-4 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-5 gap-y-6">
                    {mainCategories.map(cat => {
                        const isSelected = selectedCategory?.id === cat.id;
                        return (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat)} className="flex flex-col items-center space-y-2 text-center focus:outline-none">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: isSelected ? typeColorHex : (theme === 'dark' ? '#1C1C1E' : '#f3f4f6') }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke={isSelected ? '#FFFFFF' : cat.color} strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS_SVG_PATHS[cat.icon] || ''} />
                                    </svg>
                                </div>
                                <span className={`text-xs ${isSelected ? 'font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{getCategoryName(cat)}</span>
                            </button>
                        )
                    })}
                </div>
            </main>
            
            {/* Input & Keypad Footer */}
            <footer className="flex-shrink-0 bg-gray-100 dark:bg-gray-900/50 backdrop-blur-sm">
                 <div className="p-4">
                    <div className="flex items-center">
                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('add_transaction.notes_placeholder')} className="bg-transparent w-full focus:outline-none placeholder-gray-500 text-lg" />
                        <span className={`text-4xl font-mono ml-4 text-${typeColor}`}>{amountStr}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-3 text-sm overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => setIsAccountModalOpen(true)} className="bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-1.5 flex-shrink-0">{selectedAsset?.name || t('add_transaction.select_account')}</button>
                        <button onClick={() => setIsBillModalOpen(true)} className="bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-1.5 flex-shrink-0">{selectedBill?.name || t('add_transaction.select_bill')}</button>
                        <button onClick={() => setIsDateModalOpen(true)} className="bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-1.5 flex-shrink-0">{date.toLocaleDateString(i18n.language, { month: '2-digit', day: '2-digit' })}</button>
                    </div>
                </div>

                <div className="grid grid-cols-4 grid-rows-4 gap-px bg-gray-300 dark:bg-gray-700">
                    {['1', '2', '3'].map(k => <KeypadButton key={k} onClick={() => handleKeyPress(k)}>{k}</KeypadButton>)}
                    <KeypadButton secondary onClick={() => handleSave(true)}>{t('add_transaction.add_another')}</KeypadButton>

                    {['4', '5', '6'].map(k => <KeypadButton key={k} onClick={() => handleKeyPress(k)}>{k}</KeypadButton>)}
                    <KeypadButton secondary onClick={handleBackspace}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 12M3 12l6.414-6.414a2 2 0 012.828 0L21 12" /></svg>
                    </KeypadButton>
                    
                    {['7', '8', '9'].map(k => <KeypadButton key={k} onClick={() => handleKeyPress(k)}>{k}</KeypadButton>)}
                    <button onClick={() => handleSave(false)} className={`row-span-2 flex items-center justify-center text-white text-lg font-semibold bg-${typeColor}`}>
                        {t('common.save')}
                    </button>

                    <KeypadButton onClick={() => handleKeyPress('.')}>.</KeypadButton>
                    <KeypadButton onClick={() => handleKeyPress('0')}>0</KeypadButton>
                    <KeypadButton onClick={handleClear}>✓</KeypadButton>
                </div>
            </footer>
            
            <AccountSelectModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSelect={(id) => { setSelectedAssetId(id); setIsAccountModalOpen(false); }} />
            <BillSelectModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} onSelect={(id) => { setActiveBillId(id); setIsBillModalOpen(false); }} />
            <DateSelectModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onSelect={(d) => { setDate(d); setIsDateModalOpen(false); }} currentDate={date} />

        </div>
    );
};

const KeypadButton: React.FC<{onClick: () => void, children: React.ReactNode, secondary?: boolean}> = ({onClick, children, secondary = false}) => {
    const baseClass = "py-4 flex items-center justify-center text-2xl focus:outline-none transition-colors";
    const primaryClass = "bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700";
    const secondaryClass = "bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 text-lg";

    return (
        <button onClick={onClick} className={`${baseClass} ${secondary ? secondaryClass : primaryClass}`}>
            {children}
        </button>
    )
}

const ICONS_SVG_PATHS: Record<string, string> = {
    'briefcase': "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4",
    'shopping-cart': "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    'home': "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    'truck': "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M21 11V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10h16v-4a2 2 0 00-2-2h-3zM3 11V5a2 2 0 012-2h3v10H5a2 2 0 01-2-2z",
    'utensils': "M17.657 18.657l-4.243-4.243m0 0l-4.243 4.243M12.707 15H17V5H7v10h4.293l1.414 1.414zM7 5l1.55-1.55a1 1 0 011.414 0L12 5.01V5m2.05-1.55a1 1 0 011.414 0L17 5",
    'film': "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
    'plane': "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    'gift': "M20 12v10H4V12 M20 12L12 4 4 12 M20 12H4 M12 4v16",
    'heart': "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    'medkit': "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
    'book': "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
    'graduation-cap': "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    'dollar-sign': "M12 6v12m-3-6h6",
    'piggy-bank': "M11 5H6a2 2 0 00-2 2v3a2 2 0 002 2h1v1a3 3 0 003 3h2a3 3 0 003-3v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-5z M11 5a2 2 0 00-2 2v1h4V7a2 2 0 00-2-2z M10 12H4v-1a1 1 0 011-1h5v2zm4-2h-2v-1a1 1 0 011-1h1v2z",
    'scale': "M3.055 11H5a2 2 0 012 2v1a2 2 0 01-2 2H3a2 2 0 01-2-2v-1a2 2 0 012-2m13 0h1.945a2 2 0 012 2v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1a2 2 0 012-2M12 3v18m-5-18l-2 4h4l-2-4zm10 0l-2 4h4l-2-4z",
};


export default AddTransactionPage;