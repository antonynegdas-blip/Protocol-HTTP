import { HTTP_STEPS } from './data/httpSteps.js';
import { SceneManager } from './scene/SceneManager.js';
import { ClientModel } from './scene/models/ClientModel.js';
import { ServerModel } from './scene/models/ServerModel.js';
import { NetworkBridge } from './scene/models/NetworkBridge.js';
import { PacketSystem } from './scene/models/PacketSystem.js';
import { StepAnimator } from './scene/StepAnimator.js';
import { ControlsUI } from './ui/ControlsUI.js';

function bootstrap() {
  const container = document.getElementById('scene-container');
  const sceneManager = new SceneManager(container);

  // Modelos 3D modulares da arquitetura HTTP
  const client = new ClientModel(sceneManager.scene);
  const server = new ServerModel(sceneManager.scene);
  const bridge = new NetworkBridge(sceneManager.scene);
  const packets = new PacketSystem(sceneManager.scene);

  // Loop de atualização contínua dos modelos 3D
  sceneManager.onUpdate((dt, elapsed) => {
    client.update(dt, elapsed);
    server.update(dt, elapsed);
    bridge.update(dt, elapsed);
    packets.update(dt, elapsed);
  });

  // Coreógrafo passo a passo das 12 etapas do protocolo HTTP
  const stepAnimator = new StepAnimator({
    sceneManager,
    client,
    server,
    bridge,
    packets,
    steps: HTTP_STEPS
  });

  // Interface minimalista de navegação Passo a Passo
  new ControlsUI({
    steps: HTTP_STEPS,
    stepAnimator,
    sceneManager
  });

  // Inicia no Passo 1
  stepAnimator.goToStep(0, false);
}

bootstrap();
