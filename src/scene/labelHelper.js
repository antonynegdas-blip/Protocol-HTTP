import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Cria um rótulo holográfico 3D padrão (título + subtítulo opcional).
 */
export function createTag3D(title, subtitle = '', accentColor = '#22d3ee') {
  const el = document.createElement('div');
  el.className = 'tag-3d';
  el.style.setProperty('--tag-accent', accentColor);

  const titleEl = document.createElement('span');
  titleEl.className = 'tag-3d__title';
  titleEl.textContent = title;
  el.appendChild(titleEl);

  const subEl = document.createElement('span');
  subEl.className = 'tag-3d__sub';
  subEl.textContent = subtitle;
  if (!subtitle) subEl.style.display = 'none';
  el.appendChild(subEl);

  const label = new CSS2DObject(el);
  label.userData = { el, titleEl, subEl };
  return label;
}

/**
 * Atualiza texto e cor de um rótulo 3D existente.
 */
export function updateTag3D(label, title, subtitle = '', accentColor = null) {
  if (!label || !label.userData) return;
  const { el, titleEl, subEl } = label.userData;
  titleEl.textContent = title;
  subEl.textContent = subtitle;
  subEl.style.display = subtitle ? '' : 'none';
  if (accentColor) {
    el.style.setProperty('--tag-accent', accentColor);
  }
}

/**
 * Cria uma placa 3D de camada anatômica (Request/Response explodido).
 */
export function createAnatomyTag(heading, codeText, color = '#22d3ee') {
  const el = document.createElement('div');
  el.className = 'anatomy-tag';
  el.style.setProperty('--layer-color', color);

  const headEl = document.createElement('div');
  headEl.className = 'anatomy-tag__head';
  headEl.textContent = heading;

  const codeEl = document.createElement('div');
  headEl.className = 'anatomy-tag__code';
  codeEl.textContent = codeText;

  el.appendChild(headEl);
  el.appendChild(codeEl);

  const label = new CSS2DObject(el);
  label.userData = { el, headEl, codeEl };
  return label;
}

/**
 * Cria uma mini etiqueta presa a um pacote 3D em movimento.
 */
export function createPacketBadge(text, color = '#22d3ee') {
  const el = document.createElement('div');
  el.className = 'packet-badge';
  el.style.setProperty('--pkt-color', color);
  el.textContent = text;

  const label = new CSS2DObject(el);
  label.userData = { el };
  return label;
}

/**
 * Alterna visibilidade de um Object3D/Group garantindo que qualquer CSS2DObject
 * filho também oculte/exiba seu elemento DOM imediatamente.
 */
export function setObjectVisible(root, visible) {
  if (!root) return;
  root.visible = visible;
  root.traverse((child) => {
    if (child.isCSS2DObject && child.element) {
      child.visible = visible;
      child.element.style.display = visible ? '' : 'none';
    }
  });
}
