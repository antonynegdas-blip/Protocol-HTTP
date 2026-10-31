import * as THREE from 'three';
import { createTag3D, setObjectVisible, updateTag3D } from '../labelHelper.js';

export class ServerModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(10.5, 0, 0);
    this.group.rotation.y = -Math.PI * 0.34;
    scene.add(this.group);

    this.bladeLeds = [];
    this.serverMode = 'normal'; // 'normal' | 'processing' | 'error5xx' | 'statelessFlash'
    this.statelessTimer = 0;

    this.buildPedestal();
    this.buildServerRack();
    this.buildDatabaseCylinder();
    this.buildResourceVault(scene);
    this.buildFirewallShield(scene);
    this.buildRedirectMirror(scene);
    this.buildExternalCorsTower(scene);

    this.mainLabel = createTag3D('SERVIDOR WEB', 'Apache / Nginx / Node • :80 e :443', '#a855f7');
    this.mainLabel.position.set(0, 5.8, 0);
    this.group.add(this.mainLabel);
  }

  buildPedestal() {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.9, 0.45, 6),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.78, roughness: 0.28 })
    );
    base.position.y = -0.95;
    this.group.add(base);

    const ringGeo = new THREE.TorusGeometry(3.65, 0.06, 12, 6);
    ringGeo.rotateX(Math.PI / 2);
    this.pedestalRingMat = new THREE.MeshStandardMaterial({
      color: '#a855f7',
      emissive: '#a855f7',
      emissiveIntensity: 1.35
    });
    const ring = new THREE.Mesh(ringGeo, this.pedestalRingMat);
    ring.position.y = -0.72;
    this.group.add(ring);
  }

  buildServerRack() {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-0.35, 1.65, 0);
    this.group.add(rackGroup);

    const frameMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.85,
      roughness: 0.25
    });

    // Gabinete principal
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.7, 4.7, 2.3), frameMat);
    rackGroup.add(cabinet);

    // Trilhos LED verticais laterais
    this.railMat = new THREE.MeshStandardMaterial({
      color: '#a855f7',
      emissive: '#a855f7',
      emissiveIntensity: 1.3
    });
    [-1.28, 1.28].forEach((xPos) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 4.45, 0.09), this.railMat);
      rail.position.set(xPos, 0, 1.16);
      rackGroup.add(rail);
    });

    // 6 Lâminas (Server Blades) frontais com LEDs
    const bladeMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.7,
      roughness: 0.35
    });

    for (let i = 0; i < 6; i++) {
      const y = -1.7 + i * 0.68;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 0.14), bladeMat);
      blade.position.set(0, y, 1.15);
      rackGroup.add(blade);

      for (let j = 0; j < 3; j++) {
        const ledMat = new THREE.MeshStandardMaterial({
          color: j === 0 ? '#10b981' : '#22d3ee',
          emissive: j === 0 ? '#10b981' : '#22d3ee',
          emissiveIntensity: 1.5
        });
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), ledMat);
        led.position.set(-0.85 + j * 0.25, y, 1.24);
        rackGroup.add(led);
        this.bladeLeds.push({ mesh: led, mat: ledMat, index: i * 3 + j });
      }
    }
  }

  buildDatabaseCylinder() {
    // Pilha 3D de discos de Banco de Dados ao lado do Rack
    const dbGroup = new THREE.Group();
    dbGroup.position.set(1.75, 0.55, -0.55);
    this.group.add(dbGroup);

    const diskMat = new THREE.MeshStandardMaterial({
      color: '#1e1b4b',
      metalness: 0.8,
      roughness: 0.22
    });
    const glowRingMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#22d3ee',
      emissiveIntensity: 1.25
    });

    for (let i = 0; i < 3; i++) {
      const y = i * 0.82;
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.58, 24), diskMat);
      disk.position.y = y;
      dbGroup.add(disk);

      const band = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.04, 10, 28), glowRingMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      dbGroup.add(band);
    }
  }

  buildResourceVault(scene) {
    // Cofre 3D de Recursos (/api/usuarios) manipulado pelos verbos GET, POST, PUT, PATCH, DELETE
    this.resourceVault = new THREE.Group();
    this.resourceVault.position.set(6.4, 1.4, 2.3);
    scene.add(this.resourceVault);

    this.resourceCubes = [];
    const baseColors = ['#22d3ee', '#38bdf8', '#10b981'];

    for (let i = 0; i < 3; i++) {
      const cubeGroup = new THREE.Group();
      cubeGroup.position.set((i - 1) * 1.35, 0, 0);

      const mat = new THREE.MeshStandardMaterial({
        color: baseColors[i],
        emissive: baseColors[i],
        emissiveIntensity: 0.7,
        metalness: 0.35,
        roughness: 0.2
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86), mat);
      cubeGroup.add(mesh);

      // Face frontal destacável para demonstrar PATCH (modificação parcial)
      const patchFaceMat = new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#f59e0b',
        emissiveIntensity: 1.5
      });
      const patchFace = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 0.9), patchFaceMat);
      patchFace.position.y = 0.28;
      patchFace.visible = false;
      cubeGroup.add(patchFace);

      this.resourceVault.add(cubeGroup);
      this.resourceCubes.push({
        group: cubeGroup,
        mesh,
        mat,
        patchFace,
        defaultColor: baseColors[i],
        alive: true
      });
    }

    this.vaultLabel = createTag3D('Recursos no Servidor (/api/usuarios)', 'Estado atual dos dados 3D', '#38bdf8');
    this.vaultLabel.position.set(0, 1.55, 0);
    this.resourceVault.add(this.vaultLabel);

    setObjectVisible(this.resourceVault, false);
  }

  buildFirewallShield(scene) {
    // Escudo 3D de bloqueio para erros 4xx (401 Unauthorized / 403 Forbidden / 404 Not Found)
    this.firewallGroup = new THREE.Group();
    this.firewallGroup.position.set(6.8, 1.4, 0);
    scene.add(this.firewallGroup);

    const shieldGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.14, 6);
    shieldGeo.rotateZ(Math.PI / 2);
    this.shieldMat = new THREE.MeshStandardMaterial({
      color: '#fb7185',
      emissive: '#e11d48',
      emissiveIntensity: 1.15,
      transparent: true,
      opacity: 0.55
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
    this.firewallGroup.add(shieldMesh);

    const rimGeo = new THREE.TorusGeometry(2.35, 0.07, 10, 6);
    rimGeo.rotateY(Math.PI / 2);
    const rim = new THREE.Mesh(
      rimGeo,
      new THREE.MeshStandardMaterial({ color: '#fda4af', emissive: '#f43f5e', emissiveIntensity: 1.6 })
    );
    this.firewallGroup.add(rim);

    this.firewallLabel = createTag3D('4xx Erro do Cliente!', '401 / 403 / 404 / 429 • Bloqueado', '#fb7185');
    this.firewallLabel.position.set(0, 2.85, 0);
    this.firewallGroup.add(this.firewallLabel);

    setObjectVisible(this.firewallGroup, false);
  }

  buildRedirectMirror(scene) {
    // Nó Espelho 3D para demonstrar 3xx Redirecionamento (301 / 302 / 307)
    this.mirrorNode = new THREE.Group();
    this.mirrorNode.position.set(6.8, 0, -5.8);
    scene.add(this.mirrorNode);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.95, 0.35, 6),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.25 })
    );
    base.position.y = -0.95;
    this.mirrorNode.add(base);

    const tower = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.25, 0),
      new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#d97706',
        emissiveIntensity: 0.95,
        metalness: 0.5,
        roughness: 0.2
      })
    );
    tower.position.y = 0.85;
    this.mirrorNode.add(tower);
    this.mirrorPrism = tower;

    this.mirrorLabel = createTag3D('Nova URL (301 / 302 Redirect)', 'Location: https://novo-destino.com', '#f59e0b');
    this.mirrorLabel.position.set(0, 2.65, 0);
    this.mirrorNode.add(this.mirrorLabel);

    setObjectVisible(this.mirrorNode, false);
  }

  buildExternalCorsTower(scene) {
    // Torre 3D de API de Outra Origem (CORS: api.externa.com)
    this.corsTower = new THREE.Group();
    this.corsTower.position.set(3.8, 0, -9.2);
    scene.add(this.corsTower);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.6, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.3 })
    );
    base.position.y = -0.95;
    this.corsTower.add(base);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.45, 4.3, 6),
      new THREE.MeshStandardMaterial({
        color: '#1e1b4b',
        emissive: '#4f46e5',
        emissiveIntensity: 0.45,
        metalness: 0.78,
        roughness: 0.22
      })
    );
    spire.position.y = 1.4;
    this.corsTower.add(spire);

    // Portal Laser SOP / CORS diante da Torre Externa
    this.corsGateGroup = new THREE.Group();
    this.corsGateGroup.position.set(-2.5, 1.2, 2.2);
    this.corsGateGroup.rotation.y = Math.PI * 0.25;
    this.corsTower.add(this.corsGateGroup);

    this.corsGateMat = new THREE.MeshStandardMaterial({
      color: '#f43f5e',
      emissive: '#e11d48',
      emissiveIntensity: 1.25,
      transparent: true,
      opacity: 0.62
    });
    this.corsGateBarrier = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.12), this.corsGateMat);
    this.corsGateGroup.add(this.corsGateBarrier);

    this.corsGateLabel = createTag3D(
      'Same-Origin Policy (SOP)',
      'Aguardando Preflight OPTIONS...',
      '#f43f5e'
    );
    this.corsGateLabel.position.set(0, 1.75, 0);
    this.corsGateGroup.add(this.corsGateLabel);

    this.corsTowerLabel = createTag3D(
      'API Externa (Outra Origem)',
      'https://api.externa.com:443',
      '#818cf8'
    );
    this.corsTowerLabel.position.set(0, 4.2, 0);
    this.corsTower.add(this.corsTowerLabel);

    setObjectVisible(this.corsTower, false);
  }

  setCorsGateAllowed(allowed) {
    if (allowed) {
      this.corsGateMat.color.set('#10b981');
      this.corsGateMat.emissive.set('#10b981');
      this.corsGateMat.opacity = 0.22;
      this.corsGateBarrier.scale.y = 0.18;
      updateTag3D(
        this.corsGateLabel,
        'CORS Liberado!',
        'Access-Control-Allow-Origin: *',
        '#10b981'
      );
    } else {
      this.corsGateMat.color.set('#f43f5e');
      this.corsGateMat.emissive.set('#e11d48');
      this.corsGateMat.opacity = 0.62;
      this.corsGateBarrier.scale.y = 1.0;
      updateTag3D(
        this.corsGateLabel,
        'Same-Origin Policy (SOP)',
        'Aguardando Preflight OPTIONS...',
        '#f43f5e'
      );
    }
  }

  resetResourceVault() {
    this.resourceCubes.forEach((c, idx) => {
      c.alive = idx < 2; // Começa com 2 cubos ativos e 1 slot pronto para POST criar!
      c.group.visible = c.alive;
      c.group.scale.setScalar(1);
      c.mat.color.set(c.defaultColor);
      c.mat.emissive.set(c.defaultColor);
      c.patchFace.visible = false;
    });
    updateTag3D(
      this.vaultLabel,
      'Recursos 3D (/api/usuarios)',
      'Clique nos verbos abaixo ou aguarde o ciclo',
      '#38bdf8'
    );
  }

  applyVerbEffect(verb) {
    switch (verb) {
      case 'GET':
      case 'HEAD':
        this.resourceCubes.forEach((c) => {
          if (c.alive) c.group.scale.setScalar(1.18);
        });
        updateTag3D(
          this.vaultLabel,
          verb === 'HEAD' ? 'HEAD: Lê só Headers (Sem Body)' : 'GET: Leitura Segura & Idempotente',
          'Não altera o estado dos cubos no servidor',
          '#22d3ee'
        );
        break;
      case 'POST':
        this.resourceCubes[2].alive = true;
        this.resourceCubes[2].group.visible = true;
        this.resourceCubes[2].group.scale.setScalar(1.28);
        this.resourceCubes[2].mat.color.set('#10b981');
        this.resourceCubes[2].mat.emissive.set('#10b981');
        updateTag3D(
          this.vaultLabel,
          'POST: Novo Recurso 3D Criado (201)',
          'Não-Idempotente • Altera estado do servidor',
          '#10b981'
        );
        break;
      case 'PUT':
        this.resourceCubes[1].alive = true;
        this.resourceCubes[1].group.visible = true;
        this.resourceCubes[1].patchFace.visible = false;
        this.resourceCubes[1].mat.color.set('#a855f7');
        this.resourceCubes[1].mat.emissive.set('#a855f7');
        this.resourceCubes[1].group.scale.setScalar(1.22);
        updateTag3D(
          this.vaultLabel,
          'PUT: Substituição Integral!',
          'Idempotente • Repetir mantém o mesmo cubo roxo',
          '#a855f7'
        );
        break;
      case 'PATCH':
        this.resourceCubes[0].alive = true;
        this.resourceCubes[0].group.visible = true;
        this.resourceCubes[0].patchFace.visible = true;
        this.resourceCubes[0].group.scale.setScalar(1.18);
        updateTag3D(
          this.vaultLabel,
          'PATCH: Atualização Parcial!',
          'Apenas uma face do recurso foi modificada',
          '#f59e0b'
        );
        break;
      case 'DELETE':
        this.resourceCubes[2].alive = false;
        this.resourceCubes[2].group.visible = false;
        updateTag3D(
          this.vaultLabel,
          'DELETE: Recurso Removido (204)',
          'Idempotente • Deletar novamente mantém ausente',
          '#ef4444'
        );
        break;
      case 'OPTIONS':
        updateTag3D(
          this.vaultLabel,
          'Allow: GET, POST, PUT, PATCH, DELETE, HEAD',
          'OPTIONS descobre métodos • CONNECT abre túnel • TRACE ecoa rota',
          '#eab308'
        );
        break;
    }
  }

  setServerMode(mode) {
    this.serverMode = mode;
    if (mode === 'error5xx') {
      this.railMat.color.set('#ef4444');
      this.railMat.emissive.set('#ef4444');
      this.pedestalRingMat.color.set('#ef4444');
      this.pedestalRingMat.emissive.set('#ef4444');
      updateTag3D(this.mainLabel, '5xx ERRO NO SERVIDOR!', '500 Internal Error / 502 / 503 / 504', '#ef4444');
    } else if (mode === 'processing') {
      this.railMat.color.set('#10b981');
      this.railMat.emissive.set('#10b981');
      this.pedestalRingMat.color.set('#10b981');
      this.pedestalRingMat.emissive.set('#10b981');
      updateTag3D(this.mainLabel, 'SERVIDOR PROCESSANDO', 'Gerando HTTP Response 200 OK', '#10b981');
    } else if (mode === 'statelessFlash') {
      this.railMat.color.set('#38bdf8');
      this.railMat.emissive.set('#38bdf8');
      updateTag3D(this.mainLabel, 'SERVIDOR STATELESS', 'Não guarda memória automática entre requests', '#38bdf8');
    } else {
      this.railMat.color.set('#a855f7');
      this.railMat.emissive.set('#a855f7');
      this.pedestalRingMat.color.set('#a855f7');
      this.pedestalRingMat.emissive.set('#a855f7');
      updateTag3D(this.mainLabel, 'SERVIDOR WEB', 'Apache / Nginx / Node • :80 e :443', '#a855f7');
    }
  }

  resetState() {
    this.setServerMode('normal');
    setObjectVisible(this.resourceVault, false);
    setObjectVisible(this.firewallGroup, false);
    setObjectVisible(this.mirrorNode, false);
    setObjectVisible(this.corsTower, false);
    this.setCorsGateAllowed(false);
  }

  update(dt, elapsed) {
    // Piscar LEDs das lâminas do servidor
    for (const led of this.bladeLeds) {
      if (this.serverMode === 'error5xx') {
        const blink = Math.sin(elapsed * 14 + led.index) > 0;
        led.mat.color.set('#ef4444');
        led.mat.emissive.set('#ef4444');
        led.mat.emissiveIntensity = blink ? 2.4 : 0.25;
      } else {
        const isGreen = led.index % 3 === 0;
        const c = isGreen ? '#10b981' : '#22d3ee';
        led.mat.color.set(c);
        led.mat.emissive.set(c);
        led.mat.emissiveIntensity = 0.65 + 0.95 * Math.abs(Math.sin(elapsed * 4.5 + led.index * 1.3));
      }
    }

    // Retorno suave da escala dos cubos de recursos 3D
    if (this.resourceVault.visible) {
      this.resourceCubes.forEach((c, idx) => {
        if (!c.alive) return;
        c.group.position.y = Math.sin(elapsed * 2.4 + idx * 1.1) * 0.12;
        c.group.rotation.y = elapsed * 0.55;
        c.group.scale.lerp(new THREE.Vector3(1, 1, 1), dt * 4.5);
      });
    }

    if (this.mirrorNode.visible && this.mirrorPrism) {
      this.mirrorPrism.rotation.y = elapsed * 1.4;
      this.mirrorPrism.position.y = 0.85 + Math.sin(elapsed * 3) * 0.14;
    }

    if (this.firewallGroup.visible) {
      this.shieldMat.opacity = 0.45 + 0.18 * Math.sin(elapsed * 6);
    }
  }
}
