import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for file upload operations
 * Prevents entire app crash from file/camera permission errors
 */
export class FileUploadErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FileUpload Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700">
            <p className="font-semibold">Failed to process file upload</p>
            <p className="text-xs">{this.state.error?.message || 'Please try again'}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default FileUploadErrorBoundary;
