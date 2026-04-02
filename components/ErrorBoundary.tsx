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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-danger-200 bg-danger-50/50 px-8 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-100">
            <AlertTriangle className="h-7 w-7 text-danger-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-surface-900">Something went wrong</h3>
          <p className="mt-2 max-w-md text-sm text-surface-500">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          {this.state.error && (
            <code className="mt-3 max-w-md rounded-lg bg-surface-900 px-4 py-2 text-xs text-surface-300">
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReset}
            className="mt-5 flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
