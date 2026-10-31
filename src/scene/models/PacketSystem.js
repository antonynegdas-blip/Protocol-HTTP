import * as THREE from 'three';
import {
  createAnatomyTag,
  createPacketBadge,
  setObjectVisible
} from '../labelHelper.js';

export class PacketSystem {
  constructor(scene) {
    this.scene = scene;
    this.activePackets = [];

    this.buildExplodedAnatomy();
  }

  buildExplodedAnatomy() {
    this.anatomyGroup = new THREE.Group();
    this.anatomyGroup.position.set(-2.0, 3.6, 0);
    this.scene.add(this.anatomyGroup);

    this.explodeFactor = 0;
    this.targetExplode = 1;

    // Hastes verticais luminosas conectando as 4 camadas explodidas
    const rodMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.55
    });
    const rodGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.8, 8);
    [
      [-1.05, -0.65],
      [1.05, -0.65],
      [-1.05, 0.65],
      [1.05, 0.65]
    ].forEach(([rx, rz]) => {
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(rx, 0, rz);
      this.anatomyGroup.add(rod);
    });

    // Camada 1: Request Line / Status Line (Topo)
    this.tier1Mat = new THREE.MeshStandardMaterial({
      color: '#22d3ee',
      emissive: '#0891b2',
      emissiveIntensity: 1.1,
      metalness: 0.4,
      roughness: 0.2
    });
    this.tier1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.36, 1.5), this.tier1Mat);
    this.tier1Tag = createAnatomyTag('1. Request Line', 'POST /api/usuarios HTTP/1.1', '#22d3ee');
    this.tier1Tag.position.set(2.35, 0, 0);
    this.tier1.add(this.tier1Tag);

    // Camada 2: Headers (Placas empilhadas)
    this.tier2 = new THREE.Group();
    this.tier2Mat = new THREE.MeshStandardMaterial({
      color: '#a855f7',
      emissive: '#7e22ce',
      emissiveIntensity: 1.0,
      metalness: 0.45,
      roughness: 0.22
    });
    [-0.16, 0, 0.16].forEach((py) => {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.11, 1.44), this.tier2Mat);
      plate.position.y = py;
      this.tier2.add(plate);
    });
    this.tier2Tag = createAnatomyTag(
      '2. Headers (Metadados)',
      'Host: api.meusite.com\nContent-Type: application/json\nAuthorization: Bearer eyJhbG...',
      '#a855f7'
    );
    this.tier2Tag.position.set(2.45, 0, 0);
    this.tier2.add(this.tier2Tag);

    // Camada 3: Linha em Branco (\r\n)
    this.tier3Mat = new THREE.MeshStandardMaterial({
      color: '#fde047',
      emissive: '#eab308',
      emissiveIntensity: 1.6,
      transparent: true,
      opacity: 0.85
    });
    this.tier3 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.06, 1.48), this.tier3Mat);
    this.tier3Tag = createAnatomyTag(
      '3. Linha em Branco (\\r\\n)',
      'Separa fim dos Headers do Body',
      '#fde047'
    );
    this.tier3Tag.position.set(2.35, 0, 0);
    this.tier3.add(this.tier3Tag);

    // Camada 4: Body / Payload (Base cristalina)
    this.tier4 = new THREE.Group();
    this.tier4ShellMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#059669',
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.42
    });
    const shell = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.68, 1.4), this.tier4ShellMat);
    this.tier4.add(shell);

    this.tier4Core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({
        color: '#34d399',
        emissive: '#10b981',
        emissiveIntensity: 1.6
      })
    );
    this.tier4.add(this.tier4Core);

    this.tier4Tag = createAnatomyTag(
      '4. Body (Corpo JSON)',
      '{ "nome": "Maria Silva", "idade": 24 }',
      '#10b981'
    );
    this.tier4Tag.position.set(2.38, 0, 0);
    this.tier4.add(this.tier4Tag);

    this.anatomyGroup.add(this.tier1, this.tier2, this.tier3, this.tier4);
    setObjectVisible(this.anatomyGroup, false);
  }

  updateAnatomyText(tagObj, head, code, color) {
    if (!tagObj || !tagObj.userData) return;
    tagObj.userData.headEl.textContent = head;
    tagObj.userData.codeEl.textContent = code;
    tagObj.userData.el.style.setProperty('--layer-color', color);
  }

  showExplodedAnatomy(mode) {
    if (!mode) {
      setObjectVisible(this.anatomyGroup, false);
      return;
    }

    this.explodeFactor = 0.05;
    this.targetExplode = 1;

    if (mode === 'request') {
      this.anatomyGroup.position.set(-2.3, 3.65, 0.4);
      this.tier1Mat.color.set('#22d3ee');
      this.tier1Mat.emissive.set('#0891b2');
      this.updateAnatomyText(
        this.tier1Tag,
        '1. Linha de Início (Request Line)',
        'POST /api/usuarios HTTP/1.1',
        '#22d3ee'
      );
      this.updateAnatomyText(
        this.tier2Tag,
        '2. Cabeçalhos (Request Headers)',
        'Host: api.meusite.com\nUser-Agent: Mozilla/5.0\nContent-Type: application/json',
        '#a855f7'
      );
      this.updateAnatomyText(
        this.tier3Tag,
        '3. Linha em Branco (\\r\\n)',
        'Delimita fim dos cabeçalhos',
        '#fde047'
      );
      this.updateAnatomyText(
        this.tier4Tag,
        '4. Corpo (Body - Opcional)',
        '{\n  "nome": "Maria Silva",\n  "idade": 24\n}',
        '#10b981'
      );
    } else if (mode === 'response') {
      this.anatomyGroup.position.set(1.2, 3.65, 0.4);
      this.tier1Mat.color.set('#10b981');
      this.tier1Mat.emissive.set('#059669');
      this.updateAnatomyText(
        this.tier1Tag,
        '1. Linha de Status (Status Line)',
        'HTTP/1.1 200 OK',
        '#10b981'
      );
      this.updateAnatomyText(
        this.tier2Tag,
        '2. Cabeçalhos (Response Headers)',
        'Server: Apache/2.4\nContent-Type: application/json\nSet-Cookie: sid=xyz; HttpOnly',
        '#38bdf8'
      );
      this.updateAnatomyText(
        this.tier3Tag,
        '3. Linha em Branco (\\r\\n)',
        'Separa metadados do conteúdo',
        '#fde047'
      );
      this.updateAnatomyText(
        this.tier4Tag,
        '4. Corpo da Resposta (Body)',
        '{\n  "status": "sucesso",\n  "id": 105\n}',
        '#22d3ee'
      );
    }

    setObjectVisible(this.anatomyGroup, true);
  }

  /**
   * Dispara um pacote 3D animado ao longo da rede.
   */
  spawnPacket({
    from = [-7.5, 1.15, 0],
    to = [7.5, 1.15, 0],
    curve = null,
    color = '#22d3ee',
    label = 'GET / HTTP/1.1',
    duration = 2.0,
    shape = 'cube', // 'cube' | 'diamond' | 'sphere'
    behavior = 'normal', // 'normal' | 'bounceShield' | 'corruptMidway'
    scale = 1.0,
    onArrive = null
  }) {
    const group = new THREE.Group();

    let geo;
    if (shape === 'diamond') {
      geo = new THREE.OctahedronGeometry(0.44 * scale, 0);
    } else if (shape === 'sphere') {
      geo = new THREE.SphereGeometry(0.34 * scale, 16, 16);
    } else {
      geo = new THREE.BoxGeometry(0.76 * scale, 0.52 * scale, 0.56 * scale);
    }

    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.5,
      metalness: 0.35,
      roughness: 0.2
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Halo externo translúcido
    const auraMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.25
    });
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.62 * scale, 12, 12), auraMat);
    group.add(aura);

    let badge = null;
    if (label) {
      badge = createPacketBadge(label, color);
      badge.position.set(0, 0.82 * scale, 0);
      group.add(badge);
    }

    const startVec = new THREE.Vector3(...from);
    const endVec = new THREE.Vector3(...to);
    if (curve) {
      group.position.copy(curve.getPointAt(0));
    } else {
      group.position.copy(startVec);
    }

    this.scene.add(group);

    this.activePackets.push({
      group,
      mesh,
      mat,
      auraMat,
      badge,
      startVec,
      endVec,
      curve,
      duration,
      elapsed: 0,
      behavior,
      corrupted: false,
      onArrive
    });
  }

  clearPackets() {
    for (const pkt of this.activePackets) {
      if (pkt.badge && pkt.badge.element) {
        pkt.badge.element.remove();
      }
      this.scene.remove(pkt.group);
      pkt.mesh.geometry.dispose();
      pkt.mat.dispose();
    }
    this.activePackets = [];
  }

  resetState() {
    this.clearPackets();
    this.showExplodedAnatomy(null);
  }

  update(dt, elapsed) {
    // Animação suave da abertura das 4 camadas da Anatomia HTTP
    if (this.anatomyGroup.visible) {
      this.explodeFactor = THREE.MathUtils.lerp(this.explodeFactor, this.targetExplode, dt * 3.4);
      const e = this.explodeFactor;

      this.tier1.position.y = 1.45 * e;
      this.tier2.position.y = 0.45 * e;
      this.tier3.position.y = -0.35 * e;
      this.tier4.position.y = -1.25 * e;

      this.anatomyGroup.rotation.y = Math.sin(elapsed * 0.9) * 0.14;
      this.tier4Core.rotation.y = elapsed * 1.8;
    }

    // Atualização de todos os pacotes 3D em trânsito
    for (let i = this.activePackets.length - 1; i >= 0; i--) {
      const pkt = this.activePackets[i];
      pkt.elapsed += dt;
      const t = Math.min(pkt.elapsed / pkt.duration, 1);

      if (pkt.behavior === 'bounceShield') {
        // Vai até o escudo 4xx (72% do percurso) e ricocheteia de volta!
        if (t < 0.65) {
          const forwardT = t / 0.65;
          pkt.group.position.lerpVectors(pkt.startVec, new THREE.Vector3(6.1, 1.25, 0), forwardT);
        } else {
          if (!pkt.corrupted) {
            pkt.corrupted = true;
            pkt.mat.color.set('#fb7185');
            pkt.mat.emissive.set('#e11d48');
            if (pkt.badge && pkt.badge.userData) {
              pkt.badge.userData.el.textContent = '403 / 404 Recusado!';
              pkt.badge.userData.el.style.setProperty('--pkt-color', '#fb7185');
            }
          }
          const backT = (t - 0.65) / 0.35;
          pkt.group.position.lerpVectors(
            new THREE.Vector3(6.1, 1.25, 0),
            new THREE.Vector3(1.2, 2.5, 1.5),
            backT
          );
        }
      } else if (pkt.curve) {
        pkt.group.position.copy(pkt.curve.getPointAt(t));
      } else {
        pkt.group.position.lerpVectors(pkt.startVec, pkt.endVec, t);
      }

      // No Passo 8 (HTTP Puro), quando passa sob o laser do Sniffer (meio do caminho), é espionado/adulterado!
      if (pkt.behavior === 'corruptMidway' && t > 0.46 && !pkt.corrupted) {
        pkt.corrupted = true;
        pkt.mat.color.set('#ef4444');
        pkt.mat.emissive.set('#dc2626');
        if (pkt.badge && pkt.badge.userData) {
          pkt.badge.userData.el.textContent = '⚠ Senha Interceptada (MitM)!';
          pkt.badge.userData.el.style.setProperty('--pkt-color', '#ef4444');
        }
      }

      pkt.mesh.rotation.y += dt * 1.8;

      if (t >= 1) {
        if (typeof pkt.onArrive === 'function') {
          pkt.onArrive();
        }
        if (pkt.badge && pkt.badge.element) {
          pkt.badge.element.remove();
        }
        this.scene.remove(pkt.group);
        pkt.mesh.geometry.dispose();
        pkt.mat.dispose();
        this.activePackets.splice(i, 1);
      }
    }
  }
}
