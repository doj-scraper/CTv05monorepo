"use client";

import { useEffect, useRef, useState } from 'react';
import { FileText, Zap, Headphones, ArrowRight } from 'lucide-react';

export function SupportSection() {
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

  const links = [
    { text: 'Screen replacement guide', icon: FileText },
    { text: 'Battery calibration steps', icon: Zap },
    { text: 'Connector diagram PDF', icon: FileText },
    { text: 'Open a support ticket', icon: Headphones },
  ];

  return (
    <section ref={sectionRef} id="support" className="section-pinned flex items-center" style={{ zIndex: 80 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
          {/* Left: Image */}
          <div 
            className={`relative transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <img 
                src="/images/teardown_guide.jpg" 
                alt="Teardown guide"
                className="w-full h-full object-cover animate-drift"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ct-bg/40 to-transparent" />
            </div>
          </div>

          {/* Right: Content */}
          <div 
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-4">
              READY TO<br />
              <span className="text-ct-accent">INSTALL</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base max-w-md mb-8">
              Step-by-step guides, connector maps, and symptom checklists—so your team moves fast.
            </p>

            <div className="space-y-3">
              {links.map((link, index) => (
                <a 
                  key={index}
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-lg bg-ct-bg-secondary/50 border border-white/5 hover:border-ct-accent/30 transition-all duration-200 group"
                >
                  <link.icon className="w-5 h-5 text-ct-accent" />
                  <span className="text-ct-text text-sm flex-1">{link.text}</span>
                  <ArrowRight className="w-4 h-4 text-ct-text-secondary group-hover:text-ct-accent transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
