
import React, { useEffect, useRef, useState } from 'react';

interface VisibilityTrackerProps {
  children: (isVisible: boolean) => React.ReactNode;
  threshold?: number;
}

export const VisibilityTracker: React.FC<VisibilityTrackerProps> = ({
  children,
  threshold = 0.5,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return (
    <div ref={elementRef}>
      {children(isVisible)}
    </div>
  );
};
