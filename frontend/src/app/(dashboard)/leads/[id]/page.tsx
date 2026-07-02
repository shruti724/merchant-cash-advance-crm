'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi } from '@/lib/leads-api';
import { Lead, LeadStatus } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { ApiError } from '@/lib/api-client';

// Mirrors the backend's LEAD_TRANSITIONS state machine so the UI only
// ever offers legal next steps — the backend remains the source of truth
// and re-validates on every request regardless.
const NEXT_STATES: Record<LeadStatus, LeadStatus[]> = {
  NEW: ['CONTACTED', 'DISQUALIFIED'],
  CONTACTED: ['QUALIFIED', 'DISQUALIFIED'],
  QUALIFIED: ['CONVERTED', 'DISQUALIFIED'],
  CONVERTED: [],
  DISQUALIFIED: [],
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState<LeadStatus | null>(null);

  async function load() {
    const data = await leadsApi.get(id);
    setLead(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleTransition(status: LeadStatus) {
    setError(null);
    setTransitioning(status);
    try {
      const updated = await leadsApi.updateStatus(id, status);
      setLead(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Transition failed');
    } finally {
      setTransitioning(null);
    }
  }

  if (!lead) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/leads')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← Back to leads
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{lead.businessName}</h1>
            <p className="text-sm text-gray-500">{lead.contactName}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
          <div>
            <dt className="text-gray-400 text-xs">Email</dt>
            <dd className="text-gray-800">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs">Phone</dt>
            <dd className="text-gray-800">{lead.phone}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs">Source</dt>
            <dd className="text-gray-800">{lead.source || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs">Created</dt>
            <dd className="text-gray-800">{new Date(lead.createdAt).toLocaleString()}</dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {lead.status === 'CONVERTED' && (
          <div className="mt-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2">
            This lead converted — a draft application was created automatically. See{' '}
            <Link href="/applications" className="underline font-medium">Applications</Link>.
          </div>
        )}

        {NEXT_STATES[lead.status].length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Move to next stage</p>
            <div className="flex gap-2">
              {NEXT_STATES[lead.status].map((status) => (
                <button
                  key={status}
                  onClick={() => handleTransition(status)}
                  disabled={transitioning !== null}
                  className={status === 'DISQUALIFIED' ? 'btn-danger' : 'btn-primary'}
                >
                  {transitioning === status ? 'Updating…' : status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
