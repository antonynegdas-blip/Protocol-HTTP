import * as THREE from 'three';
import { createTag3D, setObjectVisible, updateTag3D } from '../labelHelper.js';

export class ClientModel {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.position.set(-10.5, 0, 0);
    // Leve rotação voltada para o centro da cena
    this.group.rotation.y = Math.PI * 0.36;
    scene.add(this.group);

    this.pageActive = false;
    this.cacheHitGlow = 0;

    this.buildPedestal();
    this.buildLaptop();
    this.buildHoloWebpage();
    this.buildSessionChip();
    this.buildCacheVault(scene);

    this.mainLabel = createTag3D('CLIENTE (Navegador)', 'User-Agent • Inicia Requests', '#22d3ee');
    this.mainLabel.position.set(0, 4.9, 0);
    this.group.add(this.mainLabel);
  }

  buildPedestal() {
    const baseGeo = new THREE.CylinderGeometry(3.3, 3.7, 0.45, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.75,
      roughness: 0.28
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.95;
    this.group.add(base);

    const ringGeo = new THREE.TorusGeometry(3.45, 0.06, 12, 6);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#22d3ee',
      emissive: '#22d3ee',
      emissiveIntensity: 1.4
    });
    this.pedestalRing = new THREE.Mesh(ringGeo, ringMat);
    this.pedestalRing.position.y = -0.72;
    this.group.add(this.pedestalRing);
  }

  buildLaptop() {
    this.laptopGroup = new THREE.Group();
    this.laptopGroup.position.y = -0.68;
    this.group.add(this.laptopGroup);

    const chassisMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      metalness: 0.82,
      roughness: 0.24
    });

    // Base do notebook
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.5), chassisMat);
    deck.position.set(0, 0.08, 0.2);
    this.laptopGroup.add(deck);

    // Teclado retroiluminado em fileiras 3D
    const keyMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      emissive: '#0891b2',
      emissiveIntensity: 0.45,
      roughness: 0.4
    });
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 9; c++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.05, 0.24), keyMat);
        key.position.set(-1.28 + c * 0.32, 0.18, -0.45 + r * 0.3);
        this.laptopGroup.add(key);
      }
    }

    // Trackpad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.02, 0.58),
      new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.5, roughness: 0.2 })
    );
    pad.position.set(0, 0.17, 0.98);
    this.laptopGroup.add(pad);

    // Tampa / Tela articulada
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.16, -1.02);
    lidPivot.rotation.x = -0.24;
    this.laptopGroup.add(lidPivot);

    const lidBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.35, 0.11), chassisMat);
    lidBack.position.set(0, 1.18, 0);
    lidPivot.add(lidBack);

    this.screenMat = new THREE.MeshStandardMaterial({
      color: '#08142c',
      emissive: '#0ea5e9',
      emissiveIntensity: 0.32,
      roughness: 0.18
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.32, 2.08), this.screenMat);
    screen.position.set(0, 1.18, 0.065);
    lidPivot.add(screen);

    this.lidPivot = lidPivot;
  }

  buildHoloWebpage() {
    // Janela holográfica 3D renderizada na frente da tela quando chega 200 OK ou 304 Cache
    this.holoPage = new THREE.Group();
    this.holoPage.position.set(0, 1.35, 0.55);
    this.lidPivot.add(this.holoPage);

    const frameMat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      emissive: '#22d3ee',
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.32
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.82, 0.04), frameMat);
    this.holoPage.add(frame);

    // Barra de endereço 3D
    const urlBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.68, 0.2, 0.07),
      new THREE.MeshStandardMaterial({
        color: '#10b981',
        emissive: '#10b981',
        emissiveIntensity: 1.2
      })
    );
    urlBar.position.set(0, 0.68, 0.05);
    this.holoPage.add(urlBar);

    // Hero banner 3D
    const hero = new THREE.Mesh(
      new THREE.BoxGeometry(2.68, 0.52, 0.07),
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0284c7',
        emissiveIntensity: 1.1
      })
    );
    hero.position.set(0, 0.2, 0.06);
    this.holoPage.add(hero);

    // 3 Cards 3D na página renderizada
    const cardColors = ['#a855f7', '#22d3ee', '#34d399'];
    cardColors.forEach((hex, idx) => {
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.55, 0.08),
        new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: 0.95
        })
      );
      card.position.set(-0.92 + idx * 0.92, -0.45, 0.07);
      this.holoPage.add(card);
    });

    this.pageLabel = createTag3D('DOM Renderizado!', 'HTML + CSS + JSON', '#10b981');
    this.pageLabel.position.set(0, 1.25, 0.2);
    this.holoPage.add(this.pageLabel);

    setObjectVisible(this.holoPage, false);
  }

  buildSessionChip() {
    // Chip 3D Dourado representando Cookie / Token JWT para manter estado em protocolo Stateless
    this.sessionChip = new THREE.Group();
    this.sessionChip.position.set(2.3, 2.3, 1.3);
    this.group.add(this.sessionChip);

    const hexMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.9,
      metalness: 0.85,
      roughness: 0.2
    });
    const chipMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 6), hexMat);
    chipMesh.rotation.x = Math.PI / 2;
    this.sessionChip.add(chipMesh);

    const coreRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.045, 10, 24),
      new THREE.MeshStandardMaterial({
        color: '#fef08a',
        emissive: '#fde047',
        emissiveIntensity: 1.5
      })
    );
    coreRing.position.z = 0.08;
    this.sessionChip.add(coreRing);

    this.chipLabel = createTag3D('Cookie / JWT Token', 'Mantém Sessão (HTTP é Stateless)', '#f59e0b');
    this.chipLabel.position.set(0, 0.95, 0);
    this.sessionChip.add(this.chipLabel);

    setObjectVisible(this.sessionChip, false);
  }

  buildCacheVault(scene) {
    // Domo de Cache Local 3D posicionado ao lado do Cliente
    this.cacheVault = new THREE.Group();
    this.cacheVault.position.set(-6.8, -0.2, 3.0);
    scene.add(this.cacheVault);

    const podBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.55, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.25 })
    );
    podBase.position.y = -0.82;
    this.cacheVault.add(podBase);

    this.cacheDomeMat = new THREE.MeshStandardMaterial({
      color: '#22d3ee',
      emissive: '#0891b2',
      emissiveIntensity: 0.7,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.cacheDome = new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 1), this.cacheDomeMat);
    this.cacheDome.position.y = 0.35;
    this.cacheVault.add(this.cacheDome);

    this.etagCrystalMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#10b981',
      emissiveIntensity: 1.3,
      metalness: 0.3,
      roughness: 0.15
    });
    this.etagCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), this.etagCrystalMat);
    this.etagCrystal.position.y = 0.35;
    this.cacheVault.add(this.etagCrystal);

    this.cacheLabel = createTag3D('Cache Local do Browser', 'Cache-Control • ETag: "v1-a9f"', '#22d3ee');
    this.cacheLabel.position.set(0, 1.95, 0);
    this.cacheVault.add(this.cacheLabel);

    setObjectVisible(this.cacheVault, false);
  }

  setPageRendered(active, subtitle = '200 OK • HTML/JSON Recebido') {
    this.pageActive = active;
    setObjectVisible(this.holoPage, active);
    this.screenMat.emissiveIntensity = active ? 0.85 : 0.32;
    if (active) {
      updateTag3D(this.pageLabel, 'Página Renderizada!', subtitle, '#10b981');
    }
  }

  setSessionTokenVisible(visible) {
    setObjectVisible(this.sessionChip, visible);
  }

  setCacheVaultState(visible, hitHighlight = false) {
    setObjectVisible(this.cacheVault, visible);
    this.cacheHitGlow = hitHighlight ? 1 : 0;
    if (visible) {
      updateTag3D(
        this.cacheLabel,
        hitHighlight ? 'CACHE HIT! (304 Not Modified)' : 'Cache Local do Browser',
        hitHighlight ? 'Zero download de Body • ETag válido' : 'Cache-Control: max-age=3600 • ETag',
        hitHighlight ? '#10b981' : '#22d3ee'
      );
      this.cacheDomeMat.color.set(hitHighlight ? '#10b981' : '#22d3ee');
      this.cacheDomeMat.emissive.set(hitHighlight ? '#10b981' : '#0891b2');
    }
  }

  resetState() {
    this.setPageRendered(false);
    this.setSessionTokenVisible(false);
    this.setCacheVaultState(false, false);
    updateTag3D(this.mainLabel, 'CLIENTE (Navegador)', 'User-Agent • Inicia Requests', '#22d3ee');
  }

  update(dt, elapsed) {
    if (this.sessionChip.visible) {
      this.sessionChip.rotation.y = elapsed * 1.4;
      this.sessionChip.position.y = 2.3 + Math.sin(elapsed * 2.5) * 0.14;
    }

    if (this.holoPage.visible) {
      this.holoPage.position.z = 0.52 + Math.sin(elapsed * 3) * 0.04;
    }

    if (this.cacheVault.visible) {
      this.cacheDome.rotation.y = elapsed * 0.7;
      this.etagCrystal.rotation.y = -elapsed * 1.5;
      this.etagCrystal.position.y = 0.35 + Math.sin(elapsed * 3.2) * 0.1;
      const scale = 1 + this.cacheHitGlow * 0.22 * Math.sin(elapsed * 7);
      this.etagCrystal.scale.setScalar(scale);
    }
  }
}
