import React from 'react';

export default class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Game crashed:", error, info);
  }

  handleClose = () => {
    this.setState({ hasError: false });
    this.props.onRecover(); // go back to content page
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Game failed to load
            </h2>
            <p className="text-gray-700 mb-4">
              Something went wrong while loading this game.
              Please try again later.
            </p>
            <button
              onClick={this.handleClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
