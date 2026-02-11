'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserType } from '@operator/shared/types';

export default function AdminHome() {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      setIsAuthorized(false);
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      if (userData.userType === 'ADMIN') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You do not have ADMIN privileges to access this panel.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Please connect with an admin wallet to continue.
          </p>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the Operator Admin Panel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/users"
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Users
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage user accounts and permissions
            </p>
          </Link>

          <Link
            href="/games"
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Games
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configure and manage games
            </p>
          </Link>

          <Link
            href="/providers"
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Providers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage game providers
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

