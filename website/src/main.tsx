import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Mobile-like Drag to Scroll Helper for Desktop ---
const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNative;
const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

if (typeof window !== 'undefined' && !isNative && !isTouchDevice) {
  let isDown = false;
  let startY: number;
  let scrollTop: number;
  let activeTarget: HTMLElement | null = null;

  window.addEventListener('mousedown', (e) => {
    const target = (e.target as HTMLElement).closest('.overflow-y-auto');
    if (!target) return;
    isDown = true;
    activeTarget = target as HTMLElement;
    activeTarget.style.cursor = 'grabbing';
    activeTarget.style.userSelect = 'none';
    startY = e.pageY - activeTarget.offsetTop;
    scrollTop = activeTarget.scrollTop;
  });

  window.addEventListener('mouseleave', () => {
    isDown = false;
    if (activeTarget) {
      activeTarget.style.cursor = '';
      activeTarget.style.userSelect = '';
    }
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    if (activeTarget) {
      activeTarget.style.cursor = '';
      activeTarget.style.userSelect = '';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown || !activeTarget) return;
    e.preventDefault();
    const y = e.pageY - activeTarget.offsetTop;
    const walk = (y - startY) * 1.5; // multiplier for scroll speed
    activeTarget.scrollTop = scrollTop - walk;
  });
}

createRoot(document.getElementById("root")!).render(<App />);
  