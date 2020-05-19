/* 
***************************************
***     IMPLEMENTAÇÃO DO JOGO:      ***
***************************************
*/

function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.barreiraSuperior = new Barreira(true)
    this.barreiraInferior = new Barreira(false)

    this.elemento.appendChild(this.barreiraSuperior.elemento)
    this.elemento.appendChild(this.barreiraInferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.barreiraSuperior.setAltura(alturaSuperior)
        this.barreiraInferior.setAltura(alturaInferior)
    }

    this.getPosicaoNoEixoX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setPosicaoNoEixoX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setPosicaoNoEixoX(x)
}

function Barreiras(altura, largura, abertura, espaco, velocidade, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    const deslocamento = parseInt(velocidade)
    this.animar = () => {
        this.pares.forEach(par => {
            par.setPosicaoNoEixoX(par.getPosicaoNoEixoX() - deslocamento)

            // quando o elemento sair da área do jogo
            if (par.getPosicaoNoEixoX() < -par.getLargura()) {
                par.setPosicaoNoEixoX(par.getPosicaoNoEixoX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getPosicaoNoEixoX() + deslocamento >= meio
                && par.getPosicaoNoEixoX() < meio

            if(cruzouOMeio) { 
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getPosicaoNoEixoY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setPosicaoNoEixoY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novaPosicaoNoEixoY = this.getPosicaoNoEixoY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novaPosicaoNoEixoY <= 0) {
            this.setPosicaoNoEixoY(0)
        } else if (novaPosicaoNoEixoY >= alturaMaxima) {
            this.setPosicaoNoEixoY(alturaMaxima)
        } else {
            this.setPosicaoNoEixoY(novaPosicaoNoEixoY)
        }
    }

    const posicaoInicial = () => this.setPosicaoNoEixoY(alturaJogo / 2)
    posicaoInicial()
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const ladoEsquerdoA = a.left
    const ladoDireitoA = a.left + a.width
    const ladoCimaA = a.top
    const ladoBaixoA = a.top + a.height

    

    const ladoEsquerdoB = b.left
    const ladoDireitoB =  b.left + b.width
    const ladoCimaB = b.top
    const ladoBaixoB = b.top + b.height

    const horizontal = ladoDireitoA >= ladoEsquerdoB
        && ladoDireitoB >= ladoEsquerdoA
    const vertical = ladoBaixoA >= ladoCimaB
        && ladoBaixoB >= ladoCimaA
    
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            colidiu = estaoSobrepostos(passaro.elemento, parDeBarreiras.barreiraSuperior.elemento)
                || estaoSobrepostos(passaro.elemento, parDeBarreiras.barreiraInferior.elemento)
        }
    })

    return colidiu
}


function FlappyBird(velocidade, espacamento) { 
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const distanciaEntreBarreiras = espacamento
    const espacoEntreBarreiras = 400

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, distanciaEntreBarreiras, espacoEntreBarreiras,
        velocidade, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()
            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 15);
    }
}

/* 
***************************************
***      IMPLEMENTAÇÃO PÁGINA       ***
***************************************
*/

const menu = document.querySelector('.menu')
const form = document.querySelector('[formMenu]')
const botao = form.querySelector('[iniciarJogo]')

function comecarJogo(e) {
    e.preventDefault()
    menu.style.transition = "all "
    menu.style.display = "none"
    const dificuldadeVelocidade = form.velocidade.value
    const dificuldadeEspacamento = form.espacamento.value

    new FlappyBird(dificuldadeVelocidade, dificuldadeEspacamento).start()
 }

botao.onclick = comecarJogo

