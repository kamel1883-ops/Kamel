import { useEffect, useRef, useState } from "react";

/**
 * Touch pull-to-refresh hook. Activates only when the window is scrolled
 * to the top and the user drags downward. Returns the current pull distance
 * and a refreshing flag so the caller can render an indicator.
 *
 * @param {Object} opts
 * @param {Function} opts.onRefresh  Async function called when the pull crosses the threshold.
 * @param {number}   opts.threshold  Pixel distance required to trigger (default 70).
 * @param {boolean}  opts.enabled   Whether the gesture is active (default true).
 */
export function usePullToRefresh({ onRefresh, threshold = 70, enabled = true } = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e) => {
      if (refreshing) return;
      if (window.scrollY > 0) return; // only when at top
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e) => {
      if (!pulling.current || refreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        if (e.cancelable) e.preventDefault();
        const d = Math.min(delta * 0.5, threshold * 1.5);
        pullRef.current = d;
        setPullDistance(d);
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullRef.current >= threshold) {
        setRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh?.();
        } finally {
          setRefreshing(false);
          setPullDistance(0);
          pullRef.current = 0;
        }
      } else {
        setPullDistance(0);
        pullRef.current = 0;
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, refreshing, threshold, onRefresh]);

  return { pullDistance, refreshing };
}