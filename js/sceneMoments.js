import { calculateLoveDuration } from "./utils.js";

export default class SceneMoments {
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
    this.camera.position.z = 60;

    this.isActive = false;
    this.photos = [];
    this.photoTextures = [];
    this.startDate = "2026-02-14"; // Valentine's Day 2026
    this.photoSources = [
      "images/imaged.png",
      "images/imaged.png",
      "images/imaged.png",
    ];

    this.init();
  }

  init() {
    this.scene.fog = new THREE.Fog(0xffc4de, 55, 190);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffe4f0, 0.7);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff7aa2, 1.4, 130);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);

    this.loadPhotoTextures();
  }

  loadPhotoTextures() {
    const loader = new THREE.TextureLoader();
    let loaded = 0;

    const onComplete = () => {
      loaded += 1;
      if (loaded === this.photoSources.length) {
        this.createPhotoFrames();
      }
    };

    this.photoSources.forEach((src) => {
      loader.load(
        src,
        (texture) => {
          texture.encoding = THREE.sRGBEncoding;
          this.photoTextures.push(texture);
          onComplete();
        },
        undefined,
        () => {
          this.photoTextures.push(null);
          onComplete();
        },
      );
    });
  }

  createPhotoFrames() {
    const geometry = new THREE.BoxGeometry(28, 21, 1);

    for (let i = 0; i < 3; i++) {
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const texture = this.photoTextures[i];
      if (texture) {
        frameMaterial.map = texture;
      }

      const mesh = new THREE.Mesh(geometry, frameMaterial);
      mesh.position.set((i - 1) * 36, Math.sin(i) * 5, 0);
      mesh.rotation.y = (i - 1) * 0.2;
      mesh.rotation.x = (i - 1) * 0.03;
      this.photos.push(mesh);
      this.scene.add(mesh);
    }
  }

  update() {
    if (!this.isActive) return;

    // Floating effect
    this.photos.forEach((photo, i) => {
      photo.position.y += Math.sin(Date.now() * 0.001 + i) * 0.05;
      photo.rotation.y += Math.cos(Date.now() * 0.0005 + i) * 0.002;
    });

    // Update Clock UI
    this.updateClock();
  }

  updateClock() {
    const clockEl = document.getElementById("love-clock");
    if (clockEl) {
      const { days, hours, minutes, seconds } = calculateLoveDuration(
        this.startDate,
      );
      clockEl.innerHTML = `${days} Ngày ${hours} Giờ ${minutes} Phút ${seconds} Giây`;
    }
  }

  activate() {
    this.isActive = true;
    document.getElementById("scene-moments").classList.add("active");
    gsap.to("#scene-moments", { opacity: 1, duration: 1 });
  }

  deactivate() {
    this.isActive = false;
    gsap.to("#scene-moments", {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        document.getElementById("scene-moments").classList.remove("active");
      },
    });
  }
}
