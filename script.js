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

// Função para limpar o texto antes de enviar para a API
function limparTexto(texto) {
    return texto
        .replace(/\s+/g, ' ') // Remove espaços extras
        .replace(/[\n\r]/g, ' ') // Remove quebras de linha
        .trim(); // Remove espaços no início e fim
}

async function createSantaVideo(text) {
    try {
        console.log('Iniciando createSantaVideo');
        const videoContainer = document.getElementById('santa-video-container');
        const videoElement = document.getElementById('santa-video');
        const loadingIndicator = document.getElementById('santa-image');
        
        // Variável para controlar o estado do vídeo
        let shouldPlayVideo = true;
        
        if (!videoContainer) {
            console.error('Container de vídeo não encontrado');
            return;
        }

        console.log('Container encontrado:', videoContainer);
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // Limpar o vídeo existente
        if (videoElement) {
            videoElement.remove();
        }

        // Criar o elemento de vídeo
        const video = document.createElement('video');
        video.id = 'santa-video';
        
        // Log do estado inicial do vídeo
        console.log('Vídeo criado:', {
            width: video.width,
            height: video.height,
            readyState: video.readyState,
            networkState: video.networkState
        });

        // Estilo do vídeo
        Object.assign(video.style, {
            width: '100%',
            height: 'auto',
            maxWidth: '800px',
            maxHeight: '800px',
            display: 'block',
            margin: '0 auto',
            border: '2px solid #ff0000',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(255,0,0,0.3)',
            backgroundColor: '#ffffff',
            objectFit: 'cover'
        });
        
        // Configurar o vídeo
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.controls = true;
        
        // Eventos de debug
        video.onloadstart = () => console.log('Começou a carregar o vídeo');
        video.onloadeddata = () => console.log('Dados do vídeo carregados');
        video.onloadedmetadata = () => console.log('Metadados do vídeo carregados');
        video.onprogress = () => console.log('Progresso no carregamento do vídeo');
        video.onstalled = () => console.log('Carregamento do vídeo travou');
        video.onsuspend = () => console.log('Carregamento do vídeo suspenso');
        video.onwaiting = () => console.log('Vídeo aguardando dados');
        
        // Tentar primeiro o vídeo papainoel.mp4
        const source = document.createElement('source');
        source.src = './videos/papainoel2.mp4';
        source.type = 'video/mp4';
        video.appendChild(source);
        
        console.log('Source adicionada:', source.src);
        
        // Reproduzir o vídeo quando estiver pronto
        video.oncanplay = () => {
           
            if (videoContainer && loadingIndicator && shouldPlayVideo) {
                loadingIndicator.style.display = 'none';
                
                // Adicionar o vídeo ao container
                videoContainer.appendChild(video);
                console.log('Vídeo adicionado ao container');
                
                // Tentar reproduzir o vídeo
                if (shouldPlayVideo) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => console.log('Vídeo começou a reproduzir'))
                            .catch(error => {
                                if (error.name !== 'AbortError') {
                                    console.error('Erro ao reproduzir o vídeo:', error);
                                }
                            });
                    }
                }
            }
        };

        // Tratar erros do vídeo
        video.onerror = (e) => {
            const error = video.error;
            console.error('Erro ao carregar o vídeo:', {
                code: error ? error.code : 'unknown',
                message: error ? error.message : 'unknown',
                networkState: video.networkState,
                readyState: video.readyState
            });
            
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Tentar o outro vídeo
            if (source.src.includes('papainoel2.mp4')) {
                console.log('Tentando vídeo alternativo');
                source.src = './videos/painoel.mp4';
                video.load();
            } else {
                console.log('Usando fallback de imagem');
                useFallbackImage(videoContainer);
            }
        };

        // Função de fallback para usar imagem estática
        function useFallbackImage(container) {
            console.log('Iniciando fallback para imagem');
            const img = new Image();
            img.src = './images/papinoel3.jpg';
            
            Object.assign(img.style, {
                width: '100%',
                height: 'auto',
                maxWidth: '500px',
                display: 'block',
                margin: '0 auto',
                border: '2px solid #ff0000',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(255,0,0,0.3)'
            });
            
            container.innerHTML = '';
            container.appendChild(img);
            console.log('Imagem de fallback adicionada');
        }

        // Reproduzir o áudio
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.5;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        // Eventos de áudio
        utterance.onstart = () => {
            console.log('Áudio iniciado');
            shouldPlayVideo = true;
            if (video.paused && shouldPlayVideo) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => console.log('Vídeo iniciado com o áudio'))
                        .catch(error => {
                            if (error.name !== 'AbortError') {
                                console.error('Erro ao iniciar vídeo com áudio:', error);
                            }
                        });
                }
            }
        };
        
        utterance.onend = () => {
            console.log('Áudio finalizado');
            shouldPlayVideo = false;
            // Garantir que o vídeo pare imediatamente
            try {
                video.pause();
                video.currentTime = 0;
                console.log('Vídeo parado com sucesso');
            } catch (error) {
                console.error('Erro ao parar o vídeo:', error);
            }
            // Disparar confete
            dispararConfete();
        };
        
        // Adicionar evento para garantir que o vídeo pare
        video.addEventListener('timeupdate', () => {
            if (!shouldPlayVideo || speechSynthesis.speaking === false) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        speechSynthesis.speak(utterance);

    } catch (error) {
        console.error('Erro detalhado:', error);
        falar(text);
        
        const loadingIndicator = document.getElementById('santa-image');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
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
}

async function responder(resposta) {
    const questionContainer = document.getElementById('questionContainer');
    const resultadoSim = document.getElementById('resultadoSim');
    const resultadoNao = document.getElementById('resultadoNao');
    
    questionContainer.style.display = 'none';
    
    let textoVideo = '';
    
    if (resposta === 'sim') {
        resultadoSim.style.display = 'block';
        textoVideo = limparTexto(` HO HO HO HO HO! Olá ${nomeAtual}! Que alegria receber sua carta! 
    Quero muito saber se você tem sido uma criança boazinha, obediente e bem comportada? 
        Você pediu um presente bem legal ${presenteAtual}? Que pedido interessante! 
        Vou verificar se você tem se comportado bem este ano!
        Parabéns ${nomeAtual}! Você vai ganhar ${presenteAtual} do Papai Noel! 
            E já que você é uma criança tão boa, quero te convidar para algo muito especial!
            Em dezembro, teremos uma Live!
            Será um momento mágico onde podemos conversar.
            E voce tambem pode ajudar o papai noel a fazer muitas crianças sorrirem.
            Qualquer doação voluntária via Pix será muito bem-vinda.
            Vamos juntos espalhar amor e solidariedade neste Natal!
            
            
            `);
        dispararConfete();
    } else {
        resultadoNao.style.display = 'block';
        textoVideo = limparTexto(`HO HO HO HO HO! Olá ${nomeAtual}! 
            Que alegria receber sua carta! 
            Quero muito saber se você tem sido uma criança boazinha, obediente e bem comportada?
            Você pediu um presente bem legal ${presenteAtual}? Que pedido interessante! 
            Vou verificar se você tem se comportado bem este ano!
            Que pena ${nomeAtual} voce não tem se comportado bem, mas ainda dá tempo de melhorar! 
            O Papai Noel acredita em você!            
            E sabe de uma coisa? Você pode começar a melhorar agora mesmo!
            Em dezembro, teremos uma Live!
            Será um momento mágico onde podemos conversar.
            E voce tambem pode ajudar o papai noel a fazer muitas crianças sorrirem.
            Qualquer doação voluntária via Pix será muito bem-vinda.
            Vamos juntos espalhar amor e solidariedade neste Natal!
            
            `);
        criarLagrimas();
    }
    
    await createSantaVideo(textoVideo);
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
