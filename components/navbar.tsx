export default function Navbar() {
  return <header className="site-navbar">
    <nav className="navbar-inner" aria-label="Primary navigation">
      <a className="navbar-logo" href="#top" aria-label="Outreach+ home">
        <img src="/assets/outreach-logo-primary.png" alt="Outreach+" />
      </a>
      <div className="navbar-links">
        <a href="#product">Product</a>
        <a href="#how">How it works</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </div>
      <a className="navbar-cta" href="/chat">Chat with Outreach+ <span>→</span></a>
    </nav>
  </header>;
}
