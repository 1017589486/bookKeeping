import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmVariant = 'danger' }) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={handleConfirm}>
            {confirmText || t('common.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
