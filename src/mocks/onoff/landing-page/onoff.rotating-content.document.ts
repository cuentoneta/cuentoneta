import type { RotatingContent } from '@sanity-types';
import { documentReference, documentSystemFields } from '../document/sanity-document.factory';
import { elOdioLiteraryWorkDocument } from '../literary-work/el-odio.literary-work.document';
import { lasEscalerasLiteraryWorkDocument } from '../literary-work/las-escaleras.literary-work.document';

// El `_id` va literal porque `rotatingContentQuery` filtra por `_id == 'rotatingContent'`: el schema lo
// declara singleton y la query lo da por hecho.
//
// Las obras son distintas de las que destaca la landing como novedades: compartiéndolas, un mapeo que
// cruzara los dos slots quedaría indistinguible del correcto.
export const onoffRotatingContentDocument: RotatingContent = {
	...documentSystemFields('rotatingContent'),
	_type: 'rotatingContent',
	name: 'Lo más leído de Onoff',
	mostReadLiteraryWorks: [
		{ _key: 'el-odio', ...documentReference(elOdioLiteraryWorkDocument._id) },
		{ _key: 'las-escaleras', ...documentReference(lasEscalerasLiteraryWorkDocument._id) },
	],
};
