/**
 * EMAIL SAFETY — difese contro la "prompt injection" nelle email in arrivo
 *
 * Un'email HTML può contenere testo che un essere umano non vede (colore uguale allo sfondo,
 * dimensione zero, elementi nascosti, testo fuori schermo, caratteri Unicode invisibili) ma che
 * un programma di estrazione testo legge normalmente. Se quel testo arriva a un LLM o alle regole
 * automatiche, può pilotare l'invio di risposte o la scrittura di dati nel CRM.
 *
 * Questo modulo:
 *  1. estrae dall'HTML SOLO il testo realmente visibile e tiene separato quello nascosto;
 *  2. cerca nel testo frasi tipiche di iniezione ("ignora le istruzioni precedenti", ...);
 *  3. segnala differenze tra la parte text/plain e quella HTML della stessa email;
 *  4. produce una valutazione (`assessEmailSafety`) usata dalla pipeline per impedire l'invio automatico.
 */

const VOID_TAGS = new Set(['br', 'hr', 'img', 'meta', 'link', 'input', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'])
const SKIP_CONTENT_TAGS = new Set(['script', 'style', 'head', 'title', 'noscript', 'template'])
const BLOCK_TAGS = new Set(['p', 'div', 'br', 'li', 'tr', 'table', 'ul', 'ol', 'blockquote', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr'])

const NAMED_COLORS = { white: 'ffffff', black: '000000', red: 'ff0000', silver: 'c0c0c0', gray: '808080', grey: '808080' }

// ───────────────────────── Colori & stili ─────────────────────────

function normColor(value) {
  if (!value) return null
  const v = String(value).trim().toLowerCase().replace(/!important/g, '').trim()
  if (NAMED_COLORS[v]) return NAMED_COLORS[v]
  let m = v.match(/^#([0-9a-f]{3})$/)
  if (m) return m[1].split('').map(c => c + c).join('')
  m = v.match(/^#([0-9a-f]{6})$/)
  if (m) return m[1]
  m = v.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (m) return [m[1], m[2], m[3]].map(n => Math.min(255, Number(n)).toString(16).padStart(2, '0')).join('')
  return null
}

function firstColorToken(value) {
  if (!value) return null
  const m = String(value).match(/#[0-9a-fA-F]{3,6}\b|rgba?\([^)]*\)|\b(?:white|black|red|silver|gray|grey)\b/)
  return m ? normColor(m[0]) : null
}

function styleProp(style, prop) {
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'))
  return m ? m[1].trim() : null
}

/** True se lo stile inline rende l'elemento invisibile a una persona. */
function isHiddenByStyle(style) {
  if (!style) return false
  const s = style.toLowerCase()
  if (/(?:^|;)\s*display\s*:\s*none/.test(s)) return true
  if (/(?:^|;)\s*visibility\s*:\s*hidden/.test(s)) return true
  if (/(?:^|;)\s*mso-hide\s*:\s*all/.test(s)) return true
  if (/(?:^|;)\s*font-size\s*:\s*[01](?:\.0+)?\s*(?:px|pt|em|rem|%|cm|mm)?\s*(?:;|!|$)/.test(s)) return true
  if (/(?:^|;)\s*opacity\s*:\s*0(?:\.0+)?\s*(?:;|!|$)/.test(s)) return true
  if (/(?:^|;)\s*color\s*:\s*(?:transparent|rgba\([^)]*,\s*0(?:\.0+)?\s*\))/.test(s)) return true
  if (/(?:^|;)\s*(?:left|top|text-indent|margin-left|margin-top)\s*:\s*-\d{3,}/.test(s)) return true
  if (/(?:^|;)\s*max-height\s*:\s*0(?:px)?\s*(?:;|!|$)/.test(s)) return true
  if (/(?:^|;)\s*(?:height|width)\s*:\s*0(?:px)?\s*(?:;|!|$)/.test(s) && /overflow\s*:\s*hidden/.test(s)) return true
  if (/clip\s*:\s*rect\(\s*0/.test(s) || /clip-path\s*:\s*inset\(\s*100%/.test(s)) return true
  return false
}

function getAttr(attrs, name) {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null
}

// ───────────────────────── Caratteri invisibili ─────────────────────────

/** Rimuove i caratteri Unicode invisibili; decodifica i "tag characters" (U+E0000–E007F) usati per nascondere testo ASCII. */
export function stripInvisibleChars(text) {
  let count = 0
  let smuggled = ''
  let out = ''
  for (const ch of String(text || '')) {
    const cp = ch.codePointAt(0)
    if (cp >= 0xe0020 && cp <= 0xe007e) {
      smuggled += String.fromCharCode(cp - 0xe0000)
      count++
    } else if ((cp >= 0xe0000 && cp <= 0xe007f) || (cp >= 0x200b && cp <= 0x200f) || (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2060 && cp <= 0x2064) || cp === 0xfeff || cp === 0x00ad) {
      count++
    } else {
      out += ch
    }
  }
  return { clean: out, count, smuggled: smuggled.trim() }
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(Number(n)) } catch { return ' ' } })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)) } catch { return ' ' } })
}

// ───────────────────────── Parser HTML ─────────────────────────

/**
 * Separa il testo visibile da quello nascosto di un'email HTML.
 * @returns {{ visible: string, hidden: string, invisibleChars: number }}
 */
export function parseHtmlEmail(html) {
  const src = String(html || '')
  const visible = []
  const hidden = []
  let invisibleChars = 0

  const tagRe = /<!--([\s\S]*?)-->|<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g
  const stack = [{ name: '#root', hidden: false, color: null, bg: 'ffffff' }]
  let last = 0
  let m

  const pushText = (raw) => {
    if (!raw) return
    const { clean, count, smuggled } = stripInvisibleChars(decodeEntities(raw))
    invisibleChars += count
    if (smuggled) hidden.push(smuggled)
    const text = clean.replace(/\s+/g, ' ')
    if (!text.trim()) return
    const top = stack[stack.length - 1]
    const sameAsBg = top.color && top.bg && top.color === top.bg
    if (top.hidden || sameAsBg) hidden.push(text.trim())
    else visible.push(text)
  }

  while ((m = tagRe.exec(src)) !== null) {
    pushText(src.slice(last, m.index))
    last = tagRe.lastIndex

    // Commenti HTML: mai visibili
    if (m[1] !== undefined) {
      const c = m[1].replace(/\s+/g, ' ').trim()
      if (c.length > 3 && !/^\[if|^\[endif|^<!\[/.test(c)) hidden.push(c)
      continue
    }

    const closing = m[2] === '/'
    const name = m[3].toLowerCase()
    const attrs = m[4] || ''

    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].name === name) { stack.length = i; break }
      }
      if (BLOCK_TAGS.has(name)) visible.push('\n')
      continue
    }

    if (SKIP_CONTENT_TAGS.has(name)) {
      const endRe = new RegExp(`</${name}\\s*>`, 'ig')
      endRe.lastIndex = tagRe.lastIndex
      const endMatch = endRe.exec(src)
      tagRe.lastIndex = endMatch ? endRe.lastIndex : src.length
      last = tagRe.lastIndex
      continue
    }

    if (BLOCK_TAGS.has(name)) visible.push('\n')
    if (VOID_TAGS.has(name)) continue

    const parent = stack[stack.length - 1]
    const style = getAttr(attrs, 'style') || ''
    const ownColor = normColor(styleProp(style, 'color')) || normColor(getAttr(attrs, 'color'))
    const ownBg = firstColorToken(styleProp(style, 'background-color') || styleProp(style, 'background')) || normColor(getAttr(attrs, 'bgcolor'))
    const hiddenAttr = getAttr(attrs, 'hidden') !== null
    stack.push({
      name,
      hidden: parent.hidden || hiddenAttr || isHiddenByStyle(style),
      color: ownColor || parent.color,
      bg: ownBg || parent.bg
    })
  }
  pushText(src.slice(last))

  return {
    visible: visible.join('').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim(),
    hidden: hidden.join(' ').replace(/\s+/g, ' ').trim(),
    invisibleChars
  }
}

// ───────────────────────── Rilevamento di iniezioni ─────────────────────────

const INJECTION_PATTERNS = [
  { id: 'ignora_istruzioni', label: 'frase che chiede di ignorare le istruzioni', re: /\b(ignor[ai]\w*|dimentic[ai]\w*|trascur[ai]\w*|disregard|ignore|forget|override)\b[^.\n]{0,40}\b(istruzion\w*|regol\w*|prompt|instructions?|rules?|guidelines?)\b/i },
  { id: 'nuove_istruzioni', label: 'tentativo di impartire nuove istruzioni al sistema', re: /\b(nuove istruzioni|new instructions?|system prompt|prompt di sistema|from now on|da ora in poi|d'ora in poi)\b/i },
  { id: 'cambio_ruolo', label: 'tentativo di cambiare il ruolo dell\'assistente', re: /\b(sei ora|you are now|agisci come|act as|comportati come|fingi di essere|pretend to be)\b/i },
  { id: 'rivolto_all_agente', label: 'testo rivolto a un agente/assistente AI', re: /\b(all['’]agente|al sistema ai|assistente ai|ai assistant|dear (?:ai|assistant|llm|model)|to the (?:ai|assistant|llm))\b/i },
  { id: 'penali_illimitate', label: 'richiesta di accettare penali o condizioni illimitate', re: /\b(penali\s+(?:illimitat\w*|a carico nostro)|unlimited\s+(?:liability|penalt\w*)|accett\w+\s+(?:tutte le|ogni)\s+(?:penali|condizioni|clausol\w*))\b/i },
  { id: 'approvazione_automatica', label: 'richiesta di approvare/confermare senza verifica', re: /\b(approva|accetta|conferma|autorizza|approve|accept|confirm|authorize)\w*\b[^.\n]{0,30}\b(automaticamente|senza (?:verifica|revisione|controllo)|immediatamente|without (?:review|verification|checking))\b/i },
  { id: 'esfiltrazione', label: 'richiesta di inviare dati riservati', re: /\b(invia|inoltra|manda|send|forward)\w*\b[^.\n]{0,40}\b(tutti i (?:dati|contratti|contatti|clienti)|all (?:data|contacts|contracts|customers)|password|api key|chiave api)\b/i }
]

/** Restituisce le etichette dei pattern di iniezione trovati nel testo. */
export function detectInjectionPatterns(text) {
  const t = String(text || '')
  if (!t) return []
  return INJECTION_PATTERNS.filter(p => p.re.test(t)).map(p => p.label)
}

// ───────────────────────── Confronto text/plain vs HTML ─────────────────────────

const words = s => new Set(String(s || '').toLowerCase().match(/[a-zà-ù0-9]{4,}/g) || [])

/** True se la parte text/plain contiene molte parole assenti dalla parte HTML visibile (contenuti diversi per umano e macchina). */
export function plainHtmlMismatch(plainText, htmlVisible) {
  const plain = words(plainText)
  const html = words(htmlVisible)
  if (plain.size < 12 || html.size === 0) return false
  let missing = 0
  plain.forEach(w => { if (!html.has(w)) missing++ })
  return missing / plain.size > 0.4
}

// ───────────────────────── Valutazione finale ─────────────────────────

/**
 * Valuta quanto un'email sia sospetta. Usa i campi opzionali prodotti dall'estrazione:
 *   email.hiddenText, email.htmlMismatch, email.invisibleChars
 * @returns {{ suspicious: boolean, level: 'ok'|'medium'|'high', reasons: string[], hiddenPreview: string }}
 */
export function assessEmailSafety(email = {}) {
  const reasons = []
  let level = 'ok'
  const raise = l => { if (l === 'high' || (l === 'medium' && level === 'ok')) level = l }

  const hidden = String(email.hiddenText || '').trim()
  const visibleText = `${email.subject || ''} ${email.body || ''}`

  const hiddenInjection = detectInjectionPatterns(hidden)
  if (hiddenInjection.length) {
    reasons.push(`Testo NASCOSTO nell'email con ${hiddenInjection.join('; ')}.`)
    raise('high')
  } else if (hidden.length > 40) {
    reasons.push(`L'email contiene ${hidden.length} caratteri di testo nascosto (non visibili a chi la legge).`)
    raise('medium')
  }

  const visibleInjection = detectInjectionPatterns(visibleText)
  if (visibleInjection.length) {
    reasons.push(`Il testo contiene ${visibleInjection.join('; ')}.`)
    raise('high')
  }

  if (email.htmlMismatch) {
    reasons.push('La versione testo semplice e quella HTML dell\'email hanno contenuti molto diversi.')
    raise('medium')
  }

  if (Number(email.invisibleChars) > 5) {
    reasons.push(`Presenti ${email.invisibleChars} caratteri Unicode invisibili nel testo.`)
    raise('medium')
  }

  return {
    suspicious: level !== 'ok',
    level,
    reasons,
    hiddenPreview: hidden.slice(0, 300)
  }
}
