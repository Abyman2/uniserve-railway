import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef([]);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    document.body.classList.add('custom-cursor-active');

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf;
    const trailLength = 8;
    const trail = [];

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      
      // Add to trail
      trail.push({ x: mx, y: my, alpha: 1 });
      if (trail.length > trailLength) trail.shift();
    };

    const animate = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      
      // Animate trail
      trail.forEach((point, i) => {
        point.alpha -= 0.08;
        if (point.alpha < 0) point.alpha = 0;
        
        const trailDot = trailRef.current[i];
        if (trailDot) {
          trailDot.style.transform = `translate(${point.x}px, ${point.y}px)`;
          trailDot.style.opacity = point.alpha * 0.3;
          trailDot.style.width = `${8 + i}px`;
          trailDot.style.height = `${8 + i}px`;
        }
      });
      
      raf = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      ring.classList.add('cursor-hover');
      ring.style.transform = `translate(${rx}px, ${ry}px) scale(1.5)`;
    };
    const onLeave = () => ring.classList.remove('cursor-hover');

    document.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(animate);

    const interactives = document.querySelectorAll('a, button, [role="button"], .listing-card, .nav-link, .sidebar-tab, input, textarea, select');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [role="button"], .listing-card, .nav-link, .sidebar-tab, input, textarea, select').forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailRef.current[i] = el; }}
          className="cursor-trail"
          aria-hidden="true"
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            borderRadius: '50%',
            background: 'var(--violet)',
            opacity: 0,
            transition: 'opacity 0.1s ease-out',
            zIndex: 9998,
          }}
        />
      ))}
    </>
  );
}
