// javascript.js — lógica do sorteio com animação tipo caça-níqueis
document.addEventListener('DOMContentLoaded', function () {
  const datetimeEl = document.getElementById('datetime');
  const odometerEl = document.getElementById('odometer');
  const drawBtn = document.getElementById('drawBtn');
  const odometerWrap = document.querySelector('.odometer-wrap');
  // máximo fixo conforme solicitado
  const FIXED_MAX = 100;
  // winners state
  const winners = [];
  const winnerEls = [
    document.getElementById('winner1'),
    document.getElementById('winner2'),
    document.getElementById('winner3')
  ];
  const finalMessageEl = document.getElementById('finalMessage');

  // Mapeamento de números vendidos (fornecido pelo usuário)
  const soldByOwner = {
    "Priscila": [17, 33, 57, 65, 82, 59],
    "Mayk": [21],
    "Keyla": [5, 8, 24, 68, 15, 35],
    "Ana Lívia": [2],
    "Ketlyn": [18],
    "Fabio": [45, 60],
    "Adriana": [10, 20, 30, 40, 50],
    "Fabinho": [1],
    "Carmem": [7, 14, 28, 38, 58],
    "Irmão Priscila": [11, 29],
    "Katia": [25, 66, 55],
    "Junior (irmão Priscila)": [69, 85],
    "Gabriely": [100],
    "Gustavo": [13],
    "Kenia": [46],
    "Agrônomo": [23],
    "Aloísio": [87],
    "Marco Túlio": [48, 80, 49],
    "Weverton": [88],
    "Erica": [22, 96],
    "Izabella": [97, 44, 70],
    "Gustavo Tamandaré": [64],
    "Debora": [9, 16],
    "Aldery": [47, 77],
    "João Marcos": [19],
    "María": [99],
    "Paulão": [89, 12],
    "Graziele": [6],
    "Palmeiras": [3, 4],
    "Lu": [37],
    "Joana": [34],
    "Darielle": [92],
    "Janaina": [42, 27],
    "JF INPORTS": [90],
    "Eduardo": [95],
    "Isabella Gonçalves": [26],
    "Val": [67],
    "Ana Maria": [94]
  };

  // inverter mapeamento para consultar por número -> proprietário
  const soldMap = new Map();
  Object.keys(soldByOwner).forEach(owner => {
    const nums = soldByOwner[owner] || [];
    nums.forEach(n => soldMap.set(Number(n), owner));
  });

  // helper: escape simples para inserir texto em innerHTML com segurança
  function escapeHtml(str){
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function updateDateTime(){
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    const str = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    datetimeEl.textContent = str;
  }
  updateDateTime();
  setInterval(updateDateTime,1000);


  // gera série de timeouts com delays crescentes para simular a desaceleração
  function spinTo(finalNumber, maxValue){
    return new Promise((resolve)=>{
      // iniciar efeitos visuais
      odometerEl.classList.add('rolling');
      odometerWrap && odometerWrap.classList.add('highlight');
      drawBtn.classList.add('rolling');
      drawBtn.disabled = true;

      let elapsed = 0;
      let delay = 40; // tempo entre trocas, inicia rápido
      const minSpin = 900; // tempo mínimo do spin
      const maxSpin = 3000; // tempo máximo do spin
      const targetSpin = Math.floor(minSpin + Math.random()*(maxSpin-minSpin));

      function step(){
        // troca número para um aleatório temporário
        const r = Math.floor(1 + Math.random()*maxValue);
        odometerEl.textContent = r;

        elapsed += delay;
        // aumento progressivo do delay para desacelerar
        delay = Math.min(400, Math.round(delay * (1 + 0.03 + Math.random()*0.06)));

        if (elapsed < targetSpin){
          setTimeout(step, delay);
        } else {
          // pequena sequência de passos finais para dar sensação de frenagem
          const finalSteps = 6;
          let i = 0;
          function finalStep(){
            if (i < finalSteps - 1){
              // mostrar números próximos ao final (ou aleatórios) e aumentar delay
              const near = Math.floor(1 + Math.random()*maxValue);
              odometerEl.textContent = near;
              delay = Math.min(700, Math.round(delay * 1.6));
              i++; setTimeout(finalStep, delay);
            } else {
              // mostrar o número final
              odometerEl.textContent = finalNumber;
              odometerEl.classList.remove('rolling');
              // efeito de resultado
              odometerEl.classList.add('pulse');
              odometerWrap && odometerWrap.classList.remove('highlight');
              drawBtn.classList.remove('rolling');
              drawBtn.classList.add('result');
              resolve();
            }
          }
          setTimeout(finalStep, delay);
        }
      }
      step();
    });
  }

  async function doDraw(){
    if (winners.length >= 3) return; // já completado

    const max = FIXED_MAX;
    // proteção: se já usamos todos os números possíveis, interrompe
    if (winners.length >= max) {
      drawBtn.disabled = true;
      return;
    }

    // escolher número único (evita duplicatas)
    let chosen;
    let attempts = 0;
    do {
      chosen = Math.floor(1 + Math.random() * max);
      attempts++;
      // em caso improvável de muitas tentativas (quando o espaço está quase cheio),
      // podemos optar por gerar uma lista de números restantes — aqui apenas protegemos de loop infinito
      if (attempts > 1000) break;
    } while (winners.includes(chosen));

    // iniciar spin e aguardar resultado
    await spinTo(chosen, max);

    // verificar se o número foi vendido
    const owner = soldMap.get(Number(chosen));
    if (!owner) {
      // número não vendido — informar o usuário e permitir novo sorteio
      const msg = `Número ${chosen} não foi vendido, sortear novamente`;
      if (finalMessageEl){
        finalMessageEl.textContent = msg;
        finalMessageEl.hidden = false;
        setTimeout(()=> finalMessageEl.classList.add('show'), 30);
      } else {
        alert(msg);
      }
      // reabilitar botão para novo sorteio
      drawBtn.disabled = false;
      // limpar efeitos visuais após curto período
      setTimeout(()=>{
        drawBtn.classList.remove('result');
        odometerEl.classList.remove('pulse');
        if (finalMessageEl){ finalMessageEl.classList.remove('show'); finalMessageEl.hidden = true; }
      }, 3000);
      return; // não contar como vencedor
    }

    // preencher próximo slot (número vendido)
    winners.push(chosen);
    const idx = winners.length - 1;
    if (winnerEls[idx]) {
      // mostrar número com cor diferente e nome em negrito
      const safeOwner = owner ? escapeHtml(owner) : '';
      winnerEls[idx].innerHTML = owner
        ? `<span class="winner-number">${chosen}</span> <span class="winner-sep">—</span> <strong class="winner-owner">${safeOwner}</strong>`
        : `<span class="winner-number">${chosen}</span>`;
    }

    // se tiver completado 3 sorteios, mostrar mensagem final
    if (winners.length === 3){
      // mostrar apenas os números (sem a frase "Parabéns...")
      const numbersOnly = winners.join(' — ');
      if (finalMessageEl){
        finalMessageEl.textContent = numbersOnly;
        finalMessageEl.hidden = false;
        // adicionar classe visual
        setTimeout(()=> finalMessageEl.classList.add('show'), 30);
      } else {
        alert(numbersOnly);
      }
      // manter botão desabilitado após 3 sorteios
      drawBtn.disabled = true;
      return;
    }

    // permitir o próximo sorteio imediatamente (não bloquear o usuário)
    drawBtn.disabled = false;

    // porém manter os efeitos visuais por 8 segundos antes de limpá-los
    setTimeout(()=>{
      // limpar classes visuais de resultado
      drawBtn.classList.remove('result');
      odometerEl.classList.remove('pulse');
    }, 8000);
  }

  drawBtn.addEventListener('click', function(){
    if (drawBtn.disabled) return;
    // impede novos sorteios se já tiver 3
    if (winners.length >= 3) return;
    // inicia o sorteio com máximo fixo
    doDraw();
  });

});
