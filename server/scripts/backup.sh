#!/bin/bash
# Backup cifrato del DADO CRM (regola 3-2-1). NON e' una sincronizzazione:
# ogni esecuzione crea un archivio nuovo con data e ora; le copie vecchie
# restano e non vengono toccate da cio' che cambia o cancelli nel CRM.
#
# Uso:
#   BACKUP_DESTS="/Volumes/DiscoEsterno/dado-backup:$HOME/Cloud/dado-backup" \
#   BACKUP_PASSPHRASE="..."  server/scripts/backup.sh backup
#   server/scripts/backup.sh restore <file.tar.gz.enc> <cartella-di-destinazione>
#
# BACKUP_DESTS  : cartelle di destinazione separate da ":" (disco esterno, cartella cloud...)
# BACKUP_KEEP   : quante copie tenere per destinazione (default 30)
# Se BACKUP_PASSPHRASE manca, viene richiesta da terminale.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
KEEP="${BACKUP_KEEP:-30}"
MODE="${1:-backup}"

get_pass() {
  if [ -z "${BACKUP_PASSPHRASE:-}" ]; then
    read -r -s -p "Passphrase backup: " BACKUP_PASSPHRASE; echo
    export BACKUP_PASSPHRASE
  fi
}

do_backup() {
  [ -n "${BACKUP_DESTS:-}" ] || { echo "Imposta BACKUP_DESTS (cartelle separate da ':')"; exit 1; }
  get_pass
  local stamp name saved=0
  stamp="$(date +%Y-%m-%d_%H%M%S)"
  tmp="$(mktemp -d)"   # globale: serve al trap di pulizia all'uscita
  trap 'rm -rf "$tmp"' EXIT
  name="dado-crm-$stamp.tar.gz.enc"

  # Cosa salvare: dati, segreti, codice sorgente (niente node_modules/dist)
  local items=()
  for p in server/data .env credentials.json src public server/index.js server/runtimeConfig.js server/services package.json; do
    [ -e "$ROOT/$p" ] && items+=("$p")
  done
  tar -C "$ROOT" -czf "$tmp/plain.tar.gz" "${items[@]}"
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$tmp/plain.tar.gz" \
    -out "$tmp/$name" -pass env:BACKUP_PASSPHRASE
  (cd "$tmp" && shasum -a 256 "$name" > "$name.sha256")

  IFS=':' read -r -a dests <<< "$BACKUP_DESTS"
  for d in "${dests[@]}"; do
    if [ ! -d "$(dirname "$d")" ]; then
      echo "SALTATA (supporto non collegato?): $d"; continue
    fi
    mkdir -p "$d"
    cp "$tmp/$name" "$tmp/$name.sha256" "$d/"
    (cd "$d" && shasum -a 256 -c "$name.sha256" >/dev/null) \
      && echo "OK  $d/$name" || { echo "ERRORE verifica in $d"; exit 1; }
    saved=$((saved + 1))
    # Rotazione: elimina solo le copie piu' vecchie oltre KEEP
    ls -1t "$d"/dado-crm-*.tar.gz.enc 2>/dev/null | tail -n +"$((KEEP + 1))" | while read -r old; do
      rm -f "$old" "$old.sha256"
    done
  done
  [ "$saved" -gt 0 ] || { echo "NESSUN backup salvato: nessuna destinazione disponibile"; exit 1; }
  echo "Backup completato in $saved destinazione/i"
}

do_restore() {
  local file="${2:-}" out="${3:-}"
  [ -f "$file" ] && [ -n "$out" ] || { echo "Uso: $0 restore <file.enc> <cartella>"; exit 1; }
  get_pass
  mkdir -p "$out"
  openssl enc -d -aes-256-cbc -pbkdf2 -in "$file" -pass env:BACKUP_PASSPHRASE \
    | tar -C "$out" -xzf -
  echo "Ripristinato in: $out (controlla i file prima di sovrascrivere il CRM)"
}

case "$MODE" in
  backup)  do_backup ;;
  restore) do_restore "$@" ;;
  *) echo "Uso: $0 backup | restore <file> <cartella>"; exit 1 ;;
esac
