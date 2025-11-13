import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import Input from '../components/Input';
import Button from '../components/Button';

const SettingsPage: React.FC = () => {
    const { user } = useAppContext();
    const { t } = useTranslation();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would make an API call. Here we just show an alert.
        alert(t('settings.info_updated_mock'));
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert(t('settings.passwords_no_match'));
            return;
        }
        // In a real app, this would make an API call.
        alert(t('settings.password_updated_mock'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="w-1 h-5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.personal_info')}</h3>
                </div>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                    <Input label={t('settings.full_name')} value={name} onChange={e => setName(e.target.value)} required />
                    <Input label={t('settings.email_address')} type="email" value={email} disabled />
                    <div className="pt-2">
                        <Button type="submit">{t('settings.save_changes')}</Button>
                    </div>
                </form>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="w-1 h-5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.change_password')}</h3>
                </div>
                 <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <Input label={t('settings.current_password')} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                    <Input label={t('settings.new_password')} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <Input label={t('settings.confirm_new_password')} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    <div className="pt-2">
                        <Button type="submit">{t('settings.update_password')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;