export default class SceneClimax {
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
    this.fireworks = [];

    this.init();
  }

  init() {
    this.scene.fog = new THREE.Fog(0xffc3dd, 35, 180);

    const ambientLight = new THREE.AmbientLight(0xffe8f4, 0.75);
    this.scene.add(ambientLight);
    const pinkLight = new THREE.PointLight(0xff6f9a, 1.5, 150);
    pinkLight.position.set(0, 20, 20);
    this.scene.add(pinkLight);
  }

  createFirework() {
    // Simple firework implementation using points
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const origin = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
    );

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = Math.random() * 0.5;

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff4d6d,
      size: 0.5,
      transparent: true,
    });
    const points = new THREE.Points(geometry, material);

    this.fireworks.push({ points, velocities, life: 1.0 });
    this.scene.add(points);
  }

  update() {
    if (!this.isActive) return;

    if (Math.random() < 0.05) this.createFirework();

    for (let j = this.fireworks.length - 1; j >= 0; j--) {
      const fw = this.fireworks[j];
      const positions = fw.points.geometry.attributes.position.array;
      fw.life -= 0.01;

      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += fw.velocities[i * 3];
        positions[i * 3 + 1] += fw.velocities[i * 3 + 1];
        positions[i * 3 + 2] += fw.velocities[i * 3 + 2];
      }
      fw.points.geometry.attributes.position.needsUpdate = true;
      fw.points.material.opacity = fw.life;

      if (fw.life <= 0) {
        this.scene.remove(fw.points);
        this.fireworks.splice(j, 1);
      }
    }
  }

  activate() {
    this.isActive = true;
    document.getElementById("scene-climax").classList.add("active");
    gsap.to("#scene-climax", { opacity: 1, duration: 1 });

    // Show names with delay
    gsap.from("#final-message", {
      scale: 0,
      opacity: 0,
      duration: 2,
      ease: "elastic.out(1, 0.3)",
    });
    gsap.from("#couple-names", { y: 20, opacity: 0, duration: 1, delay: 1 });
  }

  deactivate() {
    this.isActive = false;
    gsap.to("#scene-climax", {
      opacity: 0,
      duration: 2,
      onComplete: () => {
        document.getElementById("scene-climax").classList.remove("active");
      },
    });
  }
}
