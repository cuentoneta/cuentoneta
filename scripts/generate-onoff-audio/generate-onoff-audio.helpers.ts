// Núcleo puro del generador de clips: de la prosa del corpus al texto que se lee, y de ahí a las dos
// invocaciones externas que lo convierten en un archivo. Sin I/O — eso vive en el runner.

/** Las comillas con las que el corpus marca lo único que no es prosa propia: los diálogos del film. */
const QUOTATION_MARKS = /["«»“”]/;

// El punto de una abreviatura no cierra una oración. La lista es corta a propósito: cubre las formas que
// la prosa del corpus usa, y una que se le escape parte el fragmento a mitad de frase de forma visible —
// no en silencio—, porque la lectura queda colgada.
const SENTENCE_BOUNDARY = /(?<!\b(?:Sr|Sra|Srta|Dr|Dra|Sto|Sta|etc)\.)(?<=[.!?])\s+/;

function stripMarkdownSyntax(markdown: string): string {
	return markdown
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]+/g, '')
		.trim();
}

function isProse(line: string): boolean {
	const trimmed = line.trim();
	return trimmed !== '' && !trimmed.startsWith('>') && !trimmed.startsWith('#');
}

function wordCount(text: string): number {
	return text.split(/\s+/).filter((word) => word !== '').length;
}

/**
 * Un fragmento de prosa plana, listo para leerse en voz alta, tomado del cuerpo Markdown de una obra.
 *
 * Descarta las citas del film —las oraciones entrecomilladas y las líneas de cita en bloque, que es como
 * el corpus marca lo único ajeno que declara— y corta en un límite de oración, nunca a mitad de frase:
 * una lectura que se interrumpe en seco suena a error de la herramienta y no a recorte deliberado.
 *
 * `skipSentences` permite que dos clips de la misma obra no lean lo mismo. Devuelve al menos una oración
 * aunque exceda `maxWords`, y cadena vacía solo si no queda ninguna después de descartar las ajenas.
 */
export function selectExcerpt(markdown: string, options: { maxWords: number; skipSentences?: number }): string {
	const prose = stripMarkdownSyntax(markdown.split(/\r?\n/).filter(isProse).join(' '));
	const sentences = prose
		.split(SENTENCE_BOUNDARY)
		.map((sentence) => sentence.trim())
		.filter((sentence) => sentence !== '' && !QUOTATION_MARKS.test(sentence))
		.slice(options.skipSentences ?? 0);

	const excerpt: string[] = [];
	let words = 0;
	for (const sentence of sentences) {
		if (excerpt.length > 0 && words + wordCount(sentence) > options.maxWords) {
			break;
		}
		excerpt.push(sentence);
		words += wordCount(sentence);
	}
	return excerpt.join(' ');
}

function quoteForPowerShell(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

/**
 * El script de PowerShell que sintetiza `textFile` en `wavFile` con el TTS de Windows.
 *
 * Elige la voz **por cultura** y no por nombre: el elenco instalado varía por máquina, y nombrar una voz
 * concreta es además la puerta a clonar la de una persona real, que el corpus no hace. Sale con código
 * distinto de cero si no hay ninguna voz en español, en vez de leer con acento ajeno sin avisar.
 *
 * El texto viaja por archivo y no inline: pasar prosa acentuada por la línea de comandos la corrompe.
 */
export function synthesisScript(params: { textFile: string; wavFile: string; rate: number }): string {
	return [
		'Add-Type -AssemblyName System.Speech',
		'$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer',
		"$voice = $synthesizer.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'es' } | Select-Object -First 1",
		'if ($null -eq $voice) { Write-Error "No hay ninguna voz SAPI en espanol instalada."; exit 1 }',
		'$synthesizer.SelectVoice($voice.VoiceInfo.Name)',
		`$synthesizer.Rate = ${params.rate}`,
		`$synthesizer.SetOutputToWaveFile(${quoteForPowerShell(params.wavFile)})`,
		`$synthesizer.Speak([IO.File]::ReadAllText(${quoteForPowerShell(params.textFile)}, [Text.Encoding]::UTF8))`,
		'$synthesizer.Dispose()',
	].join('\n');
}

/**
 * Los argumentos con los que ffmpeg convierte el WAV de la síntesis en el `.ogg` que se versiona.
 *
 * El corte duro en `maxSeconds` es la garantía de peso del corpus: sin él, una voz lenta produciría un
 * archivo de megabytes. El fundido de salida cubre el caso en que ese corte caiga a mitad de palabra.
 */
export function encodeArgs(params: { wavFile: string; oggFile: string; maxSeconds: number }): string[] {
	return [
		'-hide_banner',
		'-loglevel',
		'error',
		'-y',
		'-i',
		params.wavFile,
		'-t',
		String(params.maxSeconds),
		'-af',
		`afade=t=out:st=${params.maxSeconds - 1}:d=1`,
		'-ac',
		'1',
		'-c:a',
		'libvorbis',
		'-q:a',
		'2',
		params.oggFile,
	];
}
