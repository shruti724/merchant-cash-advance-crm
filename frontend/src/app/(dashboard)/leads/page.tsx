'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { leadsApi } from '@/lib/leads-api';
import { Lead, LeadStatus } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { ApiError } from '@/lib/api-client';

const STATUS_FILTERS: (LeadStatus | 'ALL')[] = [
  'ALL',
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'DISQUALIFIED',
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await leadsApi.list({ status: statusFilter === 'ALL' ? undefined : statusFilter });
    setLeads(res.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Sales pipeline — capture and qualify leads</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New lead'}
        </button>
      </div>

      {showForm && <NewLeadForm onCreated={() => { setShowForm(false); load(); }} />}

      <div className="flex gap-2 mb-4">
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
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Business</th>
              <th className="text-left px-4 py-2.5 font-medium">Contact</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && leads.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No leads yet</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="font-medium text-brand-700 hover:underline">
                    {lead.businessName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {lead.contactName}
                  <div className="text-xs text-gray-400">{lead.email}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewLeadForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', phone: '', source: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await leadsApi.create(form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-2 gap-4">
      {error && <div className="col-span-2 text-sm text-red-600">{error}</div>}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Business name</label>
        <input className="input" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Contact name</label>
        <input className="input" required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input className="input" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <input className="input" required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Source (optional)</label>
        <input className="input" value={form.source} onChange={(e) => update('source', e.target.value)} placeholder="referral, website, cold-call…" />
      </div>
      <div className="col-span-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating…' : 'Create lead'}
        </button>
      </div>
    </form>
  );
}
