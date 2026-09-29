import * as THREE from "three";
import { COFFEE_Y, SAUCER_RADIUS, SAUCER_TOP, buildCupGeometry } from "./model";
import { contactShadowTexture, flatCremaTexture, outlineMaterial, ribbonSteamMaterial, toonRamp } from "./materials";

/**
 * The finished cup in real 3D, drawn like the rest of the app: three tones of
 * light, a fine ink outline and flat colours from the page's palette.
 *
 * The camera starts straight above the coffee, framed so the surface is
 * exactly the size and place of the dial face the brewer has been watching
 * fill. It then pulls back and swings down to a three-quarter view; the cup,
 * handle and saucer come into view around it and steam rises.
 */
export interface CupPalette {
  dark: boolean;
  porcelain: string;
  ink: string;
  coffee: string;
  coffeeDeep: string;
  crema: string;
}

export function readPalette(): CupPalette {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    dark: window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
    porcelain: get("--cup", "#f7f1e8"),
    ink: get("--cup-ink", "#6a5040"),
    coffee: get("--coffee", "#6f4329"),
    coffeeDeep: get("--coffee-deep", "#4a2a19"),
    crema: get("--crema", "#d9a36e"),
  };
}

const FOV = 30;
const DIAL_FACE = 131 / 160; // the dial face's radius as a share of its box
const AZIMUTH = THREE.MathUtils.degToRad(24);
const END_ELEVATION = THREE.MathUtils.degToRad(23);
const END_DISTANCE = 7.0;
const END_TARGET_Y = 0.84;
const MOVE_MS = 1900;
const HOLD_MS = 220;
/** After the move only the steam changes; this many frames a second is plenty. */
const IDLE_FPS = 30;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class CupScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  private disposables: { dispose(): void }[] = [];
  private steam: { mesh: THREE.Mesh; material: THREE.ShaderMaterial }[] = [];
  private frame = 0;
  private startedAt = 0;
  private lastRender = 0;
  private coffeeY = SAUCER_TOP + COFFEE_Y;
  private topDistance: number;
  private instant = false;

  constructor(canvas: HTMLCanvasElement, palette: CupPalette) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
      // Development only: lets tooling capture the canvas.
      preserveDrawingBuffer: import.meta.env.DEV,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(0x000000, 0);

    const geometry = buildCupGeometry();
    this.topDistance = geometry.coffeeRadius / (DIAL_FACE * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    this.build(geometry, palette);
    this.pose(0);
  }

  private track<T extends { dispose(): void }>(item: T): T {
    this.disposables.push(item);
    return item;
  }

  private build(geometry: ReturnType<typeof buildCupGeometry>, palette: CupPalette) {
    const { scene } = this;
    Object.values(geometry).forEach((g) => {
      if (g instanceof THREE.BufferGeometry) this.track(g);
    });
    const color = (hex: string) => new THREE.Color(hex);

    const ramp = this.track(toonRamp());
    const porcelain = this.track(new THREE.MeshToonMaterial({
      color: color(palette.porcelain),
      gradientMap: ramp,
      emissive: color(palette.dark ? "#1a120c" : "#2a1a10"),
      emissiveIntensity: 0.12,
    }));
    const coffee = this.track(new THREE.MeshToonMaterial({
      map: this.track(flatCremaTexture(
        palette.coffee,
        palette.crema,
        // A gentle step toward the centre, not a bullseye.
        new THREE.Color(palette.coffee).lerp(new THREE.Color(palette.coffeeDeep), 0.5).getStyle(),
      )),
      gradientMap: ramp,
    }));

    const rig = new THREE.Group();
    scene.add(rig);

    const saucer = new THREE.Mesh(geometry.saucer, porcelain);
    const cup = new THREE.Mesh(geometry.cup, porcelain);
    const handle = new THREE.Mesh(geometry.handle, porcelain);
    const surface = new THREE.Mesh(geometry.coffee, coffee);
    cup.position.y = SAUCER_TOP;
    handle.position.y = SAUCER_TOP;
    surface.position.y = this.coffeeY;
    [saucer, cup, handle].forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    surface.receiveShadow = true;
    rig.add(saucer, cup, handle, surface);

    // A fine ink line around the porcelain.
    const ink = this.track(outlineMaterial(color(palette.ink), 0.014));
    [saucer, cup, handle].forEach((mesh) => {
      const line = new THREE.Mesh(mesh.geometry, ink);
      line.position.copy(mesh.position);
      rig.add(line);
    });

    // A graphic highlight on the coffee, where the window would reflect.
    const glossGeometry = this.track(new THREE.CircleGeometry(1, 48));
    glossGeometry.rotateX(-Math.PI / 2);
    const gloss = new THREE.Mesh(glossGeometry, this.track(new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })));
    gloss.scale.set(0.26, 1, 0.08);
    gloss.rotation.y = 0.5;
    gloss.position.set(-0.34, this.coffeeY + 0.002, -0.3);
    rig.add(gloss);

    // The table is the page itself: only shadows are drawn on it.
    const groundGeometry = this.track(new THREE.PlaneGeometry(14, 14));
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, this.track(new THREE.ShadowMaterial({
      opacity: palette.dark ? 0.55 : 0.14,
      color: palette.dark ? 0x000000 : 0x3a2418,
    })));
    ground.receiveShadow = true;
    scene.add(ground);

    const contactGeometry = this.track(new THREE.PlaneGeometry(SAUCER_RADIUS * 2.5, SAUCER_RADIUS * 2.5));
    contactGeometry.rotateX(-Math.PI / 2);
    const contact = new THREE.Mesh(contactGeometry, this.track(new THREE.MeshBasicMaterial({
      map: this.track(contactShadowTexture()),
      color: palette.dark ? 0x000000 : 0x3a2418,
      transparent: true,
      opacity: palette.dark ? 0.7 : 0.32,
      depthWrite: false,
    })));
    contact.position.y = 0.002;
    scene.add(contact);

    // Mostly ambient light, so shadows are a light warm tint rather than grey.
    const key = new THREE.DirectionalLight(0xfff1de, 1.25);
    key.position.set(-3, 10, 2.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    scene.add(new THREE.AmbientLight(0xffe9d2, palette.dark ? 1.6 : 1.9));

    // Steam: upright cards above the coffee that turn to face the camera.
    // White steam vanishes on cream paper, so in light mode it is a warm grey.
    const steamColor = color(palette.dark ? "#f3e9dc" : "#c4b2a2");
    const cardGeometry = this.track(new THREE.PlaneGeometry(1.2, 1.9));
    cardGeometry.translate(0, 0.95, 0);
    [
      { x: -0.14, seed: 2.1, opacity: palette.dark ? 0.85 : 0.9 },
      { x: 0.24, seed: 5.9, opacity: palette.dark ? 0.7 : 0.75 },
    ].forEach((card) => {
      const material = this.track(ribbonSteamMaterial(steamColor, card.opacity, card.seed));
      const mesh = new THREE.Mesh(cardGeometry, material);
      mesh.position.set(card.x, this.coffeeY + 0.02, 0);
      mesh.renderOrder = 10;
      scene.add(mesh);
      this.steam.push({ mesh, material });
    });
  }

  /** Place the camera at `t` (0 = above the coffee, 1 = three-quarter view). */
  private pose(t: number) {
    const e = easeInOut(Math.min(1, Math.max(0, t)));
    const elevation = THREE.MathUtils.lerp(THREE.MathUtils.degToRad(89.9), END_ELEVATION, e);
    const distance = THREE.MathUtils.lerp(this.topDistance, END_DISTANCE, e);
    const target = new THREE.Vector3(0, THREE.MathUtils.lerp(this.coffeeY, END_TARGET_Y, e), 0);
    this.camera.position.set(
      target.x + distance * Math.cos(elevation) * Math.sin(AZIMUTH),
      target.y + distance * Math.sin(elevation),
      target.z + distance * Math.cos(elevation) * Math.cos(AZIMUTH),
    );
    this.camera.lookAt(target);
    // Steam is edge-on from above and appears once the camera has tilted.
    this.steam.forEach(({ mesh, material }) => {
      mesh.lookAt(this.camera.position.x, mesh.position.y, this.camera.position.z);
      material.uniforms.uReveal.value = Math.min(1, Math.max(0, (t - 0.62) / 0.34));
    });
  }

  setSize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render(performance.now());
  }

  /** Start (or restart) the move. With `instant`, show the end state at once. */
  play(instant = false) {
    this.instant = instant;
    this.startedAt = performance.now();
    this.loop();
  }

  private loop() {
    cancelAnimationFrame(this.frame);
    const tick = (now: number) => {
      const moving = !this.instant && now - this.startedAt < HOLD_MS + MOVE_MS;
      if (moving || now - this.lastRender > 1000 / IDLE_FPS) this.render(now);
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private render(now: number) {
    this.lastRender = now;
    const t = this.instant ? 1 : (now - this.startedAt - HOLD_MS) / MOVE_MS;
    this.pose(t);
    this.steam.forEach(({ material }) => {
      material.uniforms.uTime.value = now / 1000;
    });
    this.renderer.render(this.scene, this.camera);
  }

  pause() {
    cancelAnimationFrame(this.frame);
  }

  resume() {
    this.loop();
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.disposables.forEach((item) => item.dispose());
    this.renderer.dispose();
  }
}
