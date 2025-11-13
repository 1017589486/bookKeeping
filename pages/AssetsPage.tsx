

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Asset, TransactionType } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import AssetCard from '../components/AssetCard';
import { formatCurrency } from '../utils/helpers';
import AssetTrendChart from '../components/charts/AssetTrendChart';

const AssetsPage: React.FC = () => {
    const { assets, addAsset, updateAsset, deleteAsset, transactions } = useAppContext();
    const { t, i18n } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
    const [trendView, setTrendView] = useState<'monthly' | 'daily'>('monthly');

    const openModal = (asset: Asset | null = null) => {
        setCurrentAsset(asset);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAsset(null);
    };

    const handleSave = (assetData: Omit<Asset, 'id' | 'userId'>) => {
        if (currentAsset) {
            updateAsset({ ...currentAsset, ...assetData });
        } else {
            addAsset(assetData);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('assets.delete_confirm'))) {
            deleteAsset(id);
        }
    };

    const totalAssetsValue = useMemo(() => {
        return assets.reduce((total, asset) => total + asset.balance, 0);
    }, [assets]);

    const trendData = useMemo(() => {
        const totalCurrentBalance = assets.reduce((sum, asset) => sum + asset.balance, 0);
        const assetTransactions = transactions
            .filter(t => t.assetId && assets.some(a => a.id === t.assetId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (trendView === 'daily') {
            const data: { name: string; balance: number }[] = [];
            const today = new Date();
            
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setHours(23, 59, 59, 999); // End of day
                date.setDate(today.getDate() - i);
                
                const transactionsAfter = assetTransactions.filter(t => new Date(t.date) > date);
                const netChangeAfter = transactionsAfter.reduce((sum, tx) => {
                    return sum + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount);
                }, 0);
                
                const balanceOnDate = totalCurrentBalance - netChangeAfter;
                
                data.push({
                    name: date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
                    balance: balanceOnDate,
                });
            }
            return data.reverse();
        }

        if (trendView === 'monthly') {
            const data: { name: string; balance: number }[] = [];
            const today = new Date();
            
            for (let i = 0; i < 12; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() - i + 1, 0); // Last day of month
                date.setHours(23, 59, 59, 999); // End of day
                
                const transactionsAfter = assetTransactions.filter(t => new Date(t.date) > date);
                const netChangeAfter = transactionsAfter.reduce((sum, tx) => {
                    return sum + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount);
                }, 0);

                const balanceOnDate = totalCurrentBalance - netChangeAfter;

                data.push({
                    name: date.toLocaleDateString(i18n.language, { month: 'short', year: '2-digit' }),
                    balance: balanceOnDate,
                });
            }
            return data.reverse();
        }

        return [];
    }, [assets, transactions, trendView, i18n.language]);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('assets.title')}</h2>
                <Button onClick={() => openModal()}>
                    {t('assets.add_asset')}
                </Button>
            </div>

            {/* Total Assets Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('assets.total_assets')}</h4>
                <p className="text-3xl font-bold mt-2 text-primary">{formatCurrency(totalAssetsValue, i18n.language)}</p>
            </div>

            {/* Asset Trend Analysis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('assets.asset_trend_analysis')}</h3>
                    </div>
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
                        <ToggleButton active={trendView === 'monthly'} onClick={() => setTrendView('monthly')}>{t('assets.monthly')}</ToggleButton>
                        <ToggleButton active={trendView === 'daily'} onClick={() => setTrendView('daily')}>{t('assets.daily')}</ToggleButton>
                    </div>
                </div>
                <AssetTrendChart data={trendData} />
            </div>


            {assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(asset => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            onEdit={() => openModal(asset)}
                            onDelete={() => handleDelete(asset.id)}
                            formatCurrency={(value) => formatCurrency(value, i18n.language)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('assets.no_assets')}</h3>
                    <div className="mt-6">
                        <Button onClick={() => openModal()}>{t('assets.add_asset')}</Button>
                    </div>
                </div>
            )}
            
            <AssetFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} asset={currentAsset} />
        </div>
    );
};

interface ToggleButtonProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}
const ToggleButton: React.FC<ToggleButtonProps> = ({ children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
            active ? 'bg-white dark:bg-gray-800 text-primary shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);


interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assetData: Omit<Asset, 'id' | 'userId'>) => void;
    asset: Asset | null;
}
const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, onSave, asset }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [balance, setBalance] = useState('');

    React.useEffect(() => {
        if (asset) {
            setName(asset.name);
            setType(asset.type);
            setBalance(String(asset.balance));
        } else {
            setName('');
            setType('');
            setBalance('');
        }
    }, [asset, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, type, balance: parseFloat(balance) });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={asset ? t('assets.edit_asset') : t('assets.add_asset')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={t('assets.asset_name')} value={name} onChange={e => setName(e.target.value)} required />
                <Input label={t('assets.asset_type')} value={type} onChange={e => setType(e.target.value)} required placeholder="e.g., Bank Account, Cash, Investment" />
                <Input label={t('assets.balance')} type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} required />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('assets.save_asset')}</Button>
                </div>
            </form>
        </Modal>
    );
};


export default AssetsPage;