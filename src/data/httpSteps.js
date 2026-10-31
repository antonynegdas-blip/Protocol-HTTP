export const HTTP_STEPS = [
  {
    id: 'arquitetura',
    tag: 'Camada de Aplicação • Portas 80 / 443',
    title: '1. O que é o HTTP e o Modelo Cliente-Servidor',
    caption:
      'O HTTP padroniza a troca de mensagens na Web: o Cliente (Navegador) sempre inicia o pedido (Request) e o Servidor Web processa e devolve o recurso (Response).',
    cameraPos: [0, 8.2, 23.5],
    cameraTarget: [0, 1.8, 0]
  },
  {
    id: 'tcp-stateless',
    tag: 'TCP Handshake • Stateless • Cookies & JWT',
    title: '2. Conexão TCP/IP, Protocolo Stateless e Sessão',
    caption:
      'Após o Handshake TCP (SYN → SYN-ACK → ACK), cada troca HTTP é Stateless (sem memória anterior). O chip dourado 3D representa Cookies/Tokens JWT mantendo a sessão.',
    cameraPos: [-3.5, 6.8, 19.5],
    cameraTarget: [-1.5, 2.0, 0]
  },
  {
    id: 'request-anatomy',
    tag: 'Request Line • Headers • \\r\\n • Body',
    title: '3. Anatomia 3D de uma Requisição (HTTP Request)',
    caption:
      'O pacote de requisição abre-se em 4 camadas físicas: (1) Linha de Início, (2) Cabeçalhos de metadados, (3) Linha em branco delimitadora e (4) Corpo (Body JSON).',
    cameraPos: [-2.8, 5.4, 13.8],
    cameraTarget: [-2.2, 3.6, 0]
  },
  {
    id: 'metodos-http',
    tag: 'Verbos HTTP • Safe • Idempotência',
    title: '4. Métodos HTTP Atuando nos Recursos 3D',
    caption:
      'Verbos definem a ação no servidor: GET/HEAD/OPTIONS são Seguros (apenas leitura); GET, PUT e DELETE são Idempotentes; POST cria novos cubos de dados a cada envio.',
    cameraPos: [3.2, 6.6, 17.8],
    cameraTarget: [3.8, 2.3, 0],
    subActions: [
      { id: 'GET', label: 'GET (Safe/Idemp.)', color: '#22d3ee' },
      { id: 'POST', label: 'POST (Criar)', color: '#10b981' },
      { id: 'PUT', label: 'PUT (Substituir)', color: '#a855f7' },
      { id: 'PATCH', label: 'PATCH (Parcial)', color: '#f59e0b' },
      { id: 'DELETE', label: 'DELETE (Remover)', color: '#ef4444' },
      { id: 'HEAD', label: 'HEAD (Só Headers)', color: '#38bdf8' },
      { id: 'OPTIONS', label: 'OPTIONS / CONNECT / TRACE', color: '#eab308' }
    ]
  },
  {
    id: 'response-anatomy',
    tag: 'Status Line • Response Headers • Body',
    title: '5. Anatomia 3D da Resposta (HTTP Response)',
    caption:
      'O servidor monta a cápsula de resposta em 4 partes (HTTP/1.1 200 OK + Headers + Linha em branco + Payload HTML/JSON) e o navegador renderiza a página holográfica 3D.',
    cameraPos: [1.8, 5.4, 14.5],
    cameraTarget: [0.8, 3.4, 0]
  },
  {
    id: 'status-codes',
    tag: 'Classes 1xx • 2xx • 3xx • 4xx • 5xx',
    title: '6. Códigos de Status HTTP em Ação',
    caption:
      '1xx Informativo (pulso), 2xx Sucesso (entrega limpa), 3xx Redirecionamento (desvio 3D ao nó espelho), 4xx Erro do Cliente (escudo bloqueia) e 5xx Falha interna no Servidor.',
    cameraPos: [1.5, 8.0, 20.5],
    cameraTarget: [2.2, 2.4, -1.0],
    subActions: [
      { id: 'ALL', label: 'Ciclo Completo', color: '#22d3ee' },
      { id: '1xx', label: '1xx (100/101 Info)', color: '#38bdf8' },
      { id: '2xx', label: '2xx (200/201/204 OK)', color: '#10b981' },
      { id: '3xx', label: '3xx (301/302 Desvio)', color: '#f59e0b' },
      { id: '4xx', label: '4xx (401/403/404 Escudo)', color: '#fb7185' },
      { id: '5xx', label: '5xx (500/503 Pane)', color: '#ef4444' }
    ]
  },
  {
    id: 'headers-cache',
    tag: 'Accept • gzip • Cache-Control • ETag (304)',
    title: '7. Cabeçalhos, Negociação e Cache Inteligente',
    caption:
      'Headers negociam idioma/compressão (gzip) e ativam o Domo de Cache 3D local: o cliente valida o hash ETag (If-None-Match) e recebe 304 Not Modified sem rebaixar o corpo!',
    cameraPos: [-5.2, 6.2, 16.5],
    cameraTarget: [-5.0, 2.2, 0.5]
  },
  {
    id: 'http-inseguro',
    tag: 'Porta 80 • Texto Plano • Sniffing & MitM',
    title: '8. Vulnerabilidade do HTTP Puro (Sem Criptografia)',
    caption:
      'Em HTTP puro os pacotes viajam abertos em texto plano: o Drone Interceptador (Man-in-the-Middle) consegue espionar senhas/cookies (Sniffing) e adulterar dados na rede.',
    cameraPos: [0, 7.6, 18.5],
    cameraTarget: [0, 3.2, 0]
  },
  {
    id: 'https-tls',
    tag: 'Porta 443 • TLS • Certificado CA • Cadeado 3D',
    title: '9. HTTPS: Túnel Criptografado TLS & Tríade de Segurança',
    caption:
      'O Certificado Digital (CA) e o Handshake TLS erguem um túnel hexagonal blindado: garante Confidencialidade, Integridade e Autenticidade, repelindo o laser espião!',
    cameraPos: [0, 7.4, 19.2],
    cameraTarget: [0, 2.8, 0]
  },
  {
    id: 'cors-preflight',
    tag: 'Same-Origin Policy • OPTIONS Preflight • CORS',
    title: '10. CORS e Requisição Prévia (Preflight OPTIONS)',
    caption:
      'Ao acessar uma API de outra origem (Torre Externa 3D), o navegador envia primeiro uma sonda OPTIONS (Preflight); o header Access-Control-Allow-Origin abre o portal laser.',
    cameraPos: [-1.5, 9.8, 21.5],
    cameraTarget: [1.5, 2.2, -3.8]
  },
  {
    id: 'evolucao-h1-h2',
    tag: 'HTTP/0.9 & 1.0 → HTTP/1.1 (HoL) vs HTTP/2 (HPACK)',
    title: '11. Evolução: Fila Travada no HTTP/1.1 vs. Multiplexação HTTP/2',
    caption:
      'Na pista frontal (HTTP/1.1 Keep-Alive), um pacote pesado trava toda a fila (Head-of-Line Blocking). Na pista traseira (HTTP/2), frames binários viajam multiplexados em paralelo.',
    cameraPos: [0, 9.5, 19.8],
    cameraTarget: [0, 2.0, 0]
  },
  {
    id: 'http3-quic-ws',
    tag: 'HTTP/3 (QUIC / UDP 0-RTT) & WebSockets (101)',
    title: '12. Estado da Arte: HTTP/3 (QUIC/UDP) & WebSockets',
    caption:
      'O HTTP/3 usa fluxos independentes QUIC sobre UDP (0-RTT, zero bloqueio entre fluxos e troca Wi-Fi/5G sem queda). Abaixo, o canal WebSocket (101) opera em tempo real bidirecional!',
    cameraPos: [0, 8.8, 21.8],
    cameraTarget: [0, 2.6, 0]
  }
];
