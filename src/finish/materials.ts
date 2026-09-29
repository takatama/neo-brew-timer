import * as THREE from "three";

/** Deterministic pseudo-random numbers, so every render of the cup matches. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement("canvas");
  element.width = size;
  element.height = size;
  const context = element.getContext("2d");
  if (!context) throw new Error("2D canvas unavailable");
  return [element, context];
}

function texture(element: HTMLCanvasElement): THREE.CanvasTexture {
  const map = new THREE.CanvasTexture(element);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

/** The same surface, drawn flat: coffee, a crema ring and a few bubbles. */
export function flatCremaTexture(coffee: string, crema: string, deep: string): THREE.CanvasTexture {
  const size = 1024;
  const [element, ctx] = canvas(size);
  const c = size / 2;
  const disc = (r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
  };
  disc(c, crema);
  disc(c * 0.9, coffee);
  disc(c * 0.62, deep);
  const rand = random(11);
  ctx.fillStyle = crema;
  for (let i = 0; i < 26; i += 1) {
    const angle = rand() * Math.PI * 2;
    const radius = c * (0.8 + rand() * 0.08);
    ctx.beginPath();
    ctx.arc(c + Math.cos(angle) * radius, c + Math.sin(angle) * radius, 5 + rand() * 9, 0, Math.PI * 2);
    ctx.fill();
  }
  return texture(element);
}

/** A soft round shadow that anchors the saucer to the table. */
export function contactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const [element, ctx] = canvas(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, "rgba(0,0,0,0.9)");
  g.addColorStop(0.55, "rgba(0,0,0,0.5)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const map = new THREE.CanvasTexture(element);
  return map;
}

/** Three tones of light for the illustrated look. */
export function toonRamp(): THREE.DataTexture {
  const data = new Uint8Array([192, 228, 255]);
  const ramp = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.generateMipmaps = false;
  ramp.needsUpdate = true;
  return ramp;
}

/**
 * Illustrated steam: a tapering S-shaped ribbon in one flat colour, drawn in
 * segments that drift upward, like the classic hand-drawn wisp.
 */
export function ribbonSteamMaterial(color: THREE.Color, opacity: number, seed: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: color },
      uOpacity: { value: opacity },
      uSeed: { value: seed },
      uReveal: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uSeed;
      uniform float uReveal;
      varying vec2 vUv;
      void main() {
        float y = vUv.y;
        float t = uTime * 0.55 + uSeed;
        float center = 0.5 + sin(y * 7.0 - t * 1.4 + uSeed) * 0.13 * (0.35 + y);
        float half_width = 0.075 * (1.0 - 0.55 * y);
        float d = abs(vUv.x - center);
        float band = 1.0 - smoothstep(half_width - 0.012, half_width, d);
        // Segments rise along the ribbon, each fading in and out.
        float phase = fract(y * 1.25 - uTime * 0.18 + uSeed * 0.37);
        float segment = smoothstep(0.0, 0.18, phase) * (1.0 - smoothstep(0.62, 0.8, phase));
        float fade = smoothstep(0.02, 0.14, y) * (1.0 - smoothstep(0.62, 0.95, y));
        float a = band * segment * fade * uOpacity * uReveal;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Inverted-hull outline, for the illustrated look: back faces pushed out along normals. */
export function outlineMaterial(color: THREE.Color, thickness: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uColor: { value: color }, uThickness: { value: thickness } },
    vertexShader: /* glsl */ `
      uniform float uThickness;
      void main() {
        vec3 p = position + normal * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}
