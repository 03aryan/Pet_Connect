import { useEffect, useRef } from "react";
import * as THREE from "three";

const PAW_COUNT = 22;
const COLORS = ["#81A6C6", "#AACDDC", "#5d8aad", "#c8e0eb", "#D2C4B4"];

function makePawTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");

  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = size * 0.22;
  const color = "#81A6C6";

  // Main pad
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.fill();

  // Toe pads
  const toes = [
    { ox: -r * 0.75, oy: -r * 1.1, rx: r * 0.38, ry: r * 0.32 },
    { ox: -r * 0.25, oy: -r * 1.4, rx: r * 0.38, ry: r * 0.32 },
    { ox:  r * 0.25, oy: -r * 1.4, rx: r * 0.38, ry: r * 0.32 },
    { ox:  r * 0.75, oy: -r * 1.1, rx: r * 0.38, ry: r * 0.32 },
  ];
  toes.forEach(({ ox, oy, rx, ry }) => {
    ctx.beginPath();
    ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  return new THREE.CanvasTexture(c);
}

export default function ThreeHero({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 5;

    // Scene
    const scene = new THREE.Scene();

    // Paw texture
    const pawTex = makePawTexture();

    // Particles
    const paws = Array.from({ length: PAW_COUNT }, (_, i) => {
      const mat = new THREE.SpriteMaterial({
        map: pawTex,
        color: new THREE.Color(COLORS[i % COLORS.length]),
        transparent: true,
        opacity: Math.random() * 0.35 + 0.1,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = Math.random() * 0.06 + 0.03;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        0,
      );
      sprite.userData = {
        speed: Math.random() * 0.0003 + 0.00015,
        drift: (Math.random() - 0.5) * 0.0001,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        baseOpacity: mat.opacity,
      };
      scene.add(sprite);
      return sprite;
    });

    // Soft gradient mesh (background plane)
    const planeGeo = new THREE.PlaneGeometry(2, 2);
    const planeMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vec3 c1 = vec3(0.506, 0.651, 0.776); // primary
          vec3 c2 = vec3(0.667, 0.804, 0.863); // secondary
          vec3 c3 = vec3(0.953, 0.902, 0.878); // beige-light
          float t = sin(vUv.y * 1.8 + uTime * 0.5) * 0.5 + 0.5;
          float t2 = cos(vUv.x * 1.2 + uTime * 0.3) * 0.5 + 0.5;
          vec3 col = mix(mix(c3, c2, t), c1, t2 * 0.35);
          float alpha = 0.22 + sin(uTime * 0.4 + vUv.x * 2.0) * 0.06;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.z = -1;
    scene.add(plane);

    // Mouse parallax
    let mx = 0, my = 0;
    const onMouseMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * -2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize
    const resize = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      renderer.setSize(w, h);
      const aspect = w / h;
      camera.left   = -aspect;
      camera.right  =  aspect;
      camera.top    =  1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Animation loop
    let rafId;
    let t = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.01;
      planeMat.uniforms.uTime.value = t;

      paws.forEach((sp) => {
        const d = sp.userData;
        sp.position.y += d.speed;
        sp.position.x += d.drift + mx * 0.0003;
        sp.material.rotation += d.rotSpeed;

        // Gentle opacity wave
        sp.material.opacity = d.baseOpacity * (0.7 + Math.sin(t * 1.5 + d.rotation) * 0.3);

        // Wrap around
        if (sp.position.y > camera.top + 0.1) {
          sp.position.y = camera.bottom - 0.05;
          sp.position.x = (Math.random() - 0.5) * (camera.right - camera.left);
        }
        if (sp.position.x > camera.right + 0.1)  sp.position.x = camera.left  - 0.05;
        if (sp.position.x < camera.left  - 0.1)  sp.position.x = camera.right + 0.05;
      });

      // Subtle camera parallax
      camera.position.x += (mx * 0.04 - camera.position.x) * 0.05;
      camera.position.y += (my * 0.04 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      pawTex.dispose();
      planeMat.dispose();
      planeGeo.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
