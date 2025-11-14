
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../hooks/useAppContext';
import CategoryIcon from '../CategoryIcon';

const BillSelectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (billId: string) => void; }> = ({ isOpen, onClose, onSelect }) => {
    const { t } = useTranslation();
    const { bills, activeBillId } = useAppContext();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full rounded-t-2xl p-4 max-h-[50vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('add_transaction.select_bill')}</h3>
                    <button className="text-primary font-semibold">{t('common.manage')}</button>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-3">
                    {bills.map(bill => (
                        <div key={bill.id} onClick={() => onSelect(bill.id)} className={`flex items-center p-3 rounded-lg cursor-pointer ${activeBillId === bill.id ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            <CategoryIcon icon="book" color="#5AC8FA" size="h-10 w-10"/>
                            <span className="ml-4">{bill.name}</span>
                            {activeBillId === bill.id && <span className="ml-auto text-primary text-xl">✓</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BillSelectModal;