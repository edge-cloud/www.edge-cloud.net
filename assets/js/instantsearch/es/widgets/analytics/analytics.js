var usage = 'Usage:\nanalytics({\n  pushFunction,\n  [ delay=3000 ],\n  [ triggerOnUIInteraction=false ],\n  [ pushInitialSearch=true ]\n})';

/**
 * @typedef {Object} AnalyticsWidgetOptions
 * @property {function(qs: string, state: SearchParameters, results: SearchResults)} pushFunction
 * Function called when data are ready to be pushed. It should push the data to your analytics platform.
 * The `qs` parameter contains the parameters serialized as a query string. The `state` contains the
 * whole search state, and the `results` the last results received.
 * @property {number} [delay=3000] Number of milliseconds between last search key stroke and calling pushFunction.
 * @property {boolean} [triggerOnUIInteraction=false] Trigger pushFunction after click on page or redirecting the page
 * @property {boolean} [pushInitialSearch=true] Trigger pushFunction after the initial search
 * @property {boolean} [pushPagination=false] Trigger pushFunction on pagination
 */

/**
 * The analytics widget pushes the current state of the search to the analytics platform of your
 * choice. It requires the implementation of a function that will push the data.
 *
 * This is a headless widget, which means that it does not have a rendered output in the
 * UI.
 * @type {WidgetFactory}
 * @category analytics
 * @param {AnalyticsWidgetOptions} $0 The Analytics widget options.
 * @return {Widget} A new instance of the Analytics widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.analytics({
 *     pushFunction: function(formattedParameters, state, results) {
 *       // Google Analytics
 *       // window.ga('set', 'page', '/search/query/?query=' + state.query + '&' + formattedParameters + '&numberOfHits=' + results.nbHits);
 *       // window.ga('send', 'pageView');
 *
 *       // GTM
 *       // dataLayer.push({'event': 'search', 'Search Query': state.query, 'Facet Parameters': formattedParameters, 'Number of Hits': results.nbHits});
 *
 *       // Segment.io
 *       // analytics.page( '[SEGMENT] instantsearch', { path: '/instantsearch/?query=' + state.query + '&' + formattedParameters });
 *
 *       // Kissmetrics
 *       // var objParams = JSON.parse('{"' + decodeURI(formattedParameters.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
 *       // var arrParams = $.map(objParams, function(value, index) {
 *       //   return [value];
 *       // });
 *       //
 *       // _kmq.push(['record', '[KM] Viewed Result page', {
 *       //   'Query': state.query ,
 *       //   'Number of Hits': results.nbHits,
 *       //   'Search Params': arrParams
 *       // }]);
 *
 *       // any other analytics service
 *     }
 *   })
 * );
 */
function analytics() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      pushFunction = _ref.pushFunction,
      _ref$delay = _ref.delay,
      delay = _ref$delay === undefined ? 3000 : _ref$delay,
      _ref$triggerOnUIInter = _ref.triggerOnUIInteraction,
      triggerOnUIInteraction = _ref$triggerOnUIInter === undefined ? false : _ref$triggerOnUIInter,
      _ref$pushInitialSearc = _ref.pushInitialSearch,
      pushInitialSearch = _ref$pushInitialSearc === undefined ? true : _ref$pushInitialSearc,
      _ref$pushPagination = _ref.pushPagination,
      pushPagination = _ref$pushPagination === undefined ? false : _ref$pushPagination;

  if (!pushFunction) {
    throw new Error(usage);
  }

  var cachedState = null;

  var serializeRefinements = function serializeRefinements(obj) {
    var str = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var values = obj[p].join('+');
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(p) + '_' + encodeURIComponent(values));
      }
    }

    return str.join('&');
  };

  var serializeNumericRefinements = function serializeNumericRefinements(numericRefinements) {
    var numericStr = [];

    for (var attr in numericRefinements) {
      if (numericRefinements.hasOwnProperty(attr)) {
        var filter = numericRefinements[attr];

        if (filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
          if (filter['>='][0] === filter['<='][0]) {
            numericStr.push(attr + '=' + attr + '_' + filter['>=']);
          } else {
            numericStr.push(attr + '=' + attr + '_' + filter['>='] + 'to' + filter['<=']);
          }
        } else if (filter.hasOwnProperty('>=')) {
          numericStr.push(attr + '=' + attr + '_from' + filter['>=']);
        } else if (filter.hasOwnProperty('<=')) {
          numericStr.push(attr + '=' + attr + '_to' + filter['<=']);
        } else if (filter.hasOwnProperty('=')) {
          var equals = [];
          for (var equal in filter['=']) {
            // eslint-disable-next-line max-depth
            if (filter['='].hasOwnProperty(equal)) {
              equals.push(filter['='][equal]);
            }
          }

          numericStr.push(attr + '=' + attr + '_' + equals.join('-'));
        }
      }
    }

    return numericStr.join('&');
  };

  var lastSentData = '';
  var sendAnalytics = function sendAnalytics(state) {
    if (state === null) {
      return;
    }

    var formattedParams = [];

    var serializedRefinements = serializeRefinements(Object.assign({}, state.state.disjunctiveFacetsRefinements, state.state.facetsRefinements, state.state.hierarchicalFacetsRefinements));

    var serializedNumericRefinements = serializeNumericRefinements(state.state.numericRefinements);

    if (serializedRefinements !== '') {
      formattedParams.push(serializedRefinements);
    }

    if (serializedNumericRefinements !== '') {
      formattedParams.push(serializedNumericRefinements);
    }

    formattedParams = formattedParams.join('&');

    var dataToSend = 'Query: ' + state.state.query + ', ' + formattedParams;
    if (pushPagination === true) {
      dataToSend += ', Page: ' + state.state.page;
    }

    if (lastSentData !== dataToSend) {
      pushFunction(formattedParams, state.state, state.results);

      lastSentData = dataToSend;
    }
  };

  var pushTimeout = void 0;

  var isInitialSearch = true;
  if (pushInitialSearch === true) {
    isInitialSearch = false;
  }

  return {
    init: function init() {
      if (triggerOnUIInteraction === true) {
        document.addEventListener('click', function () {
          sendAnalytics(cachedState);
        });

        window.addEventListener('beforeunload', function () {
          sendAnalytics(cachedState);
        });
      }
    },
    render: function render(_ref2) {
      var results = _ref2.results,
          state = _ref2.state;

      if (isInitialSearch === true) {
        isInitialSearch = false;

        return;
      }

      cachedState = { results: results, state: state };

      if (pushTimeout) {
        clearTimeout(pushTimeout);
      }

      pushTimeout = setTimeout(function () {
        return sendAnalytics(cachedState);
      }, delay);
    }
  };
}

export default analytics;