'use client';

import { useEffect, useState } from 'react';

const slides = Array.from({ length: 9 }, (_, index) => `/assets/slides/${index + 1}.png`);

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 4500); return () => window.clearInterval(timer); }, []);
  return <section className="hero-slider" aria-label="Outreach+ product workflow gallery">
    <div className="slider-viewport"><img src={slides[active]} alt={`Outreach+ workflow screen ${active + 1} of ${slides.length}`} /><button className="slider-arrow previous" onClick={() => setActive(current => (current - 1 + slides.length) % slides.length)} aria-label="Show previous workflow screen">←</button><button className="slider-arrow next" onClick={() => setActive(current => (current + 1) % slides.length)} aria-label="Show next workflow screen">→</button></div>
    <div className="slider-controls" aria-label="Choose workflow screen">{slides.map((_, index) => <button key={index} className={index === active ? 'active' : ''} aria-label={`Show screen ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} />)}</div>
  </section>;
}
