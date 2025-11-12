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

const CategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, activeBillId, bills } = useAppContext();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

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

    const incomeCategories = activeBillCategories.filter(c => c.type === TransactionType.INCOME);
    const expenseCategories = activeBillCategories.filter(c => c.type === TransactionType.EXPENSE);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-card p-6 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-text-primary">{t('categories.manage_categories')}</h2>
                <Button onClick={() => openModal()} disabled={!activeBillId || !canEdit}>{t('categories.add_category')}</Button>
            </div>
            
            <CategoryList title={t('categories.income_categories')} categories={incomeCategories} onEdit={openModal} onDelete={handleDelete} canEdit={canEdit} />
            <CategoryList title={t('categories.expense_categories')} categories={expenseCategories} onEdit={openModal} onDelete={handleDelete} canEdit={canEdit} />

            <CategoryFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} category={currentCategory} />
        </div>
    );
};

interface CategoryListProps {
    title: string;
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({ title, categories, onEdit, onDelete, canEdit }) => {
    const { t } = useTranslation();
    const getCategoryName = (category: Category) => {
        return category.isSeed ? t(category.name as any) : category.name;
    };
    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-slate-200">
            <div className="flex items-center mb-4 pb-4 border-b border-slate-200">
                <div className="w-1 h-5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            </div>
            <div className="space-y-3">
                {categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center">
                            <CategoryIcon icon={cat.icon} color={cat.color} />
                            <span className="ml-4 font-medium text-text-primary">{getCategoryName(cat)}</span>
                        </div>
                        {canEdit && <div className="space-x-2">
                            <button onClick={() => onEdit(cat)} className="font-medium text-primary hover:text-indigo-500">{t('common.edit')}</button>
                            <button onClick={() => onDelete(cat.id)} className="font-medium text-danger hover:text-red-500">{t('common.delete')}</button>
                        </div>}
                    </div>
                ))}
                {categories.length === 0 && <p className="text-center text-text-secondary py-4">{t('categories.no_categories')}</p>}
            </div>
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
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('categories.icon')}</label>
                    <div className="grid grid-cols-8 gap-2 p-2 border rounded-md">
                        {ICONS.map(i => (
                            <button type="button" key={i} onClick={() => setIcon(i)} className={`p-2 rounded-md transition-colors ${icon === i ? 'bg-primary bg-opacity-10' : 'hover:bg-gray-100'}`}>
                                <CategoryIcon icon={i} color="#6B7280" size="h-6 w-6"/>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('categories.color')}</label>
                    <div className="grid grid-cols-8 gap-2 p-2 border rounded-md">
                        {COLORS.map(c => (
                            <button type="button" key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: c }} />
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