import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { BillShare, Bill } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';

const FamilySharingPage: React.FC = () => {
  const { user, bills, billShares, addBillShare, updateBillShare, deleteBillShare } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShare, setCurrentShare] = useState<BillShare | null>(null);
  const { t } = useTranslation();

  const openModal = (share: BillShare | null = null) => {
    setCurrentShare(share);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentShare(null);
  };

  const handleSave = (shareData: Omit<BillShare, 'id' | 'ownerUserId' | 'sharedWithUserId' | 'sharedWithUserEmail'> & { email: string }) => {
    if (currentShare) {
      updateBillShare({ ...currentShare, permission: shareData.permission });
    } else {
      addBillShare(shareData);
    }
    closeModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm(t('sharing.delete_confirm'))) {
        deleteBillShare(id);
    }
  }

  const ownedBills = bills.filter(b => b.userId === user?.id);
  const getBillName = (billId: string) => bills.find(b => b.id === billId)?.name || 'Unknown Bill';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('sharing.title')}</h2>
        <Button onClick={() => openModal()} disabled={ownedBills.length === 0}>{t('sharing.invite_member')}</Button>
      </div>
      
      <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900">
                  <tr>
                      <th scope="col" className="px-6 py-3 font-medium">{t('sharing.email')}</th>
                      <th scope="col" className="px-6 py-3 font-medium">{t('sharing.bill_shared')}</th>
                      <th scope="col" className="px-6 py-3 font-medium">{t('sharing.permission')}</th>
                      <th scope="col" className="px-6 py-3 font-medium text-center">{t('sharing.actions')}</th>
                  </tr>
              </thead>
              <tbody>
                  {billShares.map(share => (
                      <tr key={share.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{share.sharedWithUserEmail}</td>
                          <td className="px-6 py-4">{getBillName(share.billId)}</td>
                          <td className="px-6 py-4 capitalize">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${share.permission === 'edit' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}>
                              {share.permission === 'view' ? t('sharing.view_only') : t('sharing.view_edit')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            <button onClick={() => openModal(share)} className="font-medium text-primary hover:text-indigo-500">{t('common.edit')}</button>
                            <button onClick={() => handleDelete(share.id)} className="font-medium text-danger hover:text-red-500">{t('common.remove')}</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {billShares.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('sharing.no_members')}</p>}
           {ownedBills.length === 0 && billShares.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('sharing.no_bills_to_share')}</p>}
      </div>

      <ShareFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} share={currentShare} ownedBills={ownedBills} />
    </div>
  );
};

interface ShareFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (shareData: Omit<BillShare, 'id' | 'ownerUserId' | 'sharedWithUserId' | 'sharedWithUserEmail'> & { email: string }) => void;
    share: BillShare | null;
    ownedBills: Bill[];
}
const ShareFormModal: React.FC<ShareFormModalProps> = ({ isOpen, onClose, onSave, share, ownedBills }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [billId, setBillId] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit'>('view');

    React.useEffect(() => {
        if (share) {
            setEmail(share.sharedWithUserEmail);
            setBillId(share.billId);
            setPermission(share.permission);
        } else {
            setEmail('');
            setBillId(ownedBills.length > 0 ? ownedBills[0].id : '');
            setPermission('view');
        }
    }, [share, isOpen, ownedBills]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ email, billId, permission });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={share ? t('sharing.edit_member') : t('sharing.invite_member')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={t('sharing.email_address')}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={!!share}
                />
                <Select label={t('sharing.bill_to_share')} value={billId} onChange={e => setBillId(e.target.value)} disabled={!!share}>
                    {ownedBills.map(bill => (
                      <option key={bill.id} value={bill.id}>{bill.name}</option>
                    ))}
                </Select>
                <Select label={t('sharing.permission')} value={permission} onChange={e => setPermission(e.target.value as 'view'|'edit')}>
                    <option value="view">{t('sharing.view_only')}</option>
                    <option value="edit">{t('sharing.view_edit')}</option>
                </Select>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default FamilySharingPage;