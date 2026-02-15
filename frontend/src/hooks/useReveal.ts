import { useCallback, useRef } from "react";

const reducedMotion =
  globalThis.window !== undefined &&
  globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-reveal hook using IntersectionObserver + **callback ref**.
 * Works with conditionally rendered elements (loading → content).
 * The callback ref fires when the DOM node mounts/unmounts,
 * so the observer attaches at the right time.
 *
 * Usage: <div ref={useReveal()} className="reveal-up">...</div>
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px"
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      if (reducedMotion) {
        node.classList.add("revealed");
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.classList.add("revealed");
            observerRef.current?.unobserve(node);
          }
        },
        { threshold, rootMargin }
      );
      observerRef.current.observe(node);
    },
    [threshold, rootMargin]
  );
}

function revealWithStagger(el: Element, index: number, staggerMs: number) {
  setTimeout(() => el.classList.add("revealed"), index * staggerMs);
}

/**
 * Staggered reveal for a container's `.reveal-item` children.
 * Uses callback ref — works with conditional rendering.
 */
export function useRevealChildren<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.1,
  staggerMs = 80
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      if (reducedMotion) {
        node.querySelectorAll(".reveal-item").forEach((el) =>
          el.classList.add("revealed")
        );
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const items = node.querySelectorAll(".reveal-item");
            items.forEach((el, i) => revealWithStagger(el, i, staggerMs));
            observerRef.current?.unobserve(node);
          }
        },
        { threshold }
      );
      observerRef.current.observe(node);
    },
    [threshold, staggerMs]
  );
}
