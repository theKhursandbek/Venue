import { useEffect } from "react";

/**
 * Global on-scroll animator.
 * Drop <ScrollAnimator /> once in App/Layout.
 * Then use data attributes on any element:
 *
 *   data-scroll              → fade up (default)
 *   data-scroll="up"         → slide up 40px + blur
 *   data-scroll="down"       → slide down
 *   data-scroll="left"       → slide from left
 *   data-scroll="right"      → slide from right
 *   data-scroll="scale"      → zoom in from 92%
 *   data-scroll="flip"       → 3D flip in
 *   data-scroll-delay="200"  → ms delay before animation
 *   data-scroll-stagger      → auto-stagger children with [data-scroll-child]
 *
 * All GPU-only (transform + opacity + filter).
 */
export default function ScrollAnimator() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Instantly show all scroll-animated elements
      document.querySelectorAll("[data-scroll]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
        (el as HTMLElement).style.filter = "none";
      });
      document.querySelectorAll("[data-scroll-child]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
        (el as HTMLElement).style.filter = "none";
      });
      return;
    }

    const staggerMs = 80;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target as HTMLElement;

          // Handle stagger containers
          if (el.hasAttribute("data-scroll-stagger")) {
            const children = el.querySelectorAll("[data-scroll-child]");
            children.forEach((child, i) => {
              setTimeout(() => {
                (child as HTMLElement).classList.add("scroll-visible");
              }, i * staggerMs);
            });
            observer.unobserve(el);
            return;
          }

          // Handle individual elements
          const delay = parseInt(el.dataset.scrollDelay || "0", 10);
          setTimeout(() => {
            el.classList.add("scroll-visible");
          }, delay);

          observer.unobserve(el);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    // Observe all scroll-animated elements
    const observe = () => {
      document.querySelectorAll("[data-scroll]:not(.scroll-visible)").forEach((el) => {
        observer.observe(el);
      });
      document.querySelectorAll("[data-scroll-stagger]").forEach((el) => {
        observer.observe(el);
      });
    };

    // Initial observation
    observe();

    // Re-observe on DOM changes (React re-renders, route changes)
    const mutation = new MutationObserver(() => {
      requestAnimationFrame(observe);
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
