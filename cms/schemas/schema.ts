// First, we must import the schema creator
// Then import schema types from any plugins that might expose them

// We import object and document schemas
import author from './author';
import blockContent from './blockContent';
import country from './country';
import landingPage from './landingPage';
import story from './story';
import storylist from './storylist';
import tag from './tag';

export default [
  // The following are document types which will appear in the studio.
  // When added to this list, object types can be used as
  // { type: 'typename' } in other document schemas
  landingPage,
  storylist,
  story,
  author,
  blockContent,
  country,
  tag,
];
