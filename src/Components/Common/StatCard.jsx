import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  period = 'vs last month',
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  badgeText,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor} shadow-2xs`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {badgeText && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
          <span className="text-slate-400 text-[11px]">{period}</span>
        </div>
      )}
    </div>
  );
}
