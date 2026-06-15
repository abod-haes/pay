import { useState, useEffect, useMemo } from 'react';

const useRemToPx = remValue => {
  const [htmlFontSize, setHtmlFontSize] = useState(() =>
    parseFloat(window.getComputedStyle(document.documentElement).fontSize)
  );
  useEffect(() => {
    const updateFontSize = () => {
      const newFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
      setHtmlFontSize(newFontSize);
    };
    updateFontSize(); // Initial call to set the font size

    window.addEventListener('resize', updateFontSize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('resize', updateFontSize);
    };
  }, []);

  const pxValue = useMemo(() => remValue * htmlFontSize, [remValue, htmlFontSize]);

  return pxValue;
};

export default useRemToPx;
