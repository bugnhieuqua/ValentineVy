import { createHeartShape } from "./utils.js";

export default class SceneOpening {
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

    this.particles = null;
    this.heart = null;
    this.fallingImages = [];
    this.sparkles = [];
    this.isActive = false;

    // Load the image for falling
    this.imageTexture = null;
    this.loadImage();

    this.init();
  }

  loadImage() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "images/image.png",
      (texture) => {
        this.imageTexture = texture;
        this.initFallingImages();
      },
      undefined,
      (error) => {
        console.log("Could not load image, using placeholder");
        this.initFallingImages();
      },
    );
  }

  init() {
    this.scene.fog = new THREE.Fog(0xffc1dc, 45, 170);

    // Enhanced Lights
    const ambientLight = new THREE.AmbientLight(0xffe3ef, 0.65);
    this.scene.add(ambientLight);

    // Main pink light
    const pointLight = new THREE.PointLight(0xff4d6d, 3, 150);
    pointLight.position.set(0, 0, 20);
    this.scene.add(pointLight);

    // Additional colored lights for more depth
    const roseLight = new THREE.PointLight(0xff8cab, 1.6, 120);
    roseLight.position.set(-30, 20, 10);
    this.scene.add(roseLight);

    const peachLight = new THREE.PointLight(0xffb3c7, 1.2, 120);
    peachLight.position.set(30, -20, 10);
    this.scene.add(peachLight);

    // Heart with enhanced material
    this.createHeart();

    // Enhanced Particles
    this.initParticles();

    // Sparkles
    this.initSparkles();
  }

  createHeart() {
    const heartShape = createHeartShape();
    const extrudeSettings = {
      depth: 3,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 2,
      bevelSize: 1.5,
      bevelThickness: 1.5,
    };
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    // Enhanced material with better shine and glow
    const material = new THREE.MeshPhongMaterial({
      color: 0xff2d55,
      emissive: 0x660022,
      shininess: 150,
      specular: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });

    this.heart = new THREE.Mesh(geometry, material);
    this.heart.rotation.x = Math.PI;
    this.heart.scale.set(0.8, 0.8, 0.8);
    this.scene.add(this.heart);

    // Add inner glow
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4d6d,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.set(1.1, 1.1, 1.1);
    this.heart.add(glowMesh);
  }

  initParticles() {
    // Create multiple particle systems with different colors
    const colors = [0xff4d6d, 0xff758f, 0xff9eb5, 0xffffff, 0xffc0cb];

    // Main particles - floating around
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Random color from palette
      const color = new THREE.Color(
        colors[Math.floor(Math.random() * colors.length)],
      );
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;

      velocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.15,
        z: (Math.random() - 0.5) * 0.1,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.velocities = velocities;
    this.scene.add(this.particles);

    // Add starfield background
    this.initStarfield();
  }

  initStarfield() {
    const starCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = -50 - Math.random() * 50;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  initSparkles() {
    // Create sparkle effects around the heart
    const sparkleCount = 50;
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 10;
      sparklePositions[i * 3] = Math.cos(angle) * radius;
      sparklePositions[i * 3 + 1] = Math.sin(angle) * radius;
      sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    sparkleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(sparklePositions, 3),
    );

    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xffffaa,
      size: 1.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    });

    this.sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    this.scene.add(this.sparkles);
  }

  initFallingImages() {
    if (!this.imageTexture) {
      // Create a simple colored texture if image fails to load
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ff4d6d";
      ctx.beginPath();
      ctx.arc(64, 64, 50, 0, Math.PI * 2);
      ctx.fill();
      const texture = new THREE.CanvasTexture(canvas);
      this.createFallingImages(texture);
    } else {
      this.createFallingImages(this.imageTexture);
    }
  }

  createFallingImages(texture) {
    const imageCount = 15;

    for (let i = 0; i < imageCount; i++) {
      const geometry = new THREE.PlaneGeometry(8.5, 8.5);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random starting position
      mesh.position.x = (Math.random() - 0.5) * 100;
      mesh.position.y = 60 + Math.random() * 40;
      mesh.position.z = (Math.random() - 0.5) * 40;

      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      // Store velocity and rotation speed
      mesh.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.3,
          y: -0.5 - Math.random() * 0.5,
          z: (Math.random() - 0.5) * 0.2,
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05,
        },
        swaySpeed: Math.random() * 2 + 1,
        swayAmount: Math.random() * 0.5 + 0.2,
      };

      this.fallingImages.push(mesh);
      this.scene.add(mesh);
    }
  }

  update() {
    if (!this.isActive) return;

    const time = Date.now() * 0.001;

    // Animate Heart
    this.heart.rotation.y += 0.008;
    this.heart.position.y = Math.sin(time * 2) * 2.5;
    this.heart.position.x = Math.sin(time * 1.5) * 1;

    // Animate Particles
    this.animateParticles();

    // Animate Starfield (slow rotation)
    if (this.starfield) {
      this.starfield.rotation.y += 0.0002;
    }

    // Animate Sparkles
    this.animateSparkles(time);

    // Animate Falling Images
    this.animateFallingImages(time);
  }

  animateParticles() {
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < this.particles.velocities.length; i++) {
      positions[i * 3] += this.particles.velocities[i].x;
      positions[i * 3 + 1] += this.particles.velocities[i].y;
      positions[i * 3 + 2] += this.particles.velocities[i].z;

      // Wrap around boundaries
      if (positions[i * 3] > 60) positions[i * 3] = -60;
      if (positions[i * 3] < -60) positions[i * 3] = 60;
      if (positions[i * 3 + 1] > 60) positions[i * 3 + 1] = -60;
      if (positions[i * 3 + 1] < -60) positions[i * 3 + 1] = 60;
      if (positions[i * 3 + 2] > 40) positions[i * 3 + 2] = -40;
      if (positions[i * 3 + 2] < -40) positions[i * 3 + 2] = 40;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  animateSparkles(time) {
    const positions = this.sparkles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const radius = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x);

      // Pulsing effect
      const newRadius = radius + Math.sin(time * 3 + i) * 0.1;
      positions[i * 3] = Math.cos(angle) * newRadius;
      positions[i * 3 + 1] = Math.sin(angle) * newRadius;
    }
    this.sparkles.geometry.attributes.position.needsUpdate = true;

    // Twinkle effect
    this.sparkles.material.opacity = 0.5 + Math.sin(time * 5) * 0.4;
  }

  animateFallingImages(time) {
    for (const image of this.fallingImages) {
      const userData = image.userData;

      // Update position
      image.position.x +=
        userData.velocity.x +
        Math.sin(time * userData.swaySpeed) * userData.swayAmount;
      image.position.y += userData.velocity.y;
      image.position.z += userData.velocity.z;

      // Update rotation
      image.rotation.x += userData.rotationSpeed.x;
      image.rotation.y += userData.rotationSpeed.y;

      // Reset when falls below screen
      if (image.position.y < -60) {
        image.position.y = 60 + Math.random() * 40;
        image.position.x = (Math.random() - 0.5) * 100;
        image.position.z = (Math.random() - 0.5) * 40;
      }
    }
  }

  activate() {
    this.isActive = true;

    // Enhanced heart animation with more dramatic pulsing
    gsap.to(this.heart.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });

    // Add entrance animation
    this.heart.scale.set(0, 0, 0);
    gsap.to(this.heart.scale, {
      x: 0.8,
      y: 0.8,
      z: 0.8,
      duration: 2,
      ease: "elastic.out(1, 0.5)",
    });

    // Fade in particles
    this.particles.material.opacity = 0;
    gsap.to(this.particles.material, {
      opacity: 0.8,
      duration: 2,
    });

    // Fade in sparkles
    this.sparkles.material.opacity = 0;
    gsap.to(this.sparkles.material, {
      opacity: 0.9,
      duration: 1.5,
    });
  }

  deactivate() {
    this.isActive = false;
  }
}
