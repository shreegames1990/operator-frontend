'use client';

import dynamic from 'next/dynamic';

const AdminNavbar = dynamic(() => import('./admin-navbar').then((mod) => ({ default: mod.AdminNavbar })), {
  ssr: false,
});

export function AdminNavbarWrapper() {
  return <AdminNavbar />;
}
