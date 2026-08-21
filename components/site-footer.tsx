export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand-logo" href="#top" aria-label="Outreach+ home">
              <img src="/assets/outreach-logo-primary.png" alt="Outreach+" />
            </a>
            <p>
              Your AI marketing manager for hospitality teams that want more consistent growth without more daily marketing work.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <b>Explore</b>
              <a href="#product">How it helps</a>
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div>
              <b>Get started</b>
              <a href="#faq">FAQ</a>
              <a href="/chat">Chat with Outreach+</a>
              <a href="/register">Create your workspace</a>
            </div>
          </div>
        </div>

        <div className="footer-cta">
          <span>Ready to make your next campaign easier?</span>
          <a href="/chat">Chat with Outreach+ <i>→</i></a>
        </div>

        <div className="footer-bottom">
          <small>© 2026 Outreach+. All rights reserved.</small>
          <nav aria-label="Legal links">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
          </nav>
          <small>Built for hospitality teams in India.</small>
        </div>
      </div>
    </footer>
  );
}
