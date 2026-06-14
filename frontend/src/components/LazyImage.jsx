import React, { useState, useEffect, useRef } from 'react';

// Lazy loads image with blur-to-sharp reveal effect
const LazyImage = ({ src, alt, className = '', style = {} }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '80px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={imgRef}
      className={`lazy-img-wrapper ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {/* Shimmer placeholder while image not loaded */}
      {(!isLoaded) && (
        <div
          className="shimmer-placeholder"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 1,
            borderRadius: 'inherit'
          }}
        />
      )}

      {/* Actual image — starts blurred, clears on load */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`lazy-img ${isLoaded ? 'loaded' : 'blur'}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: style.objectFit || 'cover',
            display: 'block',
            transition: 'filter 0.7s ease, opacity 0.7s ease, transform 0.7s ease',
            filter: isLoaded ? 'blur(0px)' : 'blur(12px)',
            opacity: isLoaded ? 1 : 0.4,
            transform: isLoaded ? 'scale(1)' : 'scale(1.04)',
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;
