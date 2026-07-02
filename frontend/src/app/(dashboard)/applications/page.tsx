'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { applicationsApi } from '@/lib/applications-api';
import { Application, ApplicationStatus } from '@/types';
import { StatusBadge } from '@/components/status-badge';

const STATUS_FILTERS: (ApplicationStatus | 'ALL')[] = [
  'ALL', 'DRAFT', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'CANCELLED',
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    applicationsApi
      .list({ status: statusFilter === 'ALL' ? undefined : statusFilter })
      .then((res) => setApplications(res.items))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500">
          Deal workflow — documents, review, and underwriter decisioning
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              statusFilter === s
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Application</th>
              <th className="text-left px-4 py-2.5 font-medium">Amount</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && applications.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                No applications yet — convert a lead to auto-create one
              </td></tr>
            )}
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/applications/${app.id}`} className="font-medium text-brand-700 hover:underline">
                    {app.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {app.currency} {Number(app.requestedAmount).toLocaleString()}
                </td>
                <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(app.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
