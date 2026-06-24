#!/usr/bin/env bash
# Ejecuta una tarea de Nx usando Nx Cloud. Si la nube queda deshabilitada por
# falta de crédito (workspace disabled / límite excedido), Nx aborta con código
# distinto de cero y SIN fallback propio. Acá detectamos ese caso puntual y
# reintentamos con NX_NO_CLOUD=true: la tarea corre sin nube, apoyándose en el
# caché local (.nx/cache, hidratado gratis por actions/cache), en vez de fallar.
# Cualquier otro fallo (un test roto, lint en rojo, etc.) se propaga tal cual.
set -o pipefail

log="$(mktemp)"

if npx "$@" 2>&1 | tee "$log"; then
	exit 0
fi

if grep -qiE "workspace is disabled|nx cloud.*(disabled|limit|quota|exceed)" "$log"; then
	echo "::warning title=Nx Cloud sin crédito::Workspace deshabilitado; reintentando sin nube (caché local)."
	NX_NO_CLOUD=true npx "$@"
else
	exit 1
fi
