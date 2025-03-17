import { defineArrayMember, defineField } from 'sanity';

/**
 * This is the schema definition for the rich text fields used for
 * for this blog studio. When you import it in schemas.js it can be
 * reused in other parts of the studio with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

import { TfiAlignCenter, TfiAlignJustify, TfiAlignLeft, TfiAlignRight } from 'react-icons/tfi';
import { TextAlign } from '../components/TextAlignComponent';

export default defineField({
	title: 'Block Content',
	name: 'blockContent',
	type: 'array',
	of: [
		defineArrayMember({
			title: 'Block',
			type: 'block',
			marks: {
				decorators: [
					{ title: 'Strong', value: 'strong' },
					{ title: 'Emphasis', value: 'em' },
					{ title: 'Code', value: 'code' },
					{
						title: 'Justify left',
						value: 'left',
						icon: TfiAlignLeft,
						component: (props) => TextAlign(props),
					},
					{
						title: 'Justify center',
						value: 'center',
						icon: TfiAlignCenter,
						component: (props) => TextAlign(props),
					},
					{
						title: 'Justify right',
						value: 'right',
						icon: TfiAlignRight,
						component: (props) => TextAlign(props),
					},
					{
						title: 'Justify',
						value: 'justify',
						icon: TfiAlignJustify,
						component: (props) => TextAlign(props),
					},
				],
			},
		}),
		// You can add additional types here. Note that you can't use
		// primitive types such as 'string' and 'number' in the same array
		// as a block type.
		defineArrayMember({ title: 'Image', type: 'image', options: { hotspot: true } }),
	],
});
