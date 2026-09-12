import i18n from "../i18n/config";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: "center" }}>
          <h2>{i18n.t("error.title")}</h2>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              background: "#6d4c41",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {i18n.t("error.back")}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
