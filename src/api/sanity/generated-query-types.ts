/**
 * En este archivo se definen los tipos de queries refinados a partir de los generados por Sanity Codegen. Los tipos
 * refinados se utilizan para simplificar la estructura de las queries generadas por Sanity Codegen mediante el uso de los
 * tipos definidos en derivate-types.ts y generated-schema-types.ts.
 */

// Source: ../src/api/_queries/author.query.ts
// Variable: authorBySlugQuery
// Query: *[_type == 'author' && slug.current == $slug][0]{    slug,    name,    image,    nationality->,    biography,    'resources': coalesce(resources[]{         title,         url,         resourceType->{         	title,         	description,             icon        }     }, [])}

export type AuthorBySlugQueryResult = {
	slug: Slug;
	name: string;
	image: ImageQueryResult;
	nationality: NationalitySubQueryResult;
	biography: {
		es?: BlockContent;
		en?: BlockContent;
	};
	resources: ResourceSubQueryResult;
} | null;

// Source: ../src/api/_queries/story.query.ts
// Variable: storiesByAuthorSlugQuery
// Query: *[_type == 'story' && author->slug.current == $slug][$start...$end]{    'slug': slug.current,    title,    'language': coalesce(language, 'es'),    'badLanguage': coalesce(badLanguage, false),    'categories': coalesce(categories, []),    'body': coalesce(body[0...3], []),    'originalPublication': coalesce(originalPublication, ''),    approximateReadingTime,    'mediaSources': coalesce(mediaSources[]{        _id,        _type,        title,         icon    }, []),    'resources': coalesce(resources[]{         title,         url,         resourceType->{             title,             description,             icon        }     }, []),}|order(title asc)
export type StoriesByAuthorSlugQueryResult = Array<{
	slug: string;
	title: string;
	language: 'en' | 'es';
	badLanguage: boolean | false;
	categories: Array<never> | null;
	body: BlockContent;
	originalPublication: string | '';
	approximateReadingTime: number;
	mediaSources: MediaResourcesSubQueryResult;
	resources: ResourceSubQueryResult;
}>;
// Variable: storyBySlugQuery
// Query: *[_type == 'story' && slug.current == $slug]{    'slug': slug.current,    title,     'language': coalesce(language, 'es'),    'badLanguage': coalesce(badLanguage, false),    'epigraphs': coalesce(epigraphs[]{        text,        reference    }, []),    'categories': coalesce(categories, []),    'body': coalesce(body, []),    'review': coalesce(review, []),    'originalPublication': coalesce(originalPublication, ''),    approximateReadingTime,    'mediaSources': coalesce(mediaSources[]{        _id,        _type,        title,         icon    }, []),    'resources': coalesce(resources[]{        title,         url,         resourceType->{             title,             description,            icon        }    }, []),    'author': author-> {        slug,        name,        image,        nationality->,        biography,        'resources': coalesce(resources[]{             title,             url,             resourceType->{                 title,                 description,                 icon            }         }, [])    }}[0]
export type StoryBySlugQueryResult = {
	slug: string;
	title: string;
	language: 'en' | 'es';
	badLanguage: boolean | false;
	epigraphs:
		| Array<{
				text: BlockContent;
				reference: string | null;
		  }>
		| Array<never>;
	categories: Array<never> | null;
	body: BlockContent;
	review: BlockContent;
	originalPublication: string | '';
	approximateReadingTime: number;
	mediaSources: MediaResourcesSubQueryResult;
	resources: ResourceSubQueryResult;
	author: {
		slug: Slug;
		name: string;
		image: ImageQueryResult;
		nationality: NationalitySubQueryResult;
		biography: {
			es?: BlockContent;
			en?: BlockContent;
		};
		resources: ResourceSubQueryResult;
	};
} | null;

// Source: ../src/api/_queries/storylist.query.ts
// Variable: storylistTeasersQuery
// Query: *[_type == 'storylist']{     'slug': slug.current,    title,    description,    language,    displayDates,    editionPrefix,    comingNextLabel,    featuredImage,    'tags': coalesce(tags[] -> {        title,         'slug': slug.current,         description,         icon    }, []),    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])    }
export type StorylistTeasersQueryResult = Array<{
	slug: string;
	title: string;
	description: BlockContent;
	language: 'en' | 'es';
	displayDates: boolean;
	editionPrefix: string;
	comingNextLabel: string;
	featuredImage: ImageQueryResult;
	tags: TagsSubQueryResult;
	count: number;
}>;
// Variable: storylistQuery
// Query: *[_type == 'storylist' && slug.current == $slug][0]{     'slug': slug.current,    title,    description,    language,    displayDates,    editionPrefix,    comingNextLabel,    featuredImage,    'tags': coalesce(tags[] -> {        title,         'slug': slug.current,         description,         icon    }, []),    'publications': coalesce(publications[]{        publishingOrder,        publishingDate,        published,        'story': story->{            'slug': slug.current,            title,            language,            badLanguage,            categories,            body[0...3],            originalPublication,            approximateReadingTime,            'mediaSources': coalesce(mediaSources[]{                _id,                _type,                title,                 icon            }, []),            'author': author-> { slug, name, image, nationality-> }        }    }, []),    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])    }
export type StorylistQueryResult = {
	slug: string;
	title: string;
	description: BlockContent;
	language: 'en' | 'es';
	displayDates: boolean;
	editionPrefix: string;
	comingNextLabel: string;
	featuredImage: ImageQueryResult;
	tags: TagsSubQueryResult;
	publications: PublicationSubQueryResult;
	count: number;
} | null;

// Query TypeMap
import '@sanity/client';
import { BlockContent, Slug } from './generated-schema-types';
import {
	ImageQueryResult,
	MediaResourcesSubQueryResult,
	NationalitySubQueryResult,
	PublicationSubQueryResult,
	ResourceSubQueryResult,
	TagsSubQueryResult,
} from './derivate-types';
declare module '@sanity/client' {
	interface SanityQueries {
		"*[_type == 'author' && slug.current == $slug][0]\n{\n    slug,\n    name,\n    image,\n    nationality->,\n    biography,\n    'resources': coalesce(resources[]{ \n        title, \n        url, \n        resourceType->{ \n        \ttitle, \n        \tdescription, \n            icon\n        } \n    }, [])\n}": AuthorBySlugQueryResult;
		"*[_type == 'story' && author->slug.current == $slug][$start...$end]\n{\n    'slug': slug.current,\n    title,\n    'language': coalesce(language, 'es'),\n    'badLanguage': coalesce(badLanguage, false),\n    'categories': coalesce(categories, []),\n    'body': coalesce(body[0...3], []),\n    'originalPublication': coalesce(originalPublication, ''),\n    approximateReadingTime,\n    'mediaSources': coalesce(mediaSources[]{\n        _id,\n        _type,\n        title, \n        icon\n    }, []),\n    'resources': coalesce(resources[]{ \n        title, \n        url, \n        resourceType->{ \n            title, \n            description, \n            icon\n        } \n    }, []),\n}|order(title asc)": StoriesByAuthorSlugQueryResult;
		"*[_type == 'story' && slug.current == $slug]\n{\n    'slug': slug.current,\n    title, \n    'language': coalesce(language, 'es'),\n    'badLanguage': coalesce(badLanguage, false),\n    'epigraphs': coalesce(epigraphs[]{\n        text,\n        reference\n    }, []),\n    'categories': coalesce(categories, []),\n    'body': coalesce(body, []),\n    'review': coalesce(review, []),\n    'originalPublication': coalesce(originalPublication, ''),\n    approximateReadingTime,\n    'mediaSources': coalesce(mediaSources[]{\n        _id,\n        _type,\n        title, \n        icon\n    }, []),\n    'resources': coalesce(resources[]{\n        title, \n        url, \n        resourceType->{ \n            title, \n            description,\n            icon\n        }\n    }, []),\n    'author': author-> {\n        slug,\n        name,\n        image,\n        nationality->,\n        biography,\n        'resources': coalesce(resources[]{ \n            title, \n            url, \n            resourceType->{ \n                title, \n                description, \n                icon\n            } \n        }, [])\n    }\n}[0]": StoryBySlugQueryResult;
		"*[_type == 'storylist']{ \n    'slug': slug.current,\n    title,\n    description,\n    language,\n    displayDates,\n    editionPrefix,\n    comingNextLabel,\n    featuredImage,\n    'tags': coalesce(tags[] -> {\n        title, \n        'slug': slug.current, \n        description, \n        icon\n    }, []),\n    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])\n    }\n": StorylistTeasersQueryResult;
		"*[_type == 'storylist' && slug.current == $slug][0]\n{ \n    'slug': slug.current,\n    title,\n    description,\n    language,\n    displayDates,\n    editionPrefix,\n    comingNextLabel,\n    featuredImage,\n    'tags': coalesce(tags[] -> {\n        title, \n        'slug': slug.current, \n        description, \n        icon\n    }, []),\n    'publications': coalesce(publications[]{\n        publishingOrder,\n        publishingDate,\n        published,\n        'story': story->{\n            'slug': slug.current,\n            title,\n            language,\n            badLanguage,\n            categories,\n            body[0...3],\n            originalPublication,\n            approximateReadingTime,\n            'mediaSources': coalesce(mediaSources[]{\n                _id,\n                _type,\n                title, \n                icon\n            }, []),\n            'author': author-> { slug, name, image, nationality-> }\n        }\n    }, []),\n    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])\n    }\n": StorylistQueryResult;
	}
}
