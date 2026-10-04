"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "./SiteHeader.module.css";

const links = [
  ["#approach", "Технология"],
  ["#construction", "Устройство"],
  ["#scene", "Линия в движении"],
  ["#process", "Цикл"],
  ["#materials", "Детали"],
  ["#control", "Управление"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handlePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("pointerdown", handlePointer);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handlePointer);
    };
  }, [open]);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand} onClick={() => setOpen(false)}>
          <span>Карамельная</span>
          <span>линия</span>
        </a>
        <nav className={styles.desktopNav} aria-label="Основная навигация">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <button
          ref={triggerRef}
          type="button"
          className={styles.menuButton}
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={23} strokeWidth={1.75} /> : <Menu size={23} strokeWidth={1.75} />}
        </button>
      </div>
      <nav
        id="mobile-menu"
        className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ""}`}
        aria-label="Мобильная навигация"
        inert={!open}
      >
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
