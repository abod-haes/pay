import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by AppErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // إذا كان الخطأ من نوع AxiosError أو فيه خاصية message (أي تم التعامل معه في toast)
      const err = this.state.error;
      if (err && (err.name === "AxiosError" || (typeof err === "object" && err.message))) {
        // تجاهل شاشة الخطأ، وواصل عرض children
        return this.props.children;
      }
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#f8d7da",
            color: "#721c24",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1>⚠️ Something went wrong</h1>
          <p>{err?.message ? String(err.message) : String(err)}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
