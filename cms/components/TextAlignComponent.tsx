import React, { type CSSProperties, type ReactNode } from 'react';

// value lo provee el campo de Portable Text que declara esta anotación; se tipa con el propio tipo de
// React para que un valor no válido de alineación falle acá y no en el render.
type TextAlignProps = {
	value?: CSSProperties['textAlign'];
	children?: ReactNode;
};

export const TextAlign = ({ value, children }: TextAlignProps) => {
	return <div style={{ textAlign: value ?? 'left', width: '100%' }}>{children}</div>;
};
