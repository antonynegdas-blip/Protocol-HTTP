import * as THREE from 'three';
import { createTag3D, setObjectVisible, updateTag3D } from '../labelHelper.js';

export class NetworkBridge {
  constructor(scene) {
    this.scene = scene;

    this.buildMainConduit();
    this.buildRedirectTrack();
    this.buildCorsTrack();
    this.buildMitmDrone();
    this.buildTlsTunnelAndLock();
    this.buildEvolutionH1H2();
    this.buildHttp3AndWebsocket();
  }

  buildMainConduit() {
    this.mainBridge = new THREE.Group();
    this.scene.add(this.mainBridge);

    this.railMat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      emissive: '#0284c7',
      emissiveIntensity: 1.05,
      metalness: 0.5,
      roughness: 0.2
    });

    const railGeo = new THREE.CylinderGeometry(0.06, 0.06, 15.2, 12);
    railGeo.rotateZ(Math.PI / 2);

    [-0.45, 0.45].forEach((zOffset) => {
      const rail = new THREE.Mesh(railGeo, this.railMat);
      rail.position.set(0, 0.85, zOffset);
      this.mainBridge.add(rail);
    });

    // Anéis guias ao longo da ponte
    this.guideRings = [];
    for (let i = -3; i <= 3; i++) {
      const ringMat = new THREE.MeshStandardMaterial({
        color: '#22d3ee',
        emissive: '#22d3ee',
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.03, 10, 24), ringMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(i * 2.1, 0.95, 0);
      this.mainBridge.add(ring);
      this.guideRings.push({ mesh: ring, mat: ringMat, index: i });
    }

    this.bridgeLabel = createTag3D('Canal TCP/IP', 'Porta 80 (HTTP) / 443 (HTTPS)', '#38bdf8');
    this.bridgeLabel.position.set(0, -0.15, 0.9);
    this.mainBridge.add(this.bridgeLabel);
  }

  buildRedirectTrack() {
    // Curva 3D de desvio para 3xx Redirecionamento
    this.redirectCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.4, 0.95, 0),
      new THREE.Vector3(4.5, 1.25, -1.8),
      new THREE.Vector3(5.8, 1.15, -3.8),
      new THREE.Vector3(6.8, 0.95, -5.8)
    ]);

    const tubeGeo = new THREE.TubeGeometry(this.redirectCurve, 32, 0.08, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#f59e0b',
      emissiveIntensity: 1.35,
      transparent: true,
      opacity: 0.85
    });
    this.redirectTrack = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.redirectTrack);
    setObjectVisible(this.redirectTrack, false);
  }

  buildCorsTrack() {
    // Ponte diagonal para API Externa (CORS)
    this.corsCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.2, 1.0, -0.8),
      new THREE.Vector3(-3.8, 1.5, -3.8),
      new THREE.Vector3(0.2, 1.5, -6.5),
      new THREE.Vector3(3.4, 1.1, -8.8)
    ]);

    const tubeGeo = new THREE.TubeGeometry(this.corsCurve, 36, 0.075, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: '#818cf8',
      emissive: '#6366f1',
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8
    });
    this.corsTrack = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.corsTrack);
    setObjectVisible(this.corsTrack, false);
  }

  buildMitmDrone() {
    // Drone Interceptador 3D (Sniffer / Man-in-the-Middle)
    this.droneGroup = new THREE.Group();
    this.droneGroup.position.set(0, 5.5, 0);
    this.scene.add(this.droneGroup);

    const hullMat = new THREE.MeshStandardMaterial({
      color: '#1f2937',
      metalness: 0.88,
      roughness: 0.22
    });
    const hull = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), hullMat);
    hull.scale.set(1.35, 0.75, 1.35);
    this.droneGroup.add(hull);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#ef4444',
        emissive: '#ef4444',
        emissiveIntensity: 2.2
      })
    );
    eye.position.y = -0.35;
    this.droneGroup.add(eye);

    this.droneRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.38, 0.05, 10, 6),
      new THREE.MeshStandardMaterial({
        color: '#ef4444',
        emissive: '#dc2626',
        emissiveIntensity: 1.5
      })
    );
    this.droneRing.rotation.x = Math.PI / 2;
    this.droneGroup.add(this.droneRing);

    // Feixe cônico de Sniffing / Interceptação
    const coneGeo = new THREE.ConeGeometry(2.3, 4.5, 24, 1, true);
    this.scanConeMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#dc2626',
      emissiveIntensity: 1.3,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    this.scanCone = new THREE.Mesh(coneGeo, this.scanConeMat);
    this.scanCone.position.y = -2.35;
    this.droneGroup.add(this.scanCone);

    // Anel de faísca quando bloqueado pelo túnel TLS
    this.deflectDisc = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.07, 10, 28),
      new THREE.MeshStandardMaterial({
        color: '#22d3ee',
        emissive: '#10b981',
        emissiveIntensity: 2.0
      })
    );
    this.deflectDisc.rotation.x = Math.PI / 2;
    this.deflectDisc.position.y = -2.9;
    this.deflectDisc.visible = false;
    this.droneGroup.add(this.deflectDisc);

    this.droneLabel = createTag3D(
      'Atacante Man-in-the-Middle (Sniffer)',
      'Lendo senhas e cookies em Texto Plano!',
      '#ef4444'
    );
    this.droneLabel.position.set(0, 1.35, 0);
    this.droneGroup.add(this.droneLabel);

    this.droneBlockedByTls = false;
    setObjectVisible(this.droneGroup, false);
  }

  buildTlsTunnelAndLock() {
    // Túnel Hexagonal Blindado TLS + Cadeado Dourado 3D (HTTPS)
    this.tlsGroup = new THREE.Group();
    this.scene.add(this.tlsGroup);

    const outerGeo = new THREE.CylinderGeometry(1.65, 1.65, 15.2, 6, 8, true);
    outerGeo.rotateZ(Math.PI / 2);

    const glassMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#059669',
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const glassTunnel = new THREE.Mesh(outerGeo, glassMat);
    glassTunnel.position.y = 0.98;
    this.tlsGroup.add(glassTunnel);

    const wireMat = new THREE.MeshStandardMaterial({
      color: '#22d3ee',
      emissive: '#10b981',
      emissiveIntensity: 1.35,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    this.tlsWire = new THREE.Mesh(outerGeo, wireMat);
    this.tlsWire.position.y = 0.98;
    this.tlsGroup.add(this.tlsWire);

    // Cadeado 3D Dourado Esculpido no topo do túnel
    this.padlock = new THREE.Group();
    this.padlock.position.set(0, 3.2, 1.15);
    this.tlsGroup.add(this.padlock);

    const goldMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#d97706',
      emissiveIntensity: 0.75,
      metalness: 0.88,
      roughness: 0.18
    });

    const lockBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.88, 0.36), goldMat);
    this.padlock.add(lockBody);

    const shackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.09, 12, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.92, roughness: 0.15 })
    );
    shackle.position.y = 0.44;
    this.padlock.add(shackle);

    const keyhole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.4, 12),
      new THREE.MeshStandardMaterial({ color: '#0f172a' })
    );
    keyhole.rotation.x = Math.PI / 2;
    this.padlock.add(keyhole);

    this.tlsLabel = createTag3D(
      'Túnel HTTPS (TLS + Certificado Digital CA)',
      'Confidencialidade • Integridade • Autenticidade',
      '#10b981'
    );
    this.tlsLabel.position.set(0, 1.35, 0);
    this.padlock.add(this.tlsLabel);

    setObjectVisible(this.tlsGroup, false);
  }

  buildEvolutionH1H2() {
    // Passo 11: Comparação 3D Lado a Lado HTTP/1.1 (Head-of-Line Blocking) vs HTTP/2 (Multiplexação)
    this.h1h2Group = new THREE.Group();
    this.scene.add(this.h1h2Group);

    // Pista Frontal: HTTP/1.1 (z = +2.3)
    const h1RailGeo = new THREE.BoxGeometry(15.0, 0.14, 0.9);
    const h1Rail = new THREE.Mesh(
      h1RailGeo,
      new THREE.MeshStandardMaterial({ color: '#7f1d1d', emissive: '#991b1b', emissiveIntensity: 0.7 })
    );
    h1Rail.position.set(0, 0.75, 2.3);
    this.h1h2Group.add(h1Rail);

    const h1Label = createTag3D(
      'HTTP/1.1 (Keep-Alive • Texto)',
      'Head-of-Line Blocking: pacote lento trava a fila!',
      '#f87171'
    );
    h1Label.position.set(0, 2.55, 2.3);
    this.h1h2Group.add(h1Label);

    // Pacote pesado lento + 3 pacotes rápidos presos atrás dele
    this.h1Blocker = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.95, 0.8),
      new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 1.1 })
    );
    this.h1h2Group.add(this.h1Blocker);

    this.h1Queued = [];
    const qColors = ['#38bdf8', '#f59e0b', '#a855f7'];
    qColors.forEach((col) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.1 })
      );
      this.h1h2Group.add(m);
      this.h1Queued.push(m);
    });

    // Pista Traseira: HTTP/2 Multiplexação Binária (z = -2.3)
    const h2TubeGeo = new THREE.CylinderGeometry(1.05, 1.05, 15.0, 16, 1, true);
    h2TubeGeo.rotateZ(Math.PI / 2);
    const h2Tube = new THREE.Mesh(
      h2TubeGeo,
      new THREE.MeshStandardMaterial({
        color: '#22d3ee',
        emissive: '#0891b2',
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide
      })
    );
    h2Tube.position.set(0, 1.25, -2.3);
    this.h1h2Group.add(h2Tube);

    const h2Label = createTag3D(
      'HTTP/2 (Frames Binários • HPACK)',
      'Multiplexação em 1 conexão TCP (mas perda TCP ainda trava tudo)',
      '#22d3ee'
    );
    h2Label.position.set(0, 3.0, -2.3);
    this.h1h2Group.add(h2Label);

    // 12 Frames binários viajando misturados em 3 faixas paralelas dentro da conexão única
    this.h2Frames = [];
    const fColors = ['#22d3ee', '#10b981', '#a855f7', '#f59e0b'];
    for (let i = 0; i < 12; i++) {
      const col = fColors[i % fColors.length];
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.32, 0.32),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4 })
      );
      this.h1h2Group.add(frame);
      this.h2Frames.push({
        mesh: frame,
        lane: (i % 3) - 1,
        offset: i / 12,
        speed: 0.42 + (i % 3) * 0.14
      });
    }

    setObjectVisible(this.h1h2Group, false);
  }

  buildHttp3AndWebsocket() {
    // Passo 12: HTTP/3 (3 Fluxos Independentes QUIC/UDP 0-RTT) + WebSocket Full-Duplex (101)
    this.h3Group = new THREE.Group();
    this.scene.add(this.h3Group);

    const streamSpecs = [
      { z: -2.4, yPeak: 4.1, color: '#22d3ee', speed: 0.65 },
      { z: 0.0, yPeak: 4.8, color: '#a855f7', speed: 0.52, simulateLoss: true },
      { z: 2.4, yPeak: 4.1, color: '#10b981', speed: 0.72 }
    ];

    this.quicStreams = [];

    streamSpecs.forEach((spec) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7.4, 1.3, spec.z * 0.35),
        new THREE.Vector3(-2.5, spec.yPeak, spec.z),
        new THREE.Vector3(2.5, spec.yPeak, spec.z),
        new THREE.Vector3(7.4, 1.3, spec.z * 0.35)
      ]);

      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 40, 0.065, 10, false),
        new THREE.MeshStandardMaterial({
          color: spec.color,
          emissive: spec.color,
          emissiveIntensity: 1.25,
          transparent: true,
          opacity: 0.72
        })
      );
      this.h3Group.add(tube);

      const orbs = [];
      for (let k = 0; k < 4; k++) {
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 14, 14),
          new THREE.MeshStandardMaterial({
            color: spec.color,
            emissive: spec.color,
            emissiveIntensity: 1.8
          })
        );
        this.h3Group.add(orb);
        orbs.push({ mesh: orb, phase: k * 0.25 });
      }

      this.quicStreams.push({ curve, orbs, spec });
    });

    const h3Label = createTag3D(
      'HTTP/3 (QUIC sobre UDP • 0-RTT)',
      'Zero Head-of-Line Blocking • Migração Wi-Fi ↔ 5G sem queda',
      '#22d3ee'
    );
    h3Label.position.set(0, 5.85, 0);
    this.h3Group.add(h3Label);

    // Canal inferior WebSocket (101 Switching Protocols) Bidirecional Full-Duplex
    const wsGeo = new THREE.CylinderGeometry(0.08, 0.08, 15.0, 12);
    wsGeo.rotateZ(Math.PI / 2);
    const wsMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 1.3
    });
    const wsRailA = new THREE.Mesh(wsGeo, wsMat);
    wsRailA.position.set(0, 0.55, -0.35);
    const wsRailB = new THREE.Mesh(wsGeo, wsMat);
    wsRailB.position.set(0, 0.55, 0.35);
    this.h3Group.add(wsRailA, wsRailB);

    this.wsPulses = [];
    for (let i = 0; i < 6; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 12, 12),
        new THREE.MeshStandardMaterial({
          color: dir > 0 ? '#fde047' : '#34d399',
          emissive: dir > 0 ? '#facc15' : '#10b981',
          emissiveIntensity: 1.9
        })
      );
      this.h3Group.add(pulse);
      this.wsPulses.push({ mesh: pulse, dir, offset: i / 6 });
    }

    const wsLabel = createTag3D(
      'WebSocket (101 Switching Protocols)',
      'Conexão Persistente Bidirecional em Tempo Real',
      '#f59e0b'
    );
    wsLabel.position.set(0, -0.25, 1.1);
    this.h3Group.add(wsLabel);

    setObjectVisible(this.h3Group, false);
  }

  setDroneState(visible, blockedByTls = false) {
    this.droneBlockedByTls = blockedByTls;
    setObjectVisible(this.droneGroup, visible);
    if (!visible) return;

    if (blockedByTls) {
      // Feixe laser é barrado na casca superior do túnel TLS!
      this.scanCone.scale.set(0.55, 0.55, 0.55);
      this.scanCone.position.y = -1.45;
      this.deflectDisc.visible = true;
      this.deflectDisc.position.y = -2.65;
      updateTag3D(
        this.droneLabel,
        'Sniffer Bloqueado pelo TLS!',
        'Dados criptografados ilegíveis para intermediários',
        '#10b981'
      );
    } else {
      this.scanCone.scale.set(1, 1, 1);
      this.scanCone.position.y = -2.35;
      this.deflectDisc.visible = false;
      updateTag3D(
        this.droneLabel,
        'Atacante Man-in-the-Middle (Sniffer)',
        'Espionando e alterando HTTP em Texto Plano!',
        '#ef4444'
      );
    }
  }

  resetState() {
    setObjectVisible(this.mainBridge, true);
    setObjectVisible(this.redirectTrack, false);
    setObjectVisible(this.corsTrack, false);
    this.setDroneState(false, false);
    setObjectVisible(this.tlsGroup, false);
    setObjectVisible(this.h1h2Group, false);
    setObjectVisible(this.h3Group, false);
    this.railMat.color.set('#0ea5e9');
    this.railMat.emissive.set('#0284c7');
    updateTag3D(this.bridgeLabel, 'Canal TCP/IP', 'Porta 80 (HTTP) / 443 (HTTPS)', '#38bdf8');
  }

  update(dt, elapsed) {
    // Pulso nos anéis do canal principal
    if (this.mainBridge.visible) {
      for (const r of this.guideRings) {
        const wave = 0.5 + 0.5 * Math.sin(elapsed * 3.5 - r.index * 0.7);
        r.mat.opacity = 0.25 + wave * 0.5;
        r.mesh.scale.setScalar(0.94 + wave * 0.12);
      }
    }

    // Movimento do Drone MitM
    if (this.droneGroup.visible) {
      this.droneGroup.position.y = 5.45 + Math.sin(elapsed * 2.2) * 0.22;
      this.droneRing.rotation.z = elapsed * 2.4;
      if (this.deflectDisc.visible) {
        this.deflectDisc.scale.setScalar(0.9 + 0.22 * Math.sin(elapsed * 12));
      }
    }

    // Cadeado 3D HTTPS flutuante
    if (this.tlsGroup.visible) {
      this.padlock.position.y = 3.2 + Math.sin(elapsed * 2.5) * 0.14;
      this.padlock.rotation.y = Math.sin(elapsed * 1.2) * 0.22;
      this.tlsWire.rotation.x = elapsed * 0.25;
    }

    // Passo 11: Animação HTTP/1.1 (Fila Travada) vs HTTP/2 (Multiplexação)
    if (this.h1h2Group.visible) {
      // Bloco pesado HTTP/1.1 se arrasta devagar e trava os 3 pacotes atrás
      const slowT = (elapsed * 0.13) % 1;
      const leadX = -4.5 + slowT * 10.5;
      this.h1Blocker.position.set(leadX, 1.32, 2.3);
      this.h1Queued.forEach((qMesh, idx) => {
        const jitter = Math.sin(elapsed * 14 + idx) * 0.04;
        qMesh.position.set(leadX - 1.25 - idx * 0.82 + jitter, 1.15, 2.3);
      });

      // HTTP/2 frames binários velozes em paralelo
      for (const f of this.h2Frames) {
        const t = (elapsed * f.speed + f.offset) % 1;
        const x = -7.0 + t * 14.0;
        const y = 1.25 + f.lane * 0.44;
        const z = -2.3 + Math.cos(f.lane * 1.2) * 0.22;
        f.mesh.position.set(x, y, z);
      }
    }

    // Passo 12: Animação HTTP/3 QUIC Streams + WebSocket Bidirecional
    if (this.h3Group.visible) {
      this.quicStreams.forEach((st) => {
        // Simula micro-pausa isolada apenas no fluxo do meio para mostrar que os outros NÃO travam!
        const pauseWindow = st.spec.simulateLoss && Math.sin(elapsed * 1.8) > 0.72;
        st.orbs.forEach((o) => {
          if (!pauseWindow) {
            o.phase = (o.phase + dt * st.spec.speed) % 1;
          }
          const pt = st.curve.getPointAt(o.phase);
          o.mesh.position.copy(pt);
        });
      });

      for (const wp of this.wsPulses) {
        const t = (elapsed * 0.65 + wp.offset) % 1;
        const x = wp.dir > 0 ? -7.2 + t * 14.4 : 7.2 - t * 14.4;
        wp.mesh.position.set(x, 0.55, wp.dir > 0 ? 0.35 : -0.35);
      }
    }
  }
}
