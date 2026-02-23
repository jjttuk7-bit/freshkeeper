'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertTriangle className="w-12 h-12 text-accent-orange mb-4" />
          <h3 className="text-lg font-semibold text-navy mb-2">문제가 발생했습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message ?? '예상치 못한 오류가 발생했습니다'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-mint text-white rounded-lg text-sm font-medium hover:bg-mint-dark"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
