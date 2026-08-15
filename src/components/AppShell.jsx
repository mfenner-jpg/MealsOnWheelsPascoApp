import "./AppShell.css";

export default function AppShell({ children }) {
  return (
    <div className="desktop-stage">
      <div className="app-shell">
        {children}
      </div>
    </div>
  );
}