let isPlaying = false;
const music = document.getElementById('christmasMusic');
const hohoho = document.getElementById('hohoho');
let nomeAtual = '';
let presenteAtual = '';
let selectedVoice = null;

// Função para carregar as vozes disponíveis
function carregarVozes() {
    const voiceSelect = document.getElementById('voiceSelect');
    
    // Limpa o select
    voiceSelect.innerHTML = '<option value="">Selecione uma voz</option>';
    
    // Obtém as vozes disponíveis
    let voices = window.speechSynthesis.getVoices();
    
    // Se não houver vozes ainda, tenta novamente em 100ms
    if (voices.length === 0) {
        setTimeout(carregarVozes, 100);
        return;
    }
    
    // Filtra vozes em português e português do Brasil
    const ptVoices = voices.filter(voice => 
        voice.lang.toLowerCase().includes('pt') || 
        voice.lang.toLowerCase().includes('por')
    );
    
    // Se não encontrar vozes em português, usa todas as vozes
    const voicesToUse = ptVoices.length > 0 ? ptVoices : voices;
    
    // Adiciona as vozes ao select
    voicesToUse.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    // Se houver apenas uma voz, seleciona ela automaticamente
    if (voicesToUse.length === 1) {
        voiceSelect.value = voicesToUse[0].name;
        selectedVoice = voicesToUse[0];
    }
}

// Inicializa as vozes quando a página carregar
window.speechSynthesis.onvoiceschanged = carregarVozes;
document.addEventListener('DOMContentLoaded', carregarVozes);

// Atualiza a voz selecionada
document.getElementById('voiceSelect').addEventListener('change', (e) => {
    const voices = window.speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.name === e.target.value);
    
    // Testa a voz selecionada
    if (selectedVoice) {
        const textoTeste = 'Olá! Esta é a voz que você selecionou.';
        falar(textoTeste);
    }
});

// Tenta carregar as vozes quando a página carregar
// document.addEventListener('DOMContentLoaded', () => {
//     carregarVozes();
//     // Alguns navegadores precisam deste evento
//     speechSynthesis.onvoiceschanged = carregarVozes;
// });

// Função para falar o texto
function falar(texto) {
    // Cancela qualquer fala anterior
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; // Velocidade um pouco mais lenta
    utterance.pitch = 1; // Tom de voz normal
    utterance.volume = 1; // Volume máximo
    
    // Se uma voz foi selecionada, usa ela
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    // Adiciona tratamento de erro
    utterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event);
    };
    
    utterance.onend = (event) => {
        console.log('Terminou de falar');
    };
    
    speechSynthesis.speak(utterance);
}

async function createSantaVideo(text) {
    const API_KEY = 'bWFydGUzMzk5QGdtYWlsLmNvbQ:_ZJplOUUJ-_ac7l5DgwI2';
    const sourceUrl = 'https://ogimg.infoglobo.com.br/in/23324147-126-f83/FT1086A/80364226_MANUAL-DE-CONDUTA-DO-PAPAI-NOELCurso-ensina-como-papai-noel-dome.jpg';

    try {
        // Criar o vídeo
        const response = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                script: {
                    type: 'text',
                    input: text,
                    provider: {
                        type: 'microsoft',
                        voice_id: 'pt-BR-AntonioNeural'
                    }
                },
                source_url: sourceUrl
            })
        });

        if (!response.ok) {
            throw new Error('Falha ao criar o vídeo');
        }

        const data = await response.json();
        
        // Aguardar o vídeo ficar pronto
        const videoId = data.id;
        let videoUrl = null;
        
        while (!videoUrl) {
            const statusResponse = await fetch(`https://api.d-id.com/talks/${videoId}`, {
                headers: {
                    'Authorization': `Basic ${API_KEY}`,
                }
            });
            
            const statusData = await statusResponse.json();
            
            if (statusData.status === 'done') {
                videoUrl = statusData.result_url;
            } else if (statusData.status === 'error') {
                throw new Error('Erro ao processar o vídeo');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Atualizar o elemento de vídeo
        const video = document.getElementById('santa-video');
        const loadingIndicator = document.getElementById('santa-image');
        
        video.src = videoUrl;
        video.style.display = 'block';
        loadingIndicator.style.display = 'none';
        
        return videoUrl;
    } catch (error) {
        console.error('Erro:', error);
        alert('Desculpe, houve um erro ao criar o vídeo do Papai Noel.');
    }
}

async function enviarCarta(event) {
    event.preventDefault();
    
    nomeAtual = document.getElementById('nome').value;
    presenteAtual = document.getElementById('presente').value;
    
    // Esconde o formulário
    document.getElementById('formContainer').style.display = 'none';
    
    // Mostra a pergunta sobre comportamento
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.style.display = 'block';
    
    // Atualiza a mensagem com o nome da criança
    document.getElementById('nomeDisplay').textContent = nomeAtual;
    
    // Toca o som do Papai Noel
    playHoHoHo();

    // Cria o texto para o vídeo
    const textoVideo = `HO HO HO! Olá ${nomeAtual}! Que alegria receber sua carta! 
        Você pediu um ${presenteAtual}? Que pedido interessante! 
        Vou verificar se você tem se comportado bem este ano!`;
    
    // Criar o vídeo do Papai Noel
    await createSantaVideo(textoVideo);

    // Fala o presente que a criança pediu
    const textoPresente = `HO HO HO HO HO! Feliz Natal! . 
        Hoje é um dia mágico, cheio de alegria, amor e surpresas incríveis! 
         Parabéns ${nomeAtual}! Se você continuar assim, pode ganhar ${presenteAtual} do Papai Noel!`.replace(/\n/g, ' ');
    
    // Divide o texto em partes menores para falar
    const partes = textoPresente.split('.');
    let delay = 1500; // Começa após o Ho Ho Ho

    // Fala cada parte do texto com um intervalo
    partes.forEach((parte, index) => {
        if (parte.trim()) {
            setTimeout(() => falar(parte.trim()), delay);
            delay += 5000; // Espera 5 segundos entre cada parte
        }
    });
}

function responder(resposta) {
    const questionContainer = document.getElementById('questionContainer');
    const resultadoSim = document.getElementById('resultadoSim');
    const resultadoNao = document.getElementById('resultadoNao');
    const mensagemSim = document.getElementById('mensagemSim');
    const mensagemNao = document.getElementById('mensagemNao');

    questionContainer.style.display = 'none';

    if (resposta === 'sim') {
        resultadoSim.style.display = 'block';
        const mensagem = `Parabéns ${nomeAtual}! Você vai ganhar ${presenteAtual} do Papai Noel!`;
        mensagemSim.textContent = mensagem;
        dispararConfete();
        falar(mensagem);
    } else {
        resultadoNao.style.display = 'block';
        const mensagem = `Que pena ${nomeAtual}, mas ainda dá tempo de melhorar! O Papai Noel acredita em você!`;
        mensagemNao.textContent = mensagem;
        criarLagrimas();
        falar(mensagem);
    }
}

function toggleMusic() {
    const musicBtn = document.querySelector('.music-btn');
    if (isPlaying) {
        music.pause();
        musicBtn.classList.remove('playing');
        musicBtn.textContent = ' Música de Natal';
    } else {
        music.play();
        musicBtn.classList.add('playing');
        musicBtn.textContent = ' Pausar Música';
        playHoHoHo();
    }
    isPlaying = !isPlaying;
}

function playHoHoHo() {
    hohoho.currentTime = 0;
    hohoho.play();
}

function dispararConfete() {
    const duracao = 3 * 1000;
    const cores = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    const fim = Date.now() + duracao;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: cores
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: cores
        });

        if (Date.now() < fim) {
            requestAnimationFrame(frame);
        }
    }());
}

function criarLagrimas() {
    const tearsContainer = document.querySelector('.tears-container');
    const numberOfTears = 50; 
    const screenWidth = window.innerWidth;

    function createTear() {
        const tear = document.createElement('div');
        tear.className = 'tear';
        
        // Posição horizontal aleatória
        tear.style.left = `${Math.random() * screenWidth}px`;
        
        // Duração da animação aleatória entre 2 e 4 segundos
        const duration = 2 + Math.random() * 2;
        tear.style.animation = `falling ${duration}s linear infinite`;
        
        // Atraso inicial aleatório
        tear.style.animationDelay = `${Math.random() * 2}s`;
        
        tearsContainer.appendChild(tear);
    }

    // Criar lágrimas iniciais
    for (let i = 0; i < numberOfTears; i++) {
        createTear();
    }

    // Continuar criando lágrimas enquanto o resultado estiver visível
    const tearInterval = setInterval(() => {
        if (document.getElementById('resultadoNao').style.display === 'none') {
            clearInterval(tearInterval);
            tearsContainer.innerHTML = ''; // Limpar todas as lágrimas
        } else {
            // Manter o número de lágrimas constante
            while (tearsContainer.children.length < numberOfTears) {
                createTear();
            }
        }
    }, 100);
}
