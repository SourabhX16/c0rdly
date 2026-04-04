'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card-elevated flex flex-col items-center justify-center px-8 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
            <AlertTriangle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-white">Something went wrong</h3>
          <p className="mt-2 max-w-md text-sm text-dim-steel leading-relaxed">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          {this.state.error && (
            <code className="mt-3 max-w-md rounded-xl bg-deep-abyss px-4 py-2 text-xs text-frost-gray font-mono border border-white/[0.06]">
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReset}
            className="btn-primary mt-5 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
