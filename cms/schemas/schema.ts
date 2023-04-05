// First, we must import the schema creator
// Then import schema types from any plugins that might expose them

// We import object and document schemas
import blockContent from './blockContent';
import story from './story';
import author from './author';
import country from './country';
import storyList from './storylist';
import publication from './publication';

export default [
    // The following are document types which will appear in the studio.
    // When added to this list, object types can be used as
    // { type: 'typename' } in other document schemas
    story,
    publication,
    storyList,
    author,
    country,
    blockContent,
];
