# Pasos manuales por versión de release.

#

# El skill `release-workflow` (Fase 2) escribe `<version>.md` solo cuando hay

# migraciones u otros pasos manuales. El Action `prepare-release-pr` lee el

# archivo de la versión al armar el PR develop → master; si no existe, asume

# "sin pasos manuales adicionales".
