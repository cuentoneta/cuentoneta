# Baja de los campos de referencia al contenido retirado

Da de baja `cards` y `latestReads` de la página de inicio y `mostRead` del contenido rotativo. Sus schemas ya no los declaran, pero el dato quedó en el dataset y es lo que bloquea la purga: el content lake rechaza borrar un documento con una referencia fuerte entrante.

**Primera de tres.** El procedimiento completo —prerequisitos, export previo, censo, orden de datasets y verificación— vive en [`../purge-story-documents/README.md`](../purge-story-documents/README.md).
