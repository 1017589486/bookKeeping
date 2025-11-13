import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Category, TransactionType } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { ICONS, COLORS } from '../constants';
import CategoryIcon from '../components/CategoryIcon';
import Select from '../components/Select';
import { useTheme } from '../hooks/useTheme';

const CategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, activeBillId, bills } = useAppContext();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);

    const activeBill = React.useMemo(() => bills.find(b => b.id === activeBillId), [bills, activeBillId]);
    const canEdit = activeBill?.permission !== 'view';

    const openModal = (category: Category | null = null) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCategory(null);
    };
    
    const handleSave = (catData: Omit<Category, 'id' | 'userId' | 'billId'>) => {
        if (!activeBillId) {
            alert(t('transactions.select_bill_first'));
            return;
        }
        if (currentCategory) {
            const updatedCat = { ...currentCategory, ...catData };
            if (updatedCat.isSeed) {
                delete updatedCat.isSeed;
            }
            updateCategory(updatedCat);
        } else {
            addCategory({ ...catData, billId: activeBillId });
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('categories.delete_confirm'))) {
            deleteCategory(id);
        }
    };

    const activeBillCategories = React.useMemo(() => 
        categories.filter(c => c.billId === activeBillId), 
        [categories, activeBillId]
    );

    const visibleCategories = React.useMemo(() => 
        activeBillCategories.filter(c => c.type === activeTab),
        [activeBillCategories, activeTab]
    );
    
    const getCategoryName = (category: Category) => {
        return category.isSeed ? t(category.name as any) : category.name;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('categories.manage_categories')}</h2>
                <Button onClick={() => openModal()} disabled={!activeBillId || !canEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {t('categories.add_category')}
                </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <TabButton
                        title={t('categories.expense_categories')}
                        isActive={activeTab === TransactionType.EXPENSE}
                        onClick={() => setActiveTab(TransactionType.EXPENSE)}
                    />
                    <TabButton
                        title={t('categories.income_categories')}
                        isActive={activeTab === TransactionType.INCOME}
                        onClick={() => setActiveTab(TransactionType.INCOME)}
                    />
                </div>
                <div className="p-6">
                    {visibleCategories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {visibleCategories.map(cat => (
                                <CategoryItem 
                                    key={cat.id} 
                                    category={cat} 
                                    onEdit={openModal} 
                                    onDelete={handleDelete} 
                                    canEdit={canEdit}
                                    getCategoryName={getCategoryName}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                             <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 mt-4">{t('categories.no_categories')}</p>
                        </div>
                    )}
                </div>
            </div>

            <CategoryFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} category={currentCategory} />
        </div>
    );
};

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${
            isActive 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border-b-2 border-transparent'
        }`}
    >
        {title}
    </button>
);

const CategoryItem: React.FC<{
    category: Category;
    onEdit: (c: Category) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
    getCategoryName: (c: Category) => string;
}> = ({ category, onEdit, onDelete, canEdit, getCategoryName }) => {
    return (
        <div className="group relative bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col items-center justify-center space-y-3 aspect-square transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
            <CategoryIcon icon={category.icon} color={category.color} size="h-10 w-10" />
            <span className="text-gray-900 dark:text-gray-100 text-sm font-medium text-center truncate w-full">{getCategoryName(category)}</span>
            
            {canEdit && (
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => onEdit(category)} className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-primary text-gray-700 dark:text-gray-200 hover:text-white transition-colors" aria-label="Edit">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(category.id)} className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-danger text-gray-700 dark:text-gray-200 hover:text-white transition-colors" aria-label="Delete">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0015 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};


interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (catData: Omit<Category, 'id' | 'userId' | 'billId'>) => void;
    category: Category | null;
}
const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, category }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [icon, setIcon] = useState(ICONS[0]);
    const [color, setColor] = useState(COLORS[0]);
    
    React.useEffect(() => {
        if(category) {
            const categoryName = category.isSeed ? t(category.name as any) : category.name;
            setName(categoryName);
            setType(category.type);
            setIcon(category.icon);
            setColor(category.color);
        } else {
            setName('');
            setType(TransactionType.EXPENSE);
            setIcon(ICONS[0]);
            setColor(COLORS[0]);
        }
    }, [category, isOpen, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, type, icon, color });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={category ? t('categories.edit_category') : t('categories.add_category')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={t('categories.category_name')} value={name} onChange={e => setName(e.target.value)} required />
                <Select label={t('categories.type')} value={type} onChange={e => setType(e.target.value as TransactionType)}>
                    <option value={TransactionType.EXPENSE}>{t('transactionTypes.expense')}</option>
                    <option value={TransactionType.INCOME}>{t('transactionTypes.income')}</option>
                </Select>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('categories.icon')}</label>
                    <div className="grid grid-cols-6 gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md">
                        {ICONS.map(i => (
                            <button type="button" key={i} onClick={() => setIcon(i)} className={`p-3 rounded-lg flex justify-center items-center transition-colors aspect-square ${icon === i ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <CategoryIcon icon={i} color={theme === 'dark' ? '#9CA3AF' : '#4B5563'} size="h-8 w-8"/>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('categories.color')}</label>
                    <div className="grid grid-cols-9 gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md">
                        {COLORS.map(c => (
                            <button type="button" key={c} onClick={() => setColor(c)} className={`w-full h-0 pb-[100%] rounded-full border-2 transition-all ${color === c ? 'border-primary ring-2 ring-primary/50' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('categories.save_category')}</Button>
                </div>
            </form>
        </Modal>
    )
}

export default CategoriesPage;