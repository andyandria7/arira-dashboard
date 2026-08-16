export default function UnauthorizedPage() {
  return (
    <div className="auth-shell">
      <div>
        <div className="auth-brand" style={{ justifyContent: "center" }}>
          <div className="brand-mark" />
          <div className="auth-brand-text">
            <div className="display">Arira</div>
            <div className="sub">Espace admin</div>
          </div>
        </div>
        <div className="card auth-card" style={{ textAlign: "center" }}>
          <h1 className="display">Accès refusé</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Ce compte est connecté mais n&apos;a pas les droits admin.
          </p>
        </div>
      </div>
    </div>
  );
}
