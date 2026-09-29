import { useEffect, useRef, useState } from "react";
import { FinishedCup } from "../ui/FinishedCup";
import { CupScene, readPalette } from "./scene";
import styles from "./Cup3D.module.css";

/**
 * The finished cup in 3D, in the same square box as the dial. The camera move
 * plays once; a later change of light/dark theme redraws the end state. If
 * WebGL fails at any point, the SVG cup takes its place.
 */
export function Cup3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const played = useRef(false);
  const [failed, setFailed] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return;
    const update = () => setDark(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed) return;
    let scene: CupScene;
    try {
      scene = new CupScene(canvas, readPalette());
    } catch {
      setFailed(true);
      return;
    }
    const resize = () => scene.setSize(canvas.clientWidth, canvas.clientHeight);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const onVisibility = () => (document.visibilityState === "visible" ? scene.resume() : scene.pause());
    const onLost = () => setFailed(true);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    scene.play(played.current);
    played.current = true;
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      scene.dispose();
    };
  }, [dark, failed]);

  if (failed) return <FinishedCup />;
  return (
    <div className={styles.stage} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
