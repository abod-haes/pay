import { useEffect } from 'react';

const useClickOutside = (refs, callback) => {
  useEffect(() => {
    const handleClickOutside = event => {
      // Check if the click is outside all provided refs
      const isOutside = refs.every(ref => ref.current && !ref.current.contains(event.target));
      if (isOutside) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback]);
};

export default useClickOutside;
