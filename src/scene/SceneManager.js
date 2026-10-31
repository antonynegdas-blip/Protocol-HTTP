import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.updateCallbacks = [];
    this.moveKeys = new Set();
    this.movementSpeed = 8;

    // Transição suave de câmera entre passos
    this.camAnim = {
      active: false,
      progress: 0,
      duration: 1.05,
      startPos: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      endTarget: new THREE.Vector3()
    };

    this.initScene();
    this.initCamera();
    this.initRenderers();
    this.initControls();
    this.initLighting();
    this.initEnvironment();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.clearMoveKeys = this.clearMoveKeys.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.clearMoveKeys);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#040712');
    this.scene.fog = new THREE.FogExp2('#040712', 0.015);
  }

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 200);
    this.camera.position.set(0, 8.2, 23.5);
  }

  initRenderers() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.className = 'label-layer';
    this.labelRenderer.domElement.style.position = 'fixed';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.container.appendChild(this.labelRenderer.domElement);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 46;
    this.controls.target.set(0, 1.8, 0);

    // Se o usuário interagir manualmente com o mouse, cancela o voo automático atual
    this.controls.addEventListener('start', () => {
      this.camAnim.active = false;
    });
  }

  onKeyDown(event) {
    if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;

    const key = event.key.toLowerCase();
    if (!['w', 'a', 's', 'd'].includes(key)) return;

    event.preventDefault();
    this.moveKeys.add(key);
    this.camAnim.active = false;
  }

  onKeyUp(event) {
    this.moveKeys.delete(event.key.toLowerCase());
  }

  clearMoveKeys() {
    this.moveKeys.clear();
  }

  updateMovement(dt) {
    if (this.moveKeys.size === 0) return;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() === 0) return;
    forward.normalize();

    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const direction = new THREE.Vector3();
    if (this.moveKeys.has('w')) direction.add(forward);
    if (this.moveKeys.has('s')) direction.sub(forward);
    if (this.moveKeys.has('d')) direction.add(right);
    if (this.moveKeys.has('a')) direction.sub(right);
    if (direction.lengthSq() === 0) return;

    direction.normalize().multiplyScalar(this.movementSpeed * dt);

    this.camera.position.add(direction);
    this.controls.target.add(direction);
  }

  initLighting() {
    const ambient = new THREE.AmbientLight('#94a3b8', 0.85);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight('#38bdf8', '#090d1e', 0.9);
    this.scene.add(hemi);

    const dirMain = new THREE.DirectionalLight('#f8fafc', 1.7);
    dirMain.position.set(8, 18, 14);
    this.scene.add(dirMain);

    const cyanRim = new THREE.PointLight('#22d3ee', 22, 36, 1.5);
    cyanRim.position.set(-12, 7, 5);
    this.scene.add(cyanRim);

    const violetRim = new THREE.PointLight('#a855f7', 20, 36, 1.5);
    violetRim.position.set(12, 7, 5);
    this.scene.add(violetRim);

    this.alertLight = new THREE.PointLight('#ef4444', 0, 32, 1.4);
    this.alertLight.position.set(0, 8, 2);
    this.scene.add(this.alertLight);
  }

  initEnvironment() {
    // Piso tecnológico ciber-grade
    const gridPrimary = new THREE.GridHelper(68, 68, '#0ea5e9', '#0f1d3a');
    gridPrimary.position.y = -1.2;
    gridPrimary.material.transparent = true;
    gridPrimary.material.opacity = 0.38;
    this.scene.add(gridPrimary);

    // Disco escuro refletivo sob o palco principal
    const floorGeo = new THREE.CircleGeometry(34, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#050a19',
      roughness: 0.35,
      metalness: 0.65
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.22;
    this.scene.add(floor);

    // Poeira digital / estrelas de fundo em 3D
    const starCount = 420;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const palette = [
      new THREE.Color('#22d3ee'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#34d399'),
      new THREE.Color('#e2e8f0')
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 20 + Math.random() * 42;
      const theta = Math.random() * Math.PI * 2;
      const y = -1 + Math.random() * 24;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.68
    });

    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  flyTo(posArray, targetArray, duration = 1.05) {
    this.camAnim.startPos.copy(this.camera.position);
    this.camAnim.endPos.set(posArray[0], posArray[1], posArray[2]);
    this.camAnim.startTarget.copy(this.controls.target);
    this.camAnim.endTarget.set(targetArray[0], targetArray[1], targetArray[2]);
    this.camAnim.duration = duration;
    this.camAnim.progress = 0;
    this.camAnim.active = true;
  }

  setLabelsVisible(visible) {
    this.labelRenderer.domElement.classList.toggle('labels-hidden', !visible);
  }

  onUpdate(fn) {
    this.updateCallbacks.push(fn);
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    if (this.camAnim.active) {
      this.camAnim.progress += dt / this.camAnim.duration;
      const t = Math.min(this.camAnim.progress, 1);
      // Cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.camAnim.startPos, this.camAnim.endPos, ease);
      this.controls.target.lerpVectors(this.camAnim.startTarget, this.camAnim.endTarget, ease);

      if (t >= 1) {
        this.camAnim.active = false;
      }
    }

    this.updateMovement(dt);

    if (this.starField) {
      this.starField.rotation.y = elapsed * 0.015;
    }

    for (const cb of this.updateCallbacks) {
      cb(dt, elapsed);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
