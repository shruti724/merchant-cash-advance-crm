'use client';

import { useEffect, useState } from 'react';
import { auditApi } from '@/lib/audit-api';
import { AuditLogEntry } from '@/types';

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    auditApi
      .list()
      .then((res) => setEntries(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500">
          Every domain event, captured automatically by the wildcard event listener — admin only
        </p>
      </div>

      <div className="card divide-y divide-gray-100">
        {loading && <div className="px-4 py-6 text-center text-gray-400 text-sm">Loading…</div>}
        {!loading && entries.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">No events recorded yet</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="px-4 py-3">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
            >
              <div>
                <span className="font-mono text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 mr-2">
                  {entry.eventName}
                </span>
                <span className="text-sm text-gray-500">{entry.entityType} · {entry.entityId.slice(0, 8)}…</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(entry.occurredAt).toLocaleString()}</span>
            </button>
            {expanded === entry.id && (
              <pre className="mt-2 text-xs bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-600">
                {JSON.stringify(entry.payload, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
