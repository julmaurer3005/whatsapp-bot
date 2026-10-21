# 🚀 Manual do Usuário: Disparador Automático de WhatsApp
*Guia passo a passo para pessoas com zero experiência técnica.*

---

## 📌 O que você precisa saber antes de começar
Este sistema foi criado para automatizar o envio de mensagens de remarketing para alunos no WhatsApp, enviando **3 mensagens seguidas** com pausas e simulação de digitação (como se fosse uma pessoa de verdade conversando).

Tudo o que você precisa fazer no dia a dia é:
1. **Preencher a planilha de alunos.**
2. **Escrever as mensagens que quer mandar.**
3. **Dar 2 cliques no ícone para iniciar.**

---

## 🛠️ PASSO 1: Preparando o Computador (Feito Apenas 1 Vez)

Se o computador onde o robô vai rodar ainda não tiver o Node.js instalado:

1. Acesse o site oficial: **[https://nodejs.org/](https://nodejs.org/)**
2. Baixe a versão recomendada (**LTS**) e instale normalmente clicando em *"Avançar / Next"* até concluir.
3. Na pasta do robô, abra o terminal e digite apenas uma vez:
   ```bash
   npm install
   ```
   *(Isso baixa os arquivos necessários do sistema).*

---

## 📋 PASSO 2: Como Preencher a Planilha de Alunos

Abra o arquivo **`alunos_modelo.xlsx`** (no Excel ou Google Planilhas).

Preencha as 3 colunas:
| Nome | Telefone | CursoAnterior |
| :--- | :--- | :--- |
| **João Silva** | `5555999998888` | Design Gráfico |
| **Maria Oliveira** | `5555988887777` | Marketing Digital |

### ⚠️ Dicas Importantes para o Telefone:
* Pode colocar com traços, parênteses ou espaços (ex: `(55) 99999-8888` ou `5555999998888`), o sistema limpa sozinho!
* **Apenas garanta que o DDD da cidade esteja no número.**
* Salve e feche o Excel antes de iniciar o robô.

---

## ✍️ PASSO 3: Como Configurar as Mensagens

Abra o arquivo **`config_mensagens.json`** (você pode abrir com o Bloco de Notas ou VS Code).

Ele é bem intuitivo e se parece com isso:

```json
{
  "nome_da_escola": "Sua Escola Aqui",
  "novo_curso": "Edição de Vídeo Avançada",
  "mensagens": [
    "Olá, {nome}! Tudo bem? 😊",
    "Aqui é da {escola}, onde você fez o curso de {curso_anterior}.",
    "Estamos abrindo uma nova turma para o curso de *{novo_curso}* e separamos uma condição exclusiva para ex-alunos! Gostaria de receber mais detalhes? 🚀"
  ]
}
```

### Palavras Mágicas que Você Pode Usar no Texto:
O robô troca automaticamente no momento do envio:
* **`{nome}`** $\rightarrow$ Troca pelo primeiro nome do aluno da planilha (ex: *João*).
* **`{curso_anterior}`** $\rightarrow$ Troca pelo curso que ele fez (coluna do Excel).
* **`{escola}`** $\rightarrow$ Troca pelo nome da sua escola que você colocou no topo.
* **`{novo_curso}`** $\rightarrow$ Troca pelo novo curso que você está oferecendo.

> **💡 Dica:** Se quiser mandar apenas 2 mensagens em vez de 3, basta apagar uma das frases dentro do arquivo.

---

## ▶️ PASSO 4: Como Rodar o Robô no Dia a Dia

Para facilitar, criei um atalho de dois cliques:

1. Na pasta do projeto, dê um **duplo clique no arquivo:**
   👉 **`INICIAR_DISPARADOR.bat`**
2. Uma janela preta vai abrir e, em seguida, uma janela do **Google Chrome / WhatsApp Web** vai se abrir na tela.
3. **Se for a primeira vez:**
   * Pegue o celular da escola, vá em **WhatsApp > Aparelhos Conectados > Conectar Aparelho**.
   * Aponte a câmera para o QR Code na tela.
   * *Você só precisa fazer isso uma vez! Nas próximas vezes ele já entra conectado direto.*
4. O robô vai:
   - Carregar a planilha.
   - Encontrar a conversa de cada aluno.
   - Digitar por alguns segundos.
   - Enviar a mensagem 1, esperar um pouco, enviar a mensagem 2 e depois a 3.
   - Fazer uma pausa de segurança antes de passar para o próximo aluno.
5. Quando terminar toda a planilha, o terminal avisará: **`🎉 Disparos concluídos!`**.

---

## 🛡️ Dicas de Segurança e Boas Práticas (Evitar Bloqueios)
* **Não diminua os tempos de espera:** O robô já está configurado para esperar de 15 a 30 segundos entre cada aluno e fazer pausas a cada 15 envios. Esse intervalo é o que protege o seu chip de ser bloqueado pela Meta.
* **Quantidade diária recomendada:** Evite disparar para mais de 100 a 150 contatos novos por dia no mesmo número.
