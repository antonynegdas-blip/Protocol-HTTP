# Protocolo HTTP em 3D — Passo a Passo Interativo (Vite + Three.js)

Visualização 3D interativa construída com **HTML5**, **CSS3**, **JavaScript (ES Modules)**, **Vite** e **Three.js** para demonstração passo a passo de todo o funcionamento do protocolo HTTP.

## Como rodar no VS Code

1. Extraia o arquivo `.zip` e abra a pasta `http-3d-vite` no **VS Code**.
2. Abra o terminal integrado (`Ctrl + '` ou `Ctrl + J`) e instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
4. Acesse o endereço exibido no terminal (normalmente `http://localhost:5173`).

## Controles na Apresentação

- **Botão `Próximo Passo →`** (ou teclas `→` / `Espaço`): avança para a próxima etapa 3D do protocolo HTTP.
- **Botão `← Anterior`** (ou tecla `←`): volta para o passo anterior.
- **Mouse / Touchpad**:
  - **Arrastar (botão esquerdo)**: gira a câmera 360° ao redor do modelo 3D.
  - **Scroll (roda do mouse)**: aproxima ou afasta o zoom.
  - **Arrastar (botão direito)**: move o enquadramento lateralmente.
- **Botões extras no topo**: repetir animação do passo atual, centralizar câmera e mostrar/ocultar rótulos 3D.

## Como publicar na Vercel

1. Suba esta pasta para um repositório no **GitHub** (ou use a Vercel CLI com `npx vercel`).
2. Na Vercel, clique em **Add New Project** e selecione o repositório.
3. A Vercel detectará automaticamente o **Vite** (`npm run build` -> pasta `dist`) e publicará com **HTTPS**, **HTTP/2** e **HTTP/3** ativados!
