# 📖 Manual de Recursos e Possibilidades do Bot WhatsApp

Este manual apresenta tudo o que você pode fazer com este bot utilizando a biblioteca [whatsapp-web.js](file:///c:/Users/USER/Desktop/whatsapp-web/whatsapp-web.js/package.json), desde os comandos já prontos no arquivo [example.js](file:///c:/Users/USER/Desktop/whatsapp-web/whatsapp-web.js/example.js) até recursos avançados de automação.

---

## 🚀 1. Comandos Já Prontos para Testar (`example.js`)

Ao enviar uma mensagem no WhatsApp para o número conectado (ou em um grupo onde ele esteja), você pode testar estes comandos imediatamente:

| Comando | O que o Bot faz |
| :--- | :--- |
| `!ping` | Responde com `pong`. |
| `!chats` | Retorna a lista dos seus chats e grupos abertos. |
| `!info` | Retorna informações do cliente (nome, número conectado, plataforma). |
| `!mediainfo` *(em resposta a uma mídia)* | Analisa e retorna tamanho, tipo MIME e metadados de fotos/vídeos. |
| `!quoteinfo` *(em resposta a uma mensagem)* | Exibe quem enviou a mensagem citada, data e ID. |
| `!resendmedia` *(em resposta a uma foto/áudio)* | Baixa a mídia da mensagem marcada e reenvia de volta. |
| `!location` | Envia uma localização geográfica pré-definida. |
| `!status <seu texto>` | Atualiza o seu status/recado do perfil do WhatsApp. |
| `!delete` *(em resposta a uma mensagem do bot)* | Apaga a mensagem para todos ("Delete for Everyone"). |
| `!pin` / `!unpin` | Fixa ou desafixa a mensagem na conversa. |
| `!clear` | Limpa as mensagens da conversa atual. |

---

## 🛠️ 2. O que mais você pode automatizar?

### 📩 Mensagens e Interações
* **Auto-atendimento / FAQ Inteligente:** Responder automaticamente a palavras-chave (ex: *"preço"*, *"horário"*, *"suporte"*).
* **Integração com IA (ChatGPT / Gemini):** Conectar a uma API de IA para manter diálogos humanizados com clientes.
* **Envio de Enquetes (Polls):** Criar enquetes interativas com múltiplas opções e coletar os votos dos participantes em tempo real.
* **Mensagens com Formatação:** Negrito, itálico, listas, menções (`@fulano`), botões e links com preview.

---

### 🖼️ Mídias, Áudios e Documentos
* **Envio de PDFs e Faturas:** Disparar boletos, notas fiscais, relatórios em PDF automaticamente.
* **Criador de Figurinhas (Stickers):** Converter qualquer imagem ou vídeo enviado pelo usuário em figurinha do WhatsApp (`sendSeen`, conversão com webp).
* **Mensagens de Áudio PTT:** Enviar arquivos de áudio gravados como se tivessem sido gravados pelo microfone na hora.
* **Transcrições de Áudio:** Ouvir áudios recebidos e transcrever para texto usando serviços de IA/Speech-to-Text.

---

### 👥 Gerenciamento de Grupos
* **Boas-vindas automáticas:** Enviar mensagem de recepção com regras do grupo assim que alguém entrar.
* **Controle de Membros:** Adicionar, remover, promover a administrador ou rebaixar membros.
* **Moderação Automática:** Apagar mensagens proibidas (ex: spam de links, palavras de baixo calão) e banir infratores.
* **Marcar Todos:** Mencionar todos os membros do grupo de uma vez (`@everyone`).
* **Alterar Dados do Grupo:** Atualizar foto, descrição, nome e permissões de quem pode enviar mensagens.

---

### 🏢 Casos de Uso Empresariais e Práticos
* **Notificações de Sistemas / Webhooks:** Alertas de compras no e-commerce, alertas de servidores fora do ar, confirmações de pedidos.
* **Disparos em Massa Personalizados:** Avisos com nome personalizado do cliente e dados específicos.
* **Agendamento de Mensagens:** Lembretes de consultas, aniversários ou pagamentos futuros.
* **Exportação e Backup:** Salvar mensagens, contatos ou relatórios de atendimento em planilhas Excel ou bancos de dados (PostgreSQL, SQLite, MongoDB).

---

## ⚙️ 3. Exemplo Rápido de Código Customizado

Se você quiser criar o seu próprio arquivo (por exemplo, `meubot.js`), a estrutura básica é muito simples:

```javascript
const { Client, LocalAuth } = require('./index');

// LocalAuth salva a sessão para não precisar escanear o QR Code toda vez!
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false } // mude para true se quiser ocultar a janela do navegador
});

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code que apareceu na tela.');
});

client.on('ready', () => {
    console.log('Bot conectado com sucesso!');
});

// Responder a mensagens recebidas
client.on('message', async (msg) => {
    if (msg.body.toLowerCase() === 'olá' || msg.body.toLowerCase() === 'oi') {
        await msg.reply('Olá! Sou um assistente automatizado. Como posso te ajudar hoje?');
    }

    if (msg.body === '!suporte') {
        await client.sendMessage(msg.from, 'Nosso horário de suporte é de Seg a Sex, das 09h às 18h.');
    }
});

client.initialize();
```

---

> [!TIP]
> **Modo Invisível (Headless):** Quando colocar o bot em produção ou no servidor, você pode alterar `headless: true` nas opções do Puppeteer para que o navegador rode em segundo plano sem ocupar tela.
