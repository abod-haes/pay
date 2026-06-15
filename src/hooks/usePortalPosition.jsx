import { useState, useEffect } from 'react';

const usePortalPosition = iconRef => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const calculatePosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth; // Get the viewport width in pixels
      const calculatedRight = viewportWidth - rect.right;
      const calculatedTop = rect.bottom + 16; // 1rem below

      setPosition({ top: calculatedTop, right: calculatedRight });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      calculatePosition(); // Initial calculation
    }, 0);

    const handleResize = () => {
      calculatePosition(); // Recalculate on resize
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup
    };
  }, [iconRef]);

  return position;
};

export default usePortalPosition;
