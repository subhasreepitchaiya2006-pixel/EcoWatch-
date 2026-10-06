import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EcoWatch UI Runtime Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    // Navigate to home without full reload
    window.location.hash = "#/home";
    // Reset error state to allow UI to recover
    this.setState({ hasError: false, error: null });
  };

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.hash = "#/home";
    // Reset error state after clearing caches
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-4xl">public</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">EcoWatch Intelligence</h2>
              <p className="text-sm text-gray-500 mt-1">Application encountered an unexpected display issue.</p>
            </div>
            {this.state.error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl font-mono text-left overflow-auto max-h-32 border border-red-100">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-[#004ac6] hover:bg-[#003da6] text-white text-sm font-semibold rounded-xl transition-all shadow cursor-pointer"
              >
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Clear Cache &amp; Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
