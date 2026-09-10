import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-850">เกิดข้อผิดพลาดในการแสดงผล</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                ระบบพบข้อผิดพลาดที่ไม่คาดคิด กรุณากดปุ่มด้านล่างเพื่อรีโหลดหน้าเว็บใหม่
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={this.handleReload}
              className="w-full font-bold shadow-md"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              รีโหลดหน้าเว็บใหม่
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
