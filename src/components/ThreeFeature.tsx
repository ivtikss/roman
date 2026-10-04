"use client";

import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./ThreeFeature.module.css";

const AssemblyScene = dynamic(() => import("./AssemblyScene"), {
  ssr: false,
  loading: () => <div className={styles.loading}>Загрузка линии…</div>,
});

type Mode = "feed" | "forming";

const descriptions: Record<Mode, string> = {
  feed: "Карамельная масса и мягкая начинка поступают к общему соплу по разным трактам.",
  forming: "Жгут проходит между парными колесами; отдельные изделия движутся к зоне сбора.",
};

export function ThreeFeature() {
  const [mode, setMode] = useState<Mode>("feed");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manualMotion, setManualMotion] = useState<boolean | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const motionEnabled = manualMotion ?? !reducedMotion;
  const running = visible && pageVisible && motionEnabled;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => {
        setReady(true);
        setVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setReady(true);
      },
      { threshold: 0.05 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <section className={styles.section} id="scene" aria-labelledby="scene-title">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>Линия в движении</p>
            <h2 id="scene-title">Один непрерывный цикл</h2>
          </div>
          <p>
            От раздельной подачи двух компонентов до жгута с мягким центром,
            формования и отвода готовых изделий.
          </p>
        </div>
      </div>
      <div className={styles.stage} ref={stageRef} data-running={running}>
        {ready ? <AssemblyScene active={mode} running={running} /> : <div className={styles.loading}>Загрузка линии…</div>}
      </div>
      <div className={styles.inner}>
        <div className={styles.controls}>
          <div className={styles.segmented} role="group" aria-label="Выделить узел схемы">
            <button
              type="button"
              aria-pressed={mode === "feed"}
              className={mode === "feed" ? styles.selected : ""}
              onClick={() => setMode("feed")}
            >
              Подача
            </button>
            <button
              type="button"
              aria-pressed={mode === "forming"}
              className={mode === "forming" ? styles.selected : ""}
              onClick={() => setMode("forming")}
            >
              Формование
            </button>
          </div>
          <p aria-live="polite">{descriptions[mode]}</p>
          <button
            className={styles.motionButton}
            type="button"
            title={motionEnabled ? "Остановить анимацию" : "Запустить анимацию"}
            aria-label={motionEnabled ? "Остановить анимацию" : "Запустить анимацию"}
            aria-pressed={motionEnabled}
            onClick={() => setManualMotion(!motionEnabled)}
          >
            {motionEnabled ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
}
