import { typewriterEffect } from "./utils.js";

export default class SceneWishes {
  constructor(container, renderer, composer) {
    this.container = container;
    this.renderer = renderer;
    this.composer = composer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 50;

    this.isActive = false;
    this.particles = null;
    this.messages = [
      "Từ khi anh đến, thế giới của em bỗng dịu dàng hơn mỗi ngày. 💖",
      "Cảm ơn anh vì đã luôn ở đó, lắng nghe, thấu hiểu và yêu thương em.",
      "Em không hứa những điều xa xôi… Nhưng em hứa sẽ nắm tay anh thật chặt.",
      "Happy Valentine’s Day ❤️",
    ];

    this.init();
  }

  init() {
    this.scene.fog = new THREE.Fog(0xffc3e0, 40, 170);

    const ambientLight = new THREE.AmbientLight(0xffe7f2, 0.7);
    this.scene.add(ambientLight);
    const pinkLight = new THREE.PointLight(0xff7da7, 1.3, 140);
    pinkLight.position.set(12, 18, 16);
    this.scene.add(pinkLight);

    // Falling Flower Particles (Simplified as pink spheres/planes)
    this.initParticles();
  }

  initParticles() {
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffb7c5,
      size: 0.3,
      transparent: true,
    });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update() {
    if (!this.isActive) return;

    // Falling animation
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] -= 0.1;
      if (positions[i * 3 + 1] < -50) positions[i * 3 + 1] = 50;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  async startTypewriter() {
    const textEl = document.getElementById("typewriter-text");
    for (const msg of this.messages) {
      await typewriterEffect(textEl, msg, 50);
      await new Promise((r) => setTimeout(r, 2000));
      if (msg !== this.messages[this.messages.length - 1]) {
        textEl.innerHTML = "";
      }
    }
    // Dispatch event or callback when finished to trigger climax
    document.dispatchEvent(new CustomEvent("wishesFinished"));
  }

  activate() {
    this.isActive = true;
    document.getElementById("scene-wishes").classList.add("active");
    gsap.to("#scene-wishes", { opacity: 1, duration: 1 });
    this.startTypewriter();
  }

  deactivate() {
    this.isActive = false;
    gsap.to("#scene-wishes", {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        document.getElementById("scene-wishes").classList.remove("active");
      },
    });
  }
}
