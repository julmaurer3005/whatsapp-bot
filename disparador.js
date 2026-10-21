const fs = require('fs');
const xlsx = require('xlsx');
const { Client, LocalAuth } = require('./index');

/**
 * ==============================================================================
 * DISPARADOR INTELIGENTE DE REMARKETING (MULTI-MENSAGENS CONFIGURÁVEIS)
 * ==============================================================================
 */

const ARQUIVO_PLANILHA = './alunos_modelo.xlsx';
const ARQUIVO_CONFIG = './config_mensagens.json';

// Carrega as configurações do arquivo JSON
function carregarConfiguracao() {
    if (!fs.existsSync(ARQUIVO_CONFIG)) {
        throw new Error(`Arquivo de configuração "${ARQUIVO_CONFIG}" não encontrado!`);
    }
    const raw = fs.readFileSync(ARQUIVO_CONFIG, 'utf-8');
    return JSON.parse(raw);
}

const config = carregarConfiguracao();

// Utilitários de tempo
const aguardar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const delayAleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Extrai os últimos 8 dígitos do telefone para matching flexível
function extrairFinalTelefone(telefone) {
    if (!telefone) return '';
    const limpo = telefone.toString().replace(/\D/g, '');
    return limpo.slice(-8);
}

// Substitui as variáveis {nome}, {escola}, {curso_anterior}, {novo_curso} no modelo de texto
function formatarTextoMensagem(template, aluno, config) {
    const primeiroNome = aluno.Nome ? aluno.Nome.trim().split(' ')[0] : 'aluno(a)';
    const cursoAnterior = aluno.CursoAnterior || 'nosso curso anterior';
    const escola = config.nome_da_escola || 'nossa escola';
    const novoCurso = config.novo_curso || 'nosso novo curso';

    return template
        .replace(/\{nome\}/gi, primeiroNome)
        .replace(/\{escola\}/gi, escola)
        .replace(/\{curso_anterior\}/gi, cursoAnterior)
        .replace(/\{novo_curso\}/gi, novoCurso);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
    }
});

client.on('qr', () => {
    console.log('📌 Por favor, escaneie o QR Code que apareceu no navegador.');
});

client.on('ready', async () => {
    console.log('✅ Bot conectado com sucesso!');
    console.log(`📝 Modo: Envio de ${config.mensagens.length} mensagens consecutivas por aluno.`);
    console.log('⏳ Carregando mapa de conversas e contatos...');

    const chats = await client.getChats();
    const chatsPrivados = chats.filter((c) => !c.isGroup);
    console.log(`💬 Total de conversas privadas carregadas: ${chatsPrivados.length}`);

    // Mapear todos os LIDs para seus respectivos números de telefone reais
    const lidChats = chatsPrivados.filter((c) => c.id._serialized.endsWith('@lid'));
    const lidIds = lidChats.map((c) => c.id._serialized);

    console.log(`🔍 Mapeando ${lidIds.length} identificadores LID para números de telefone...`);
    const mapaTelefonesParaChat = new Map();

    // Mapeia conversas normais (@c.us)
    for (const chat of chatsPrivados) {
        if (chat.id._serialized.endsWith('@c.us')) {
            const final = extrairFinalTelefone(chat.id.user);
            if (final) mapaTelefonesParaChat.set(final, chat);
        }
    }

    // Mapeia conversas @lid usando getContactLidAndPhone
    try {
        const mappings = await client.getContactLidAndPhone(lidIds);
        for (const m of mappings) {
            if (m.lid && m.pn) {
                const final = extrairFinalTelefone(m.pn);
                const chatCorrespondente = lidChats.find((c) => c.id._serialized === m.lid);
                if (final && chatCorrespondente) {
                    mapaTelefonesParaChat.set(final, chatCorrespondente);
                }
            }
        }
    } catch (e) {
        console.warn('Aviso ao mapear LIDs:', e.message);
    }

    console.log(`🗺️ Total de números vinculados com sucesso: ${mapaTelefonesParaChat.size}`);
    console.log('📂 Lendo planilha de alunos...');

    if (!fs.existsSync(ARQUIVO_PLANILHA)) {
        console.error(`❌ Arquivo "${ARQUIVO_PLANILHA}" não encontrado!`);
        return;
    }

    const workbook = xlsx.readFile(ARQUIVO_PLANILHA);
    const sheetName = workbook.SheetNames[0];
    const alunos = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`📋 Total de alunos na planilha: ${alunos.length}\n`);

    let enviados = 0;
    let falhas = 0;

    for (let i = 0; i < alunos.length; i++) {
        const aluno = alunos[i];
        const finalTel = extrairFinalTelefone(aluno.Telefone);

        if (!finalTel) {
            console.log(`⚠️ [PULADO] Contato sem telefone válido: ${aluno.Nome || 'Sem Nome'}`);
            falhas++;
            continue;
        }

        console.log(`➡️ [${i + 1}/${alunos.length}] Processando ${aluno.Nome} (${aluno.Telefone})...`);

        // Busca o chat pelo telefone mapeado
        let chatDestino = mapaTelefonesParaChat.get(finalTel);

        // Se não achou pelo telefone, tenta por nome aproximado
        if (!chatDestino && aluno.Nome) {
            chatDestino = chatsPrivados.find(
                (c) => c.name && c.name.toLowerCase().includes(aluno.Nome.toLowerCase().trim()),
            );
        }

        try {
            if (!chatDestino) {
                console.log(`   ⚠️ [PULADO] Não há conversa iniciada no seu WhatsApp para o número final ${finalTel}.`);
                falhas++;
                continue;
            }

            console.log(`   🎯 Conversa identificada: "${chatDestino.name}" (ID: ${chatDestino.id._serialized})`);

            // Dispara as mensagens configuradas em sequência para este aluno
            for (let m = 0; m < config.mensagens.length; m++) {
                const template = config.mensagens[m];
                const textoFormatado = formatarTextoMensagem(template, aluno, config);

                // Simula digitação humana antes de enviar cada frase
                try {
                    await chatDestino.sendStateTyping();
                    await aguardar(delayAleatorio(2000, 3500));
                    await chatDestino.clearState();
                } catch (_) {}

                const resultado = await chatDestino.sendMessage(textoFormatado);

                if (!resultado) {
                    throw new Error(`Falha no envio da mensagem ${m + 1}`);
                }

                console.log(`      💬 [Msg ${m + 1}/${config.mensagens.length}] Enviada: "${textoFormatado.slice(0, 35)}..."`);

                // Delay entre mensagens para o mesmo aluno (exceto após a última)
                if (m < config.mensagens.length - 1) {
                    const delayMesmoAluno = delayAleatorio(
                        (config.delay_entre_mensagens_do_mesmo_aluno_segundos?.min || 3) * 1000,
                        (config.delay_entre_mensagens_do_mesmo_aluno_segundos?.max || 6) * 1000
                    );
                    await aguardar(delayMesmoAluno);
                }
            }

            console.log(`   ✔️ Todas as mensagens foram entregues para ${aluno.Nome}!`);
            enviados++;
        } catch (error) {
            console.error(`   ❌ Falha ao enviar para ${aluno.Nome}:`, error.message);
            falhas++;
        }

        // Delay anti-banimento entre alunos diferentes
        if (i < alunos.length - 1) {
            const cadaQuantos = config.pausa_de_seguranca?.a_cada_quantos_alunos || PAUSA_A_CADA_ENVIOS;
            const pausaMinutos = config.pausa_de_seguranca?.tempo_pausa_minutos || 2;

            if ((i + 1) % cadaQuantos === 0) {
                console.log(`\n☕ Pausa de segurança de ${pausaMinutos} minutos para evitar bloqueio...`);
                await aguardar(pausaMinutos * 60 * 1000);
            } else {
                const tempoEspera = delayAleatorio(
                    (config.delay_entre_alunos_segundos?.min || 15) * 1000,
                    (config.delay_entre_alunos_segundos?.max || 30) * 1000
                );
                console.log(`⏳ Aguardando ${(tempoEspera / 1000).toFixed(0)} segundos até o próximo aluno...\n`);
                await aguardar(tempoEspera);
            }
        }
    }

    console.log('\n======================================');
    console.log(`🎉 Disparos concluídos!`);
    console.log(`✅ Alunos atendidos: ${enviados}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log('======================================');
});

client.initialize();
