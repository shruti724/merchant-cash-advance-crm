import clsx from 'clsx';

const COLORS: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-indigo-100 text-indigo-700',
  CONVERTED: 'bg-green-100 text-green-700',
  DISQUALIFIED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  DOCUMENTS_PENDING: 'bg-amber-100 text-amber-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-200 text-gray-600',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx('badge', COLORS[status] ?? 'bg-gray-100 text-gray-700')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
