import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Skeleton Loader
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse bg-slate-200 rounded-lg', className)} />;
};

/**
 * Spinner วงกลมหมุน
 */
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-primary/20 border-t-primary animate-spin',
        sizes[size],
        className
      )}
    />
  );
};

/**
 * EmptyState: แสดงเมื่อไม่มีข้อมูล
 */
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div className={cn('text-center py-12 px-4 flex flex-col items-center justify-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-700">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>}
      {actionText && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

/**
 * ErrorState: แสดงเมื่อเกิดข้อผิดพลาดในการโหลดข้อมูล
 */
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  message,
  onRetry,
  className,
}) => {
  return (
    <div className={cn('text-center py-12 px-4 flex flex-col items-center justify-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-danger mb-3.5">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          ลองใหม่อีกครั้ง
        </Button>
      )}
    </div>
  );
};
