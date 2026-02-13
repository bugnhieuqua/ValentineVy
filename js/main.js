import SceneOpening from "./sceneOpening.js";
import SceneMoments from "./sceneMoments.js";
import SceneWishes from "./sceneWishes.js";
import SceneClimax from "./sceneClimax.js";

class Experience {
  constructor() {
    this.container = document.getElementById("experience-container");
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x050510, 1);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.composer = null;
    this.currentScene = null;

    // Initialize all scenes
    this.scenes = {
      opening: new SceneOpening(this.container, this.renderer, null),
      moments: new SceneMoments(this.container, this.renderer, null),
      wishes: new SceneWishes(this.container, this.renderer, null),
      climax: new SceneClimax(this.container, this.renderer, null),
    };

    this.initPostProcessing();
    this.init();
    this.events();
    this.animate();
  }

  initPostProcessing() {
    const renderScene = new THREE.RenderPass(
      this.scenes.opening.scene,
      this.scenes.opening.camera,
    );

    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85, // threshold
    );

    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
  }

  updateComposer(scene, camera) {
    this.composer.passes[0].scene = scene;
    this.composer.passes[0].camera = camera;
  }

  init() {
    this.currentScene = this.scenes.opening;
    this.currentScene.activate();
    this.updateComposer(this.currentScene.scene, this.currentScene.camera);
  }

  events() {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.renderer.setSize(width, height);
      this.composer.setSize(width, height);
      Object.values(this.scenes).forEach((s) => {
        if (s.camera) {
          s.camera.aspect = width / height;
          s.camera.updateProjectionMatrix();
        }
      });
    });

    // Scene Logic Events
    document
      .getElementById("start-btn")
      .addEventListener("click", () => this.transitionToMoments());
    document.addEventListener("wishesFinished", () =>
      this.transitionToClimax(),
    );

    // Mouse Parallax for Moments
    document.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      if (this.currentScene === this.scenes.moments) {
        gsap.to(this.currentScene.camera.position, {
          x: x * 20,
          y: -y * 20,
          duration: 1,
        });
      }

      // Glow Cursor
      const cursor = document.querySelector(".custom-cursor");
      if (cursor) {
        gsap.to(cursor, {
          x: e.clientX - 10,
          y: e.clientY - 10,
          duration: 0.1,
        });
      }
    });
  }

  transitionToMoments() {
    const bgMusic = document.getElementById("bg-music");
    bgMusic.play().catch(() => {});

    gsap.to("#scene-opening", {
      opacity: 0,
      duration: 1.5,
      onComplete: () => {
        document.getElementById("scene-opening").classList.remove("active");
        this.currentScene.deactivate();

        this.currentScene = this.scenes.moments;
        this.updateComposer(this.currentScene.scene, this.currentScene.camera);
        this.currentScene.activate();

        // Transition to Wishes after some time
        setTimeout(() => this.transitionToWishes(), 10000);
      },
    });
  }

  transitionToWishes() {
    this.currentScene.deactivate();
    this.currentScene = this.scenes.wishes;
    this.updateComposer(this.currentScene.scene, this.currentScene.camera);
    this.currentScene.activate();
  }

  transitionToClimax() {
    this.currentScene.deactivate();
    this.currentScene = this.scenes.climax;
    this.updateComposer(this.currentScene.scene, this.currentScene.camera);
    this.currentScene.activate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.currentScene) {
      this.currentScene.update();
      this.composer.render();
    }
  }
}

const cursor = document.createElement("div");
cursor.className = "custom-cursor";
document.body.appendChild(cursor);

window.addEventListener("DOMContentLoaded", () => {
  new Experience();
});
