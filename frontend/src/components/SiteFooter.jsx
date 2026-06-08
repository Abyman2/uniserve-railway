import { Mail, Globe, MessageSquare } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <span className="site-logo">UniServe</span>
          <p className="footer-tagline">From students, to students.</p>
          <p className="footer-desc">
            A campus marketplace connecting students who need help with students who can deliver.
          </p>
        </div>
        <div className="footer-social">
          <a href="https://uniserve.edu" target="_blank" rel="noreferrer" aria-label="Website">
            <Globe size={20} />
          </a>
          <a href="mailto:hello@uniserve.edu" aria-label="Email">
            <Mail size={20} />
          </a>
          <a href="#" aria-label="Contact">
            <MessageSquare size={20} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} UniServe. Built for university communities.
      </div>
    </footer>
  );
}
