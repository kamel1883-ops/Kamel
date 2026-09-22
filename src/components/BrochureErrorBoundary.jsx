import React from "react";

/**
 * Error Boundary مخصّص لصفحتي البروشور — يلتقط أي خطأ وقت التشغيل
 * ويعرض رسالة واضحة بدل الشاشة البيضاء، مع تفاصيل الخطأ للمساعدة في التشخيص.
 */
export default class BrochureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("[BrochureErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error || {};
      const stack = err.stack || "";
      const compStack =
        this.state.info && this.state.info.componentStack
          ? String(this.state.info.componentStack)
          : "";
      return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex items-start justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl border border-red-200 shadow-lg p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl">⚠</div>
              <div>
                <h1 className="text-lg font-bold text-red-700">تعذّر عرض البروشور</h1>
                <p className="text-sm text-slate-500">حدث خطأ وقت التشغيل — تم التقاطه بواسطة Error Boundary.</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-slate-600 mb-1">الرسالة:</div>
                <code className="block bg-red-50 border border-red-100 rounded-md p-2 text-red-700 text-xs break-all">
                  {err.name ? `${err.name}: ` : ""}{err.message || String(err)}
                </code>
              </div>

              {stack && (
                <div>
                  <div className="font-semibold text-slate-600 mb-1">Stack Trace:</div>
                  <pre dir="ltr" className="bg-slate-900 text-slate-100 rounded-md p-3 text-[11px] overflow-auto max-h-48 whitespace-pre-wrap">
                    {stack}
                  </pre>
                </div>
              )}

              {compStack && (
                <div>
                  <div className="font-semibold text-slate-600 mb-1">Component Stack:</div>
                  <pre dir="ltr" className="bg-slate-100 rounded-md p-3 text-[11px] overflow-auto max-h-40 whitespace-pre-wrap">
                    {compStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <button
                onClick={() => this.setState({ hasError: false, error: null, info: null })}
                className="h-9 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => window.location.reload()}
                className="h-9 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold"
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}