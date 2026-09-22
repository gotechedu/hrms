import React, { useState } from 'react';
import {
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getEmbeddableUrl } from '../../utils/embedUtils';

export default function IframeViewer({
  url,
  title = 'Document / Circular',
  subtitle = '',
  badge = 'Official Circular',
  onComplete,
  isCompleted = false,
  completing = false,
  showCompleteButton = true,
  completeButtonText = 'Mark as Complete',
  height = 'h-[620px]',
  extraActions,
}) {
  const [useNative, setUseNative] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-2xs">
        <FileText className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-bold text-slate-800">No Circular or Document Attached</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          No circular URL or document link has been specified for this item yet.
        </p>
      </div>
    );
  }

  const embedUrl = getEmbeddableUrl(url, useNative ? 'native' : 'auto');
  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div
      className={`flex flex-col rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'w-full'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0 border border-blue-200">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[9px] font-mono font-bold text-blue-700 uppercase">
                <Sparkles className="h-2.5 w-2.5" />
                {badge}
              </span>
              <span className="font-heading text-xs font-bold text-slate-900 truncate">
                {title}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Viewer switch for PDFs */}
          {isPdf && (
            <button
              onClick={() => {
                setUseNative(!useNative);
                setIframeKey((prev) => prev + 1);
                setIsLoading(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              title="Toggle between Google Docs preview and native browser PDF viewer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{useNative ? 'Google Viewer' : 'Direct Viewer'}</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3 w-3 text-slate-500" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3 text-slate-500" />
                <span>Fullscreen</span>
              </>
            )}
          </button>

          {/* Open in New Tab */}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
            title="Open original circular document in a new tab"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Open Link</span>
          </a>

          {/* Optional Download button */}
          {url.startsWith('http') && (
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs"
              title="Download Document"
            >
              <Download className="h-3 w-3" />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className={`relative w-full bg-slate-900 ${isFullscreen ? 'flex-1' : height}`}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xs text-white z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
            <span className="text-xs font-semibold mt-3 text-slate-300">
              Loading Circular in Interactive Viewer...
            </span>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={embedUrl}
          title={title}
          onLoad={() => setIsLoading(false)}
          className="h-full w-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Fallback alert note & Bottom Completion Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/90 px-5 py-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <AlertCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>
            Having trouble previewing?{' '}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-600 hover:underline"
            >
              Click here to view in a dedicated browser window
            </a>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {extraActions}

          {showCompleteButton && onComplete && (
            <button
              onClick={onComplete}
              disabled={completing || isCompleted}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition shadow-sm cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 active:scale-98'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCompleted ? 'Completed ✓' : completeButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
