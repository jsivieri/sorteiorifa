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
    const chosen = Math.floor(1 + Math.random()*max);

    // iniciar spin e aguardar resultado
    await spinTo(chosen, max);

    // preencher próximo slot
    winners.push(chosen);
    const idx = winners.length - 1;
    if (winnerEls[idx]) winnerEls[idx].textContent = chosen;

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
