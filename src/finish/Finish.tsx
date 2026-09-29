import { useEffect, useState, type ComponentType } from "react";
import { FinishedCup } from "../ui/FinishedCup";
import { useReducedMotion } from "../ui/hooks";

/**
 * The finish visual: the 3D cup where it can run, otherwise the SVG cup.
 *
 * The 3D cup (and three.js with it) is a separate download, fetched in the
 * background during the brew. The choice is made once, when the finish
 * appears, so the visual never swaps mid-animation: if the 3D code isn't
 * ready yet, or WebGL is missing, or motion is reduced, the SVG plays instead.
 */
type Cup3DModule = typeof import("./Cup3D");

let module3d: Cup3DModule | null = null;
let loading: Promise<unknown> | null = null;
let webgl: boolean | null = null;

export function webglAvailable(): boolean {
  if (webgl !== null) return webgl;
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
    webgl = Boolean(context);
    (context as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

/** Fetch the 3D cup ahead of time. Safe to call repeatedly. */
export function preloadFinish(): void {
  if (loading || !webglAvailable()) return;
  loading = import("./Cup3D")
    .then((loaded) => {
      module3d = loaded;
    })
    .catch(() => {
      loading = null;
    });
}

export function Finish() {
  const reducedMotion = useReducedMotion();
  const [Cup] = useState<ComponentType | null>(() => (!reducedMotion && module3d ? module3d.Cup3D : null));
  useEffect(() => {
    preloadFinish();
  }, []);
  return Cup ? <Cup /> : <FinishedCup />;
}
