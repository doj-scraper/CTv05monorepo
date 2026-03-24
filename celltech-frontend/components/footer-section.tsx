import { Mail, Phone } from 'lucide-react';

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: ['Browse Catalog', 'Pricing', 'Quality Standards', 'Shipping Info']
    },
    {
      title: 'Support',
      links: ['Contact Us', 'Documentation', 'FAQ', 'Status']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Press']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Cookies', 'Security']
    }
  ];

  return (
    <footer className="bg-ct-bg-secondary border-t border-white/5" style={{ zIndex: 130 }}>
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ct-accent flex items-center justify-center">
                <span className="text-ct-bg font-bold text-sm">CT</span>
              </div>
              <span className="font-display font-bold text-ct-text tracking-wide">CellTech</span>
            </div>
            <p className="text-micro text-ct-text-secondary">
              Wholesale parts for repair shops.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-ct-text-secondary hover:text-ct-text transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & Bottom */}
        <div className="border-t border-white/5 pt-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Contact */}
            <div>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">CONTACT</h3>
              <div className="space-y-3">
                <a href="mailto:sales@celltech.com" className="flex items-center gap-3 text-sm text-ct-text-secondary hover:text-ct-text transition-colors">
                  <Mail className="w-4 h-4" />
                  sales@celltech.com
                </a>
                <a href="tel:+18005550123" className="flex items-center gap-3 text-sm text-ct-text-secondary hover:text-ct-text transition-colors">
                  <Phone className="w-4 h-4" />
                  +1 (800) 555-0123
                </a>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">HOURS</h3>
              <div className="space-y-1 text-sm text-ct-text-secondary">
                <p>Mon–Fri: 8am–6pm ET</p>
                <p>Sat: 9am–2pm ET</p>
                <p>Sun: Closed</p>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-micro text-ct-text-secondary mb-4 font-semibold">FOLLOW</h3>
              <div className="flex gap-4">
                <a href="#" className="text-sm text-ct-text-secondary hover:text-ct-accent transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-sm text-ct-text-secondary hover:text-ct-accent transition-colors">
                  LinkedIn
                </a>
                <a href="#" className="text-sm text-ct-text-secondary hover:text-ct-accent transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-micro text-ct-text-secondary">
              © {currentYear} CellTech Distributor. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
