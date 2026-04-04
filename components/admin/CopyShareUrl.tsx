'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function CopyShareUrl({ shareUrlId }: { shareUrlId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/f/${shareUrlId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-dim-steel hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-150 shrink-0"
      title="Copy share link"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
      ) : (
        <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
      )}
    </button>
  );
}
