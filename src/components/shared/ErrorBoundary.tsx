"use client"

import { Component } from "react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">Algo deu errado</p>
          <p className="text-sm mt-1">Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 text-sm underline hover:text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
