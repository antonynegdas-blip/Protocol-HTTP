import { setObjectVisible, updateTag3D } from './labelHelper.js';

export class StepAnimator {
  constructor({ sceneManager, client, server, bridge, packets, steps }) {
    this.sceneManager = sceneManager;
    this.client = client;
    this.server = server;
    this.bridge = bridge;
    this.packets = packets;
    this.steps = steps;

    this.currentStepIndex = 0;
    this.timers = [];
    this.intervals = [];
  }

  schedule(fn, delayMs) {
    const id = window.setTimeout(fn, delayMs);
    this.timers.push(id);
    return id;
  }

  loop(fn, intervalMs) {
    const id = window.setInterval(fn, intervalMs);
    this.intervals.push(id);
    return id;
  }

  clearTimers() {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.intervals.forEach((id) => window.clearInterval(id));
    this.timers = [];
    this.intervals = [];
  }

  resetAllModels() {
    this.clearTimers();
    this.client.resetState();
    this.server.resetState();
    this.bridge.resetState();
    this.packets.resetState();
    this.sceneManager.alertLight.intensity = 0;
  }

  goToStep(index, flyCamera = true) {
    const clamped = Math.max(0, Math.min(index, this.steps.length - 1));
    this.currentStepIndex = clamped;
    const step = this.steps[clamped];

    this.resetAllModels();

    if (flyCamera) {
      this.sceneManager.flyTo(step.cameraPos, step.cameraTarget);
    }

    switch (step.id) {
      case 'arquitetura':
        this.runStepArquitetura();
        break;
      case 'tcp-stateless':
        this.runStepTcpStateless();
        break;
      case 'request-anatomy':
        this.runStepRequestAnatomy();
        break;
      case 'metodos-http':
        this.runStepMetodos('CYCLE');
        break;
      case 'response-anatomy':
        this.runStepResponseAnatomy();
        break;
      case 'status-codes':
        this.runStepStatusCodes('ALL');
        break;
      case 'headers-cache':
        this.runStepHeadersCache();
        break;
      case 'http-inseguro':
        this.runStepHttpInseguro();
        break;
      case 'https-tls':
        this.runStepHttpsTls();
        break;
      case 'cors-preflight':
        this.runStepCorsPreflight();
        break;
      case 'evolucao-h1-h2':
        this.runStepEvolucaoH1H2();
        break;
      case 'http3-quic-ws':
        this.runStepHttp3QuicWs();
        break;
    }
  }

  replayCurrentStep() {
    this.goToStep(this.currentStepIndex, true);
  }

  resetCameraOnly() {
    const step = this.steps[this.currentStepIndex];
    this.sceneManager.flyTo(step.cameraPos, step.cameraTarget, 0.8);
  }

  triggerSubAction(actionId) {
    const step = this.steps[this.currentStepIndex];
    if (!step) return;

    this.resetAllModels();

    if (step.id === 'metodos-http') {
      this.runStepMetodos(actionId);
    } else if (step.id === 'status-codes') {
      this.runStepStatusCodes(actionId);
    }
  }

  // =========================================================================
  // PASSO 1: Arquitetura Cliente-Servidor & Camada de Aplicação
  // =========================================================================
  runStepArquitetura() {
    updateTag3D(
      this.bridge.bridgeLabel,
      'Camada de Aplicação (HTTP)',
      'Sobre TCP/IP • Porta 80 (HTTP) / 443 (HTTPS)',
      '#22d3ee'
    );

    const cycle = () => {
      this.client.setPageRendered(false);
      this.packets.spawnPacket({
        from: [-7.4, 1.15, 0],
        to: [7.4, 1.15, 0],
        color: '#22d3ee',
        label: 'HTTP Request → (GET /index.html)',
        duration: 1.85,
        onArrive: () => {
          this.server.setServerMode('processing');
          this.schedule(() => {
            this.server.setServerMode('normal');
            this.packets.spawnPacket({
              from: [7.4, 1.15, 0],
              to: [-7.4, 1.15, 0],
              color: '#10b981',
              label: '← HTTP Response (200 OK • HTML)',
              duration: 1.85,
              onArrive: () => {
                this.client.setPageRendered(true, 'Documento HTML entregue');
              }
            });
          }, 420);
        }
      });
    };

    cycle();
    this.loop(cycle, 5200);
  }

  // =========================================================================
  // PASSO 2: Handshake TCP, Stateless & Cookies / JWT
  // =========================================================================
  runStepTcpStateless() {
    this.client.setSessionTokenVisible(true);
    this.server.setServerMode('statelessFlash');
    updateTag3D(
      this.bridge.bridgeLabel,
      'Three-Way Handshake TCP → HTTP Stateless',
      'SYN → SYN-ACK → ACK • Sessão via Cookie/JWT',
      '#f59e0b'
    );

    const runHandshakeAndSession = () => {
      // 1. SYN
      this.packets.spawnPacket({
        from: [-7.4, 1.15, 0],
        to: [7.4, 1.15, 0],
        color: '#38bdf8',
        shape: 'sphere',
        scale: 0.85,
        label: '1. TCP SYN →',
        duration: 1.05
      });

      // 2. SYN-ACK
      this.schedule(() => {
        this.packets.spawnPacket({
          from: [7.4, 1.15, 0],
          to: [-7.4, 1.15, 0],
          color: '#818cf8',
          shape: 'sphere',
          scale: 0.85,
          label: '← 2. TCP SYN-ACK',
          duration: 1.05
        });
      }, 1100);

      // 3. ACK + HTTP com Cookie/JWT
      this.schedule(() => {
        this.packets.spawnPacket({
          from: [-7.4, 1.15, 0],
          to: [7.4, 1.15, 0],
          color: '#f59e0b',
          label: '3. ACK + GET /perfil (Cookie / Bearer JWT)',
          duration: 1.75,
          onArrive: () => {
            this.packets.spawnPacket({
              from: [7.4, 1.15, 0],
              to: [-7.4, 1.15, 0],
              color: '#10b981',
              label: '← 200 OK (Set-Cookie: sid=9f8a)',
              duration: 1.65
            });
          }
        });
      }, 2250);
    };

    runHandshakeAndSession();
    this.loop(runHandshakeAndSession, 6400);
  }

  // =========================================================================
  // PASSO 3: Anatomia 3D Explodida de uma Requisição HTTP
  // =========================================================================
  runStepRequestAnatomy() {
    this.packets.showExplodedAnatomy('request');

    const sendSample = () => {
      this.packets.spawnPacket({
        from: [-7.4, 1.1, 0],
        to: [7.4, 1.1, 0],
        color: '#22d3ee',
        label: 'POST /api/usuarios HTTP/1.1 + Body JSON',
        duration: 2.3
      });
    };

    this.schedule(sendSample, 900);
    this.loop(sendSample, 3600);
  }

  // =========================================================================
  // PASSO 4: Métodos HTTP (Verbos), Safe & Idempotência
  // =========================================================================
  runStepMetodos(selectedVerb = 'CYCLE') {
    setObjectVisible(this.server.resourceVault, true);
    this.server.resetResourceVault();

    const verbMeta = {
      GET: { color: '#22d3ee', text: 'GET /api/usuarios (Safe • Idempotente)' },
      POST: { color: '#10b981', text: 'POST /api/usuarios (Cria Recurso • Não-Idemp.)' },
      PUT: { color: '#a855f7', text: 'PUT /api/usuarios/2 (Substitui Tudo • Idemp.)' },
      PATCH: { color: '#f59e0b', text: 'PATCH /api/usuarios/1 (Modifica Parte)' },
      DELETE: { color: '#ef4444', text: 'DELETE /api/usuarios/3 (Remove • Idemp.)' },
      HEAD: { color: '#38bdf8', text: 'HEAD /api/usuarios (Safe • Só Cabeçalhos)' },
      OPTIONS: { color: '#eab308', text: 'OPTIONS /api/usuarios (Consulta Métodos)' }
    };

    const fireVerb = (verb) => {
      const info = verbMeta[verb] || verbMeta.GET;
      this.packets.spawnPacket({
        from: [-7.4, 1.2, 0.3],
        to: [6.2, 1.4, 2.1],
        color: info.color,
        label: info.text,
        duration: 1.55,
        onArrive: () => {
          this.server.applyVerbEffect(verb);
          if (verb === 'GET') {
            this.packets.spawnPacket({
              from: [6.2, 1.4, 2.1],
              to: [-7.4, 1.2, 0.3],
              color: '#22d3ee',
              label: '← 200 OK + JSON',
              duration: 1.4
            });
          } else if (verb === 'HEAD' || verb === 'OPTIONS') {
            this.packets.spawnPacket({
              from: [6.2, 1.4, 2.1],
              to: [-7.4, 1.2, 0.3],
              color: info.color,
              shape: 'sphere',
              scale: 0.85,
              label: verb === 'HEAD' ? '← 200 OK (Só Headers)' : '← Allow: GET, POST, PUT...',
              duration: 1.3
            });
          }
        }
      });
    };

    if (selectedVerb !== 'CYCLE') {
      if (selectedVerb === 'DELETE') {
        // Garante que o 3º cubo exista para o usuário ver ele sendo removido!
        this.server.resourceCubes[2].alive = true;
        this.server.resourceCubes[2].group.visible = true;
      }
      fireVerb(selectedVerb);
      this.loop(() => fireVerb(selectedVerb), 3800);
      return;
    }

    const sequence = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    let idx = 0;
    fireVerb(sequence[0]);
    this.loop(() => {
      idx = (idx + 1) % sequence.length;
      fireVerb(sequence[idx]);
    }, 2700);
  }

  // =========================================================================
  // PASSO 5: Anatomia 3D da Resposta HTTP & Renderização no Cliente
  // =========================================================================
  runStepResponseAnatomy() {
    this.server.setServerMode('processing');
    this.packets.showExplodedAnatomy('response');

    const deliverResponse = () => {
      this.packets.spawnPacket({
        from: [7.4, 1.15, 0],
        to: [-7.4, 1.15, 0],
        color: '#10b981',
        label: '← HTTP/1.1 200 OK + Body (HTML/JSON)',
        duration: 2.0,
        onArrive: () => {
          this.client.setPageRendered(true, 'HTTP/1.1 200 OK • Renderizado');
        }
      });
    };

    deliverResponse();
    this.loop(deliverResponse, 3800);
  }

  // =========================================================================
  // PASSO 6: Códigos de Status HTTP (1xx, 2xx, 3xx, 4xx, 5xx)
  // =========================================================================
  runStepStatusCodes(filterClass = 'ALL') {
    const runClass = (cls) => {
      // Limpa modos visuais temporários antes de disparar a classe atual
      setObjectVisible(this.server.firewallGroup, cls === '4xx');
      setObjectVisible(this.server.mirrorNode, cls === '3xx');
      setObjectVisible(this.bridge.redirectTrack, cls === '3xx');
      this.server.setServerMode(cls === '5xx' ? 'error5xx' : 'normal');
      this.sceneManager.alertLight.intensity = cls === '5xx' ? 28 : 0;
      if (cls !== '2xx') this.client.setPageRendered(false);

      if (cls === '1xx') {
        updateTag3D(this.bridge.bridgeLabel, '1xx Informativo', '100 Continue • 101 Switching Protocols', '#38bdf8');
        this.packets.spawnPacket({
          from: [-7.4, 1.15, 0],
          to: [7.4, 1.15, 0],
          color: '#38bdf8',
          shape: 'sphere',
          label: 'Expect: 100-continue →',
          duration: 1.2,
          onArrive: () => {
            this.packets.spawnPacket({
              from: [7.4, 1.15, 0],
              to: [-7.4, 1.15, 0],
              color: '#38bdf8',
              shape: 'sphere',
              label: '← 100 Continue (Pode enviar Body)',
              duration: 1.2
            });
          }
        });
      } else if (cls === '2xx') {
        updateTag3D(this.bridge.bridgeLabel, '2xx Sucesso', '200 OK • 201 Created • 204 No Content', '#10b981');
        this.packets.spawnPacket({
          from: [-7.4, 1.15, 0],
          to: [7.4, 1.15, 0],
          color: '#22d3ee',
          label: 'GET /dados →',
          duration: 1.25,
          onArrive: () => {
            this.packets.spawnPacket({
              from: [7.4, 1.15, 0],
              to: [-7.4, 1.15, 0],
              color: '#10b981',
              label: '← 200 OK (Sucesso!)',
              duration: 1.35,
              onArrive: () => this.client.setPageRendered(true, '200 OK Recebido')
            });
          }
        });
      } else if (cls === '3xx') {
        updateTag3D(this.bridge.bridgeLabel, '3xx Redirecionamento', '301 Moved Permanently • 302 • 307/308', '#f59e0b');
        this.packets.spawnPacket({
          from: [-7.4, 1.15, 0],
          to: [2.4, 1.0, 0],
          color: '#f59e0b',
          label: 'GET /rota-antiga →',
          duration: 1.15,
          onArrive: () => {
            this.packets.spawnPacket({
              curve: this.bridge.redirectCurve,
              color: '#f59e0b',
              label: '301 Redirect → Nova URL!',
              duration: 1.45
            });
          }
        });
      } else if (cls === '4xx') {
        updateTag3D(this.bridge.bridgeLabel, '4xx Erro do Cliente', '400 • 401 • 403 Forbidden • 404 Not Found • 429', '#fb7185');
        this.packets.spawnPacket({
          from: [-7.4, 1.25, 0],
          to: [7.4, 1.25, 0],
          color: '#fb7185',
          behavior: 'bounceShield',
          label: 'GET /rota-inexistente →',
          duration: 2.2
        });
      } else if (cls === '5xx') {
        updateTag3D(this.bridge.bridgeLabel, '5xx Erro do Servidor', '500 Internal Error • 502 • 503 • 504 Timeout', '#ef4444');
        this.packets.spawnPacket({
          from: [7.4, 1.2, 0],
          to: [-7.4, 1.2, 0],
          color: '#ef4444',
          label: '← 500 Internal Server Error / 503',
          duration: 1.9
        });
      }
    };

    if (filterClass !== 'ALL') {
      runClass(filterClass);
      this.loop(() => runClass(filterClass), 3400);
      return;
    }

    const classes = ['1xx', '2xx', '3xx', '4xx', '5xx'];
    let i = 0;
    runClass(classes[0]);
    this.loop(() => {
      i = (i + 1) % classes.length;
      runClass(classes[i]);
    }, 3200);
  }

  // =========================================================================
  // PASSO 7: Headers, Negociação (gzip) & Cache Local (ETag / 304)
  // =========================================================================
  runStepHeadersCache() {
    this.client.setCacheVaultState(true, false);
    updateTag3D(
      this.bridge.bridgeLabel,
      'Validação Condicional de Cache',
      'Accept-Encoding: gzip • If-None-Match: "v1-a9f" → 304',
      '#10b981'
    );

    const runCacheCycle = () => {
      this.client.setCacheVaultState(true, false);
      this.packets.spawnPacket({
        from: [-6.8, 1.15, 1.4],
        to: [7.4, 1.15, 0],
        color: '#22d3ee',
        shape: 'sphere',
        scale: 0.9,
        label: 'GET + If-None-Match: "v1-a9f"',
        duration: 1.5,
        onArrive: () => {
          this.packets.spawnPacket({
            from: [7.4, 1.15, 0],
            to: [-6.8, 1.15, 2.4],
            color: '#10b981',
            shape: 'sphere',
            scale: 0.9,
            label: '← 304 Not Modified (0 bytes Body!)',
            duration: 1.4,
            onArrive: () => {
              this.client.setCacheVaultState(true, true);
              this.client.setPageRendered(true, 'Instantâneo via Cache Local (304)');
            }
          });
        }
      });
    };

    runCacheCycle();
    this.loop(runCacheCycle, 4400);
  }

  // =========================================================================
  // PASSO 8: Vulnerabilidade do HTTP Puro (Texto Plano & MitM)
  // =========================================================================
  runStepHttpInseguro() {
    this.bridge.setDroneState(true, false);
    this.bridge.railMat.color.set('#ef4444');
    this.bridge.railMat.emissive.set('#b91c1c');
    this.sceneManager.alertLight.intensity = 18;
    updateTag3D(
      this.bridge.bridgeLabel,
      'HTTP Puro (Porta 80 • Texto Plano)',
      'Vulnerável a Sniffing e Man-in-the-Middle!',
      '#ef4444'
    );

    const sendPlain = () => {
      this.packets.spawnPacket({
        from: [-7.4, 1.15, 0],
        to: [7.4, 1.15, 0],
        color: '#fde047',
        behavior: 'corruptMidway',
        label: 'POST /login (senha=12345 em texto aberto)',
        duration: 2.7
      });
    };

    sendPlain();
    this.loop(sendPlain, 3200);
  }

  // =========================================================================
  // PASSO 9: Segurança HTTPS (Túnel Criptografado TLS & Certificado CA)
  // =========================================================================
  runStepHttpsTls() {
    setObjectVisible(this.bridge.tlsGroup, true);
    this.bridge.setDroneState(true, true); // Mostra o drone sendo bloqueado pelo túnel TLS!
    this.bridge.railMat.color.set('#10b981');
    this.bridge.railMat.emissive.set('#059669');
    updateTag3D(
      this.bridge.bridgeLabel,
      'HTTPS (Porta 443 • Criptografia TLS)',
      'Handshake TLS + Certificado CA Validado',
      '#10b981'
    );

    const sendEncrypted = () => {
      this.packets.spawnPacket({
        from: [-7.4, 1.05, 0],
        to: [7.4, 1.05, 0],
        color: '#10b981',
        shape: 'diamond',
        scale: 1.1,
        label: '🔒 Payload Criptografado (9f#a8$k2...)',
        duration: 2.0,
        onArrive: () => {
          this.packets.spawnPacket({
            from: [7.4, 1.05, 0],
            to: [-7.4, 1.05, 0],
            color: '#22d3ee',
            shape: 'diamond',
            scale: 1.1,
            label: '🔒 200 OK Autenticado & Íntegro',
            duration: 1.9,
            onArrive: () => this.client.setPageRendered(true, 'Conexão Segura HTTPS')
          });
        }
      });
    };

    sendEncrypted();
    this.loop(sendEncrypted, 4500);
  }

  // =========================================================================
  // PASSO 10: CORS & Requisição Prévia Preflight (OPTIONS)
  // =========================================================================
  runStepCorsPreflight() {
    setObjectVisible(this.server.corsTower, true);
    setObjectVisible(this.bridge.corsTrack, true);

    const runCorsSequence = () => {
      this.server.setCorsGateAllowed(false);

      // 1. Dispara Preflight OPTIONS
      this.packets.spawnPacket({
        curve: this.bridge.corsCurve,
        color: '#fde047',
        shape: 'sphere',
        scale: 0.95,
        label: '1. Preflight: OPTIONS /dados →',
        duration: 1.65,
        onArrive: () => {
          // 2. Servidor externo valida e libera o portal CORS
          this.server.setCorsGateAllowed(true);

          // 3. Requisição principal Cross-Origin atravessa o portal aberto!
          this.schedule(() => {
            this.packets.spawnPacket({
              curve: this.bridge.corsCurve,
              color: '#10b981',
              label: '2. PUT /dados (Cross-Origin Autorizado!)',
              duration: 1.75
            });
          }, 550);
        }
      });
    };

    runCorsSequence();
    this.loop(runCorsSequence, 4800);
  }

  // =========================================================================
  // PASSO 11: Evolução HTTP/0.9, 1.0 e 1.1 (HoL) vs HTTP/2 (Multiplexação)
  // =========================================================================
  runStepEvolucaoH1H2() {
    setObjectVisible(this.bridge.mainBridge, false);
    setObjectVisible(this.bridge.h1h2Group, true);
  }

  // =========================================================================
  // PASSO 12: HTTP/3 (QUIC sobre UDP 0-RTT) & WebSockets (101)
  // =========================================================================
  runStepHttp3QuicWs() {
    setObjectVisible(this.bridge.mainBridge, false);
    setObjectVisible(this.bridge.h3Group, true);
    this.client.setPageRendered(true, 'HTTP/3 QUIC + WebSocket Tempo Real');
  }
}
