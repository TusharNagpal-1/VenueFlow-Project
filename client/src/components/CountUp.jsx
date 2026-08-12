import { useEffect, useRef, useState } from 'react';

const CountUp = ({ value, duration = 900 }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const from = fromRef.current;
    let raf;
    const start = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(from + (target - from) * eased);
      setDisplay(current);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    raf = requestAnimationFrame(step);
    rafRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
};

export default CountUp;
