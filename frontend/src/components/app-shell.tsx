'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/context/auth-context';

const NAV = [
  { href: '/leads', label: 'Leads' },
  { href: '/applications', label: 'Applications' },
  { href: '/audit-log', label: 'Audit Log', adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/leads" className="font-semibold text-brand-700">
              MCA Portfolio CRM
            </Link>
            <nav className="flex gap-1">
              {NAV.filter((item) => !item.adminOnly || hasRole('TENANT_ADMIN')).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith(item.href)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right leading-tight">
              <div className="font-medium text-gray-800">{user?.email}</div>
              <div className="text-gray-400 text-xs">{user?.roles.join(', ')}</div>
            </div>
            <button onClick={logout} className="btn-secondary !px-3 !py-1.5">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
