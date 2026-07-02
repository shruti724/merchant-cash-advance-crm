'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { applicationsApi } from '@/lib/applications-api';
import { Application } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';

const TERMINAL = ['APPROVED', 'DECLINED', 'CANCELLED'];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasRole } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [docForm, setDocForm] = useState({ type: 'BANK_STATEMENT', fileName: '' });
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);

  async function load() {
    const data = await applicationsApi.get(id);
    setApp(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function runAction(action: () => Promise<Application>) {
    setError(null);
    setBusy(true);
    try {
      const updated = await action();
      setApp(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddDocument(e: FormEvent) {
    e.preventDefault();
    if (!docForm.fileName.trim()) return;
    setError(null);
    setBusy(true);
    try {
      await applicationsApi.addDocument(id, {
        type: docForm.type,
        fileName: docForm.fileName,
        // In production this would be a pre-signed S3 upload; the storage
        // key is simulated here for demo purposes.
        storageKey: `s3://tenant-bucket/applications/${id}/${docForm.fileName}`,
      });
      setDocForm({ ...docForm, fileName: '' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to attach document');
    } finally {
      setBusy(false);
    }
  }

  if (!app) return <div className="text-gray-400 text-sm">Loading…</div>;

  const canDecide = hasRole('UNDERWRITER', 'TENANT_ADMIN');

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/applications')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← Back to applications
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Application {app.id.slice(0, 8)}…</h1>
            <p className="text-sm text-gray-500">
              {app.currency} {Number(app.requestedAmount).toLocaleString()} requested
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
          <div>
            <dt className="text-gray-400 text-xs">Documents attached</dt>
            <dd className="text-gray-800">{app.documentCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs">Reviewer</dt>
            <dd className="text-gray-800">{app.reviewerId ? app.reviewerId.slice(0, 8) + '…' : '—'}</dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {/* DRAFT -> DOCUMENTS_PENDING */}
        {app.status === 'DRAFT' && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              className="btn-primary"
              disabled={busy}
              onClick={() => runAction(() => applicationsApi.requestDocuments(id))}
            >
              Request documents
            </button>
          </div>
        )}

        {/* DOCUMENTS_PENDING: upload + submit for review */}
        {app.status === 'DOCUMENTS_PENDING' && (
          <div className="mt-5 border-t border-gray-100 pt-4 space-y-4">
            <form onSubmit={handleAddDocument} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Document</label>
                <select
                  className="input"
                  value={docForm.type}
                  onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                >
                  <option value="BANK_STATEMENT">Bank statement</option>
                  <option value="ID_VERIFICATION">ID verification</option>
                  <option value="BUSINESS_LICENSE">Business license</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">File name</label>
                <input
                  className="input"
                  placeholder="statement-jan.pdf"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-secondary" disabled={busy}>Attach</button>
            </form>

            <button
              className="btn-primary"
              disabled={busy || (app.documentCount ?? 0) < 1}
              onClick={() => runAction(() => applicationsApi.submitForReview(id))}
              title={(app.documentCount ?? 0) < 1 ? 'Attach at least one document first' : ''}
            >
              Submit for review
            </button>
          </div>
        )}

        {/* UNDER_REVIEW: underwriter decision */}
        {app.status === 'UNDER_REVIEW' && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            {!canDecide && (
              <p className="text-sm text-gray-500">
                Awaiting an underwriter decision. Your role does not have decisioning permission.
              </p>
            )}
            {canDecide && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    className="btn-primary"
                    disabled={busy}
                    onClick={() => runAction(() => applicationsApi.decide(id, 'APPROVED'))}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-danger"
                    disabled={busy}
                    onClick={() => setShowDecline((v) => !v)}
                  >
                    Decline
                  </button>
                </div>
                {showDecline && (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Decline reason</label>
                      <input
                        className="input"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Reason is required to decline"
                      />
                    </div>
                    <button
                      className="btn-danger"
                      disabled={busy || !declineReason.trim()}
                      onClick={() => runAction(() => applicationsApi.decide(id, 'DECLINED', declineReason))}
                    >
                      Confirm decline
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!TERMINAL.includes(app.status) && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              className="btn-secondary text-red-600"
              disabled={busy}
              onClick={() => runAction(() => applicationsApi.cancel(id))}
            >
              Cancel application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
