export default function UnauthorizedPage() {
  return (
    <div className="auth-shell">
      <div className="card auth-card" style={{ padding: 28, textAlign: "center" }}>
        <h1 className="display">Accès refusé</h1>
        <p className="lede">Ce compte est connecté mais n&apos;a pas les droits admin.</p>
      </div>
    </div>
  );
}
