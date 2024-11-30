import { Resource } from '@models/resource.model';

export const resourceMock: Resource = {
	title: 'Recurso original',
	url: 'https://biblioteca.es/el-espejo-del-tiempo',
	resourceType: {
		title: 'Recurso Original',
		shortDescription: 'Recurso original de este contenido',
		description: [
			{
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: [],
						text: 'Recurso original de este contenido',
						_key: 'd92a239f37e50',
					},
				],
				_type: 'block',
				style: 'normal',
				_key: '05dc9f3aa317',
			},
		],
		icon: {
			provider: 'fa',
			name: 'fa-medal',
		},
	},
};
