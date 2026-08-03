import React from 'react';
import type { BlockDecoratorProps } from 'sanity';

// Los decoradores de alineación comparten este componente y se distinguen por su `value`, que Sanity
// entrega como string suelto: se valida contra los cuatro declarados en blockContent para que un
// decorador nuevo mal escrito caiga en el default en vez de emitir un CSS inválido.
const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'] as const;

type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];

function isTextAlignment(value: string | undefined): value is TextAlignment {
	return TEXT_ALIGNMENTS.some((alignment) => alignment === value);
}

export const TextAlign = ({ value, children }: BlockDecoratorProps) => {
	return <div style={{ textAlign: isTextAlignment(value) ? value : 'left', width: '100%' }}>{children}</div>;
};
