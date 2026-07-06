import React, { useState } from 'react';
import { X, Link2, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ImportedProductData = {
  name: string | null;
  price: number | null;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  affiliateLink: string;
};

interface ImportProductModalProps {
  onClose: () => void;
  onImported: (data: ImportedProductData) => void;
}

type ImportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ImportedProductData }
  | { status: 'error'; message: string; affiliateLink?: string };

const IMPORT_STEPS = [
  'Connecting to product page...',
  'Extracting product details...',
  'Reading price and images...',
  'Detecting category...',
  'Almost done...',
];

export function ImportProductModal({ onClose, onImported }: ImportProductModalProps) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<ImportState>({ status: 'idle' });
  const [stepIdx, setStepIdx] = useState(0);

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setState({ status: 'loading' });
    setStepIdx(0);

    // Animate through steps for UX
    const stepTimer = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, IMPORT_STEPS.length - 1));
    }, 1800);

    try {
      const res = await fetch('/api/import/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      clearInterval(stepTimer);
      const data = await res.json() as ImportedProductData & { error?: string };

      if (!res.ok || data.error) {
        setState({
          status: 'error',
          message: data.error ?? 'Could not extract product data.',
          affiliateLink: data.affiliateLink ?? trimmed,
        });
        return;
      }

      setState({ status: 'success', data });
    } catch {
      clearInterval(stepTimer);
      setState({
        status: 'error',
        message: 'Network error. Make sure you are connected and try again.',
        affiliateLink: trimmed,
      });
    }
  }

  function handleProceed() {
    if (state.status === 'success') {
      onImported(state.data);
    }
  }

  function handleManualFill() {
    const link = state.status === 'error' ? (state.affiliateLink ?? url.trim()) : url.trim();
    onImported({
      name: null,
      price: null,
      description: null,
      imageUrl: null,
      category: null,
      affiliateLink: link,
    });
  }

  const isLoading = state.status === 'loading';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Smart Product Import</h2>
              <p className="text-xs text-muted-foreground">Paste any Daraz or affiliate link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Product URL or Affiliate Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (state.status !== 'idle') setState({ status: 'idle' });
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading && url.trim()) handleImport(); }}
                  placeholder="https://www.daraz.pk/products/..."
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50 placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={handleImport}
                disabled={isLoading || !url.trim()}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Import</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {state.status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                    <p className="text-sm font-medium text-primary">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={stepIdx}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="inline-block"
                        >
                          {IMPORT_STEPS[stepIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: '5%' }}
                      animate={{ width: `${((stepIdx + 1) / IMPORT_STEPS.length) * 90}%` }}
                      transition={{ duration: 1.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {state.status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">Product data extracted!</p>
                  </div>

                  <div className="flex gap-3">
                    {state.data.imageUrl && (
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        <img
                          src={state.data.imageUrl}
                          alt="Product"
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {state.data.name ?? <span className="text-muted-foreground italic">Name not found</span>}
                      </p>
                      {state.data.price && (
                        <p className="text-base font-bold text-primary">Rs. {state.data.price.toLocaleString()}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {state.data.category && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {state.data.category}
                          </span>
                        )}
                        {!state.data.name && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">Some fields need manual input</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {state.status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">{state.message}</p>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 pl-6">
                    The affiliate link will be pre-filled. You can enter other details manually.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Supported sites note */}
          {state.status === 'idle' && (
            <p className="text-xs text-muted-foreground">
              Works best with Daraz product pages. Also supports affiliate redirect links (bit.ly, invol.co, etc.).
              If auto-import fails, you can fill the form manually.
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-5 border-t border-border">
          <button
            onClick={handleManualFill}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors underline-offset-2 hover:underline"
          >
            Fill manually instead
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium rounded-xl text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
            {state.status === 'success' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleProceed}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Review &amp; Save
              </motion.button>
            )}
            {state.status === 'error' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleManualFill}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Fill Manually
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
