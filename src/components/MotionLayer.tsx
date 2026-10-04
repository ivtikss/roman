"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function MotionLayer() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
    });

    const updateScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", updateScroll);
    gsap.ticker.add(tick);

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-entrance]",
        { opacity: 0.65, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "all",
        },
      );

      gsap.fromTo(
        "[data-feature-reveal]",
        { opacity: 0.7, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: "[data-feature-reveal]",
            start: "top 86%",
            once: true,
          },
        },
      );
    });

    return () => {
      context.revert();
      gsap.ticker.remove(tick);
      lenis.off("scroll", updateScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
