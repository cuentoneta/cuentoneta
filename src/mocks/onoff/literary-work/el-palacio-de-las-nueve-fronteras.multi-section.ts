// El escenario de dos secciones existe en las dos capas —el documento y la fixture cruda de borde— y
// ninguna deriva de la otra. Los strings viven acá para que no puedan divergir, la misma convención que
// el corpus ya usa para títulos y epígrafes.

// El título de la primera sección no se declara acá: es el mismo que el del canon, y declararlo dos veces
// deja al generador eligiendo cuál importar según el orden del sistema de archivos.
export const palacioSecondSectionTitle = 'La novena frontera';
export const palacioSecondSectionBody = 'Le faltaba todavía la voz. Para darle una voz tuve que perder la mía.';

// Los tiempos de lectura también se comparten, no solo la prosa: son lo único del escenario que las dos
// caras declaran en números, y el gate de frescura no las cruza —ninguna de las dos entra a la generación—.
export const palacioFirstSectionReadingTime = 11;
export const palacioSecondSectionReadingTime = 1;
export const palacioMultiSectionTotalReadingTime = 12;
