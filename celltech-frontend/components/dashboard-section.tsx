"use client";

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export function DashboardSection() {
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

  const features = [
    'Reorder in two clicks',
    'Saved SKU lists',
    'Team permissions',
    'Spend summaries',
  ];

  return (
    <section ref={sectionRef} id="dashboard" className="section-pinned flex items-center" style={{ zIndex: 90 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
          {/* Left: Content */}
          <div 
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-4">
              YOUR<br />
              <span className="text-ct-accent">OPERATION</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base max-w-md mb-8">
              Order history, saved lists, and team access—built for scale.
            </p>

            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-ct-accent flex-shrink-0" />
                  <span className="text-ct-text text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary">
              View Dashboard Demo
            </button>
          </div>

          {/* Right: Dashboard Image */}
          <div 
            className={`relative transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden dashboard-card animate-float">
              <img 
                src="/images/dashboard_ui.jpg" 
                alt="Dashboard UI"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
