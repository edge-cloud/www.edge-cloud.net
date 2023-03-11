/* eslint max-len: 0 */
import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';

/* eslint-disable import/no-unresolved */
import InstantSearch from './lib/InstantSearch.js';
import version from './lib/version.js';
/* eslint-enable import/no-unresolved */

// import instantsearch from 'instantsearch.js';
// -> provides instantsearch object without connectors and widgets
var instantSearchFactory = Object.assign(toFactory(InstantSearch), {
  version: version,
  createQueryString: algoliasearchHelper.url.getQueryStringFromState
});

Object.defineProperty(instantSearchFactory, 'widgets', {
  get: function get() {
    throw new ReferenceError('\n      You can\'t access to \'instantsearch.widgets\' directly from the ES6 build.\n      Import the widgets this way "import { searchBox } from \'instantsearch.js/es/widgets\'"\n    ');
  }
});

Object.defineProperty(instantSearchFactory, 'connectors', {
  get: function get() {
    throw new ReferenceError('\n      You can\'t access to \'instantsearch.connectors\' directly from the ES6 build.\n      Import the connectors this way "import { connectSearchBox } from \'instantsearch.js/es/connectors\'"\n    ');
  }
});

export default instantSearchFactory;
