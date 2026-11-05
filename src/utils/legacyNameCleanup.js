// Pulizia dati salvati nel browser: sostituisce i vecchi nomi/email con AleAmministratore.
// Va importato PRIMA di App, così gira prima che i contesti leggano il localStorage.
const REPLACEMENTS = [
  [/davide@dadocreativestudio\.com/gi, 'aleamministratore+direttore@gmail.com'],
  [/davi?d@dadocreativestudio\.com/gi, 'aleamministratore+direttore@gmail.com'],
  [/admin@dadocreativestudio\.com/gi, 'aleamministratore@gmail.com'],
  [/dipendente@dadocreativestudio\.com/gi, 'aleamministratore+direttore@gmail.com'],
  [/@dadocreativestudio\.com/gi, '@esempio.it'],
  [/Da[Tt]\.? \(Amministratore\)/g, 'AleAmministratore'],
  [/Andrea T\.? \(Amministratore\)/g, 'AleAmministratore'],
  [/Andrea T\./g, 'AleAmministratore'],
  [/Davide \(Director\)/g, 'AleAmministratore'],
]

try {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    if (!value) continue
    let next = value
    for (const [re, to] of REPLACEMENTS) next = next.replace(re, to)
    if (next !== value) localStorage.setItem(key, next)
  }
} catch {
  /* localStorage non disponibile */
}
