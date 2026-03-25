import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <Icon
        size={48}
        className="text-arena-text-muted mb-4"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h3 className="font-semibold text-arena-text text-base mb-1">{title}</h3>
      <p className="text-arena-text-muted text-sm max-w-[280px] mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm rounded-xl bg-arena-accent text-arena-bg font-semibold hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
