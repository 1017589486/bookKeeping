import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAppContext();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      setIsLoading(true);
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        setError((err as Error).message || 'Login failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0a3 3 0 00-3 3v1a3 3 0 003 3h1a3 3 0 003-3v-1a3 3 0 00-3-3h-1zm-4 4h12M3 15v-2a3 3 0 013-3h12a3 3 0 013 3v2" />
              </svg>
              <h1 className="text-3xl font-bold ml-3 text-gray-900">FinTrack</h1>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">{t('login.title')}</h2>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
              <Input
                label={t('login.email')}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label={t('login.password')}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-sm text-right">
                <a href="#" className="font-medium text-primary hover:text-indigo-500">
                  {t('login.forgot_password')}
                </a>
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : t('login.signin')}
                </Button>
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
              {t('login.no_account')}{' '}
              <Link to="/register" className="font-medium text-primary hover:text-indigo-500">
                {t('login.register_here')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop"
          alt="Financial planning"
        />
        <div className="absolute inset-0 bg-primary opacity-70"></div>
         <div className="absolute bottom-10 left-10 text-white">
            <h3 className="text-3xl font-bold">Manage your finances with ease.</h3>
            <p className="mt-2 text-lg opacity-90">All your accounts, in one place.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;