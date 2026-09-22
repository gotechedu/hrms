import React from 'react';
import { X, Sparkles, FileText } from 'lucide-react';
import IframeViewer from './IframeViewer';

export default function CircularViewerModal({
  isOpen,
  onClose,
  title = 'Course / Class Circular',
  subtitle = '',
  circularUrl = '',
  badge = 'Official Circular',
  onAcknowledge,
  acknowledged = false,
  acknowledgeText = 'Acknowledge & Mark Reviewed',
}) {
  if (!isOpen || !circularUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-800 uppercase">
                  {badge}
                </span>
                <h3 className="font-heading text-sm sm:text-base font-extrabold text-slate-900">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close Circular Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body with IframeViewer */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-slate-50/50 flex flex-col">
          <IframeViewer
            url={circularUrl}
            title={title}
            subtitle={subtitle}
            badge={badge}
            height="flex-1 min-h-[500px]"
            showCompleteButton={Boolean(onAcknowledge)}
            onComplete={onAcknowledge}
            isCompleted={acknowledged}
            completeButtonText={acknowledgeText}
          />
        </div>
      </div>
    </div>
  );
}
