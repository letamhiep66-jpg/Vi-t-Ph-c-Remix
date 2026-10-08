import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('Unhandled runtime error in UI component:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      sessionStorage.removeItem('nep_user_profile');
      sessionStorage.removeItem('nep_wardrobe_items');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 text-[#2C241D]">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DFD1] shadow-xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-[#800E13] flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-heritage text-2xl font-bold text-[#2C241D]">
                Không Gian Trải Nghiệm Cần Làm Mới
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#786454] leading-relaxed">
                Đã xảy ra sự cố hiển thị tạm thời khi xử lý dữ liệu phục sức. Bạn có thể khôi phục lại trạng thái ban đầu để tiếp tục trải nghiệm.
              </p>
            </div>

            <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#DFD1BD] text-[11px] text-[#800E13] font-mono break-words text-left max-h-24 overflow-y-auto">
              {this.state.error?.message || 'Lỗi không xác định'}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#800E13]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Khôi phục & Tải lại trang</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
