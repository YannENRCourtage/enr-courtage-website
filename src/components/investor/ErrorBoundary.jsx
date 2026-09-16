import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[InvestorPlatform ErrorBoundary]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-gray-900 border border-red-500/40 text-gray-200 shadow-2xl space-y-4 max-w-xl mx-auto my-6">
          <div className="flex items-center space-x-3 text-red-400">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Une erreur d'affichage est survenue</h3>
              <p className="text-xs text-gray-400">Le module n'a pas pu être chargé avec les données actuelles.</p>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 font-mono text-[11px] text-red-300 break-words max-h-32 overflow-y-auto">
              {String(this.state.error.message || this.state.error)}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser la vue</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
