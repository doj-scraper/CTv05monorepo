"use client";

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

export function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="quote" className="section-pinned flex items-center bg-ct-bg-secondary" style={{ zIndex: 50 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
          {/* Left: Form */}
          <div 
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-4">
              BUILD A<br />
              <span className="text-ct-accent">QUOTE</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base max-w-md mb-8">
              Add items, set quantities, and send a request. We'll confirm stock and pricing within hours.
            </p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-micro text-ct-text-secondary mb-2 block">Email</label>
                <input type="email" placeholder="your@email.com" className="input-dark" />
              </div>
              <div>
                <label className="text-micro text-ct-text-secondary mb-2 block">Company</label>
                <input type="text" placeholder="Your company name" className="input-dark" />
              </div>
              <div>
                <label className="text-micro text-ct-text-secondary mb-2 block">Part numbers / notes</label>
                <textarea 
                  placeholder="Enter SKU codes or describe what you need..."
                  rows={4}
                  className="input-dark resize-none"
                />
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="btn-primary">Send Quote Request</button>
                <button className="btn-secondary">Download SKU list (CSV)</button>
              </div>
            </div>
          </div>

          {/* Right: Summary Card */}
          <div 
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="dashboard-card p-6 animate-float">
              <h3 className="text-ct-text font-display font-semibold text-lg mb-6">Quote Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img src="/images/product_screen.jpg" alt="" className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="text-ct-text text-sm">Display Assembly</p>
                      <p className="text-micro text-ct-text-secondary">DSP-001</p>
                    </div>
                  </div>
                  <span className="text-ct-accent font-mono">× 12</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img src="/images/product_battery.jpg" alt="" className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="text-ct-text text-sm">Battery</p>
                      <p className="text-micro text-ct-text-secondary">BAT-002</p>
                    </div>
                  </div>
                  <span className="text-ct-accent font-mono">× 24</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-micro text-ct-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Typical response: 2–4 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
