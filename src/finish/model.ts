import * as THREE from "three";

/**
 * Procedural porcelain: a cappuccino cup, its handle and a saucer, built as
 * solids of revolution from hand-tuned profiles. Units: the cup's rim has a
 * radius of 1. The cup stands on the saucer, and the saucer on y = 0.
 */

export const SAUCER_TOP = 0.05;
export const COFFEE_Y = 0.66; // surface height inside the cup, from its base
export const SAUCER_RADIUS = 1.6;

type P = [number, number];

function bezier(p0: P, p1: P, p2: P, p3: P, steps: number): THREE.Vector2[] {
  const curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(...p0), new THREE.Vector2(...p1), new THREE.Vector2(...p2), new THREE.Vector2(...p3),
  );
  return curve.getPoints(steps);
}

function arc(cx: number, cy: number, r: number, from: number, to: number, steps: number): THREE.Vector2[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps;
    return new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });
}

/** Joins point runs, dropping duplicates where runs meet. */
function join(...runs: THREE.Vector2[][]): THREE.Vector2[] {
  const out: THREE.Vector2[] = [];
  runs.flat().forEach((p) => {
    const last = out[out.length - 1];
    if (!last || last.distanceTo(p) > 1e-4) out.push(p);
  });
  return out;
}

/** Outer skin up to the lip, round lip, inner skin down to the well. */
function cupProfile(): { profile: THREE.Vector2[]; inner: THREE.Vector2[] } {
  const outer = join(
    [new THREE.Vector2(0, 0), new THREE.Vector2(0.4, 0)],
    arc(0.4, 0.035, 0.035, -Math.PI / 2, 0.15, 6),
    bezier([0.436, 0.04], [0.74, 0.06], [1.0, 0.3], [1.0, 0.82], 48),
  );
  const lip = arc(0.978, 0.82, 0.022, 0, Math.PI, 10);
  const inner = bezier([0.956, 0.82], [0.956, 0.42], [0.8, 0.14], [0.42, 0.12], 48);
  const profile = join(outer, lip, inner, [new THREE.Vector2(0, 0.12)]);
  return { profile, inner };
}

/** Inner radius at a height, read off the sampled inner skin. */
function radiusAt(inner: THREE.Vector2[], y: number): number {
  for (let i = 1; i < inner.length; i += 1) {
    const a = inner[i - 1];
    const b = inner[i];
    if ((a.y - y) * (b.y - y) <= 0) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * t;
    }
  }
  return inner[0].x;
}

function saucerProfile(): THREE.Vector2[] {
  return join(
    [new THREE.Vector2(0, 0.012), new THREE.Vector2(0.5, 0.012)],
    arc(0.5, 0.025, 0.013, -Math.PI / 2, 0, 4),
    bezier([0.513, 0.025], [1.0, 0.02], [1.44, 0.06], [1.58, 0.125], 32),
    arc(1.58, 0.142, 0.017, -Math.PI / 2 + 0.4, Math.PI * 0.72, 10),
    bezier([1.567, 0.155], [1.36, 0.1], [0.96, 0.055], [0.62, SAUCER_TOP + 0.006], 32),
    [new THREE.Vector2(0.55, SAUCER_TOP), new THREE.Vector2(0, SAUCER_TOP)],
  );
}

function handleCurve(): THREE.CatmullRomCurve3 {
  // Both ends sit on the outer skin (r ≈ 0.99 at y 0.68, r ≈ 0.85 at y 0.26)
  // so the open tube ends are hidden by the wall and never reach the inside.
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.99, 0.68, 0),
    new THREE.Vector3(1.13, 0.745, 0),
    new THREE.Vector3(1.33, 0.67, 0),
    new THREE.Vector3(1.385, 0.48, 0),
    new THREE.Vector3(1.25, 0.32, 0),
    new THREE.Vector3(1.04, 0.255, 0),
    new THREE.Vector3(0.85, 0.265, 0),
  ], false, "centripetal");
}

export interface CupGeometry {
  cup: THREE.BufferGeometry;
  handle: THREE.BufferGeometry;
  saucer: THREE.BufferGeometry;
  coffee: THREE.BufferGeometry;
  coffeeRadius: number;
}

export function buildCupGeometry(): CupGeometry {
  const { profile, inner } = cupProfile();
  const cup = new THREE.LatheGeometry(profile, 160);
  const handle = new THREE.TubeGeometry(handleCurve(), 96, 0.062, 24, false);
  // Flatten the handle a little front-to-back, like a real one.
  handle.scale(1, 1, 0.78);
  const saucer = new THREE.LatheGeometry(saucerProfile(), 160);
  // Tuck the surface just into the wall so no seam shows.
  const coffeeRadius = radiusAt(inner, COFFEE_Y) + 0.004;
  const coffee = new THREE.CircleGeometry(coffeeRadius, 160);
  coffee.rotateX(-Math.PI / 2);
  return { cup, handle, saucer, coffee, coffeeRadius };
}
