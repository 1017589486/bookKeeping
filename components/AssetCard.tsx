
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
  formatCurrency: (value: number) => string;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit, onDelete, formatCurrency }) => {
    const { t } = useTranslation();
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase tracking-wide">{asset.type}</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{asset.name}</h3>
                    </div>
                    {/* Placeholder for an icon, maybe based on type */}
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(asset.balance)}</p>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 flex justify-end space-x-2 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
                <button onClick={onEdit} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{t('common.edit')}</button>
                <button onClick={onDelete} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-danger dark:hover:text-danger transition-colors px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{t('common.delete')}</button>
            </div>
        </div>
    );
};

export default AssetCard;
