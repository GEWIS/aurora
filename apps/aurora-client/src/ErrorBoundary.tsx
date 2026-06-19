import { PropsWithChildren, ErrorInfo, Component, ReactNode } from 'react';

interface Props extends PropsWithChildren {
  fallback?: ReactNode;
}

interface State {
  error?: Error;
  stack?: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, stack: errorInfo.componentStack });
    console.error(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error && this.props.fallback) {
      return this.props.fallback;
    } else if (this.state.error) {
      return (
        <div className="flex flex-col gap-4 justify-center items-center p-32">
          <h1 className="text-4xl">💀💀💀 Something went wrong</h1>
          <p>
            {this.state.error.name}: {this.state.error.message}
          </p>
          {this.state.stack && <p className="whitespace-pre-line">{this.state.stack}</p>}
        </div>
      );
    }

    return this.props.children;
  }
}
