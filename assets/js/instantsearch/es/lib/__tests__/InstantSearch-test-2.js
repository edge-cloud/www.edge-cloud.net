// import algoliaSearchHelper from 'algoliasearch-helper';
import InstantSearch from '../InstantSearch';

jest.useFakeTimers();

var appId = 'appId';
var apiKey = 'apiKey';
var indexName = 'lifecycle';

describe('InstantSearch lifecycle', function () {
  it('calls the provided searchFunction when used', function () {
    var searchFunctionSpy = jest.fn(function (h) {
      h.setQuery('test').search();
    });

    var fakeClient = {
      search: jest.fn(),
      addAlgoliaAgent: function addAlgoliaAgent() {}
    };

    var search = new InstantSearch({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchFunction: searchFunctionSpy,
      createAlgoliaClient: function createAlgoliaClient() {
        return fakeClient;
      }
    });

    expect(searchFunctionSpy).not.toHaveBeenCalled();
    expect(fakeClient.search).not.toHaveBeenCalled();

    search.start();

    expect(searchFunctionSpy).toHaveBeenCalledTimes(1);
    expect(search.helper.state.query).toBe('test');
    expect(fakeClient.search).toHaveBeenCalledTimes(1);
  });

  var fakeResults = function fakeResults() {
    return {
      results: [{
        hits: [{}, {}],
        nbHits: 2,
        page: 0,
        nbPages: 1,
        hitsPerPage: 4,
        processingTimeMS: 1,
        exhaustiveNbHits: true,
        query: '',
        params: '',
        index: 'quick_links'
      }]
    };
  };

  it('triggers the stalled search rendering once if the search does not resolve in time', function () {
    var searchResultsResolvers = [];
    var searchResultsPromises = [];
    var fakeClient = {
      search: jest.fn(function (qs, cb) {
        var p = new Promise(function (resolve) {
          return searchResultsResolvers.push(resolve);
        }).then(function () {
          cb(null, fakeResults());
        });
        searchResultsPromises.push(p);
      }),
      addAlgoliaAgent: function addAlgoliaAgent() {}
    };

    var search = new InstantSearch({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      createAlgoliaClient: function createAlgoliaClient() {
        return fakeClient;
      }
    });

    var widget = {
      getConfiguration: jest.fn(),
      init: jest.fn(),
      render: jest.fn()
    };

    search.addWidget(widget);

    // when a widget is added the methods of the widget are not called
    expect(widget.getConfiguration).not.toHaveBeenCalled();
    expect(widget.init).not.toHaveBeenCalled();
    expect(widget.render).not.toHaveBeenCalled();

    search.start();

    // During start, IS.js calls the getConfiguration, init and then send a search
    expect(widget.getConfiguration).toHaveBeenCalledTimes(1);
    expect(widget.init).toHaveBeenCalledTimes(1);
    expect(widget.render).not.toHaveBeenCalled();

    // first results come back
    searchResultsResolvers[0]();

    return searchResultsPromises[0].then(function () {
      // render has now been called
      expect(widget.render).toHaveBeenCalledTimes(1);

      expect(widget.render).toHaveBeenLastCalledWith(expect.objectContaining({
        searchMetadata: {
          isSearchStalled: false
        }
      }));

      // New search
      search.helper.search();
      // results are not back yet
      expect(widget.render).toHaveBeenCalledTimes(1);
      // delay is reached
      jest.runAllTimers();

      expect(widget.render).toHaveBeenCalledTimes(2);
      expect(widget.render).toHaveBeenLastCalledWith(expect.objectContaining({
        searchMetadata: {
          isSearchStalled: true
        }
      }));

      searchResultsResolvers[1]();
      return searchResultsPromises[1].then(function () {
        expect(widget.render).toHaveBeenCalledTimes(3);
        expect(widget.render).toHaveBeenLastCalledWith(expect.objectContaining({
          searchMetadata: {
            isSearchStalled: false
          }
        }));

        // getConfiguration and init are not called a second time
        expect(widget.getConfiguration).toHaveBeenCalledTimes(1);
        expect(widget.init).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('does not break when adding a widget dynamically just after start', function () {
    var searchFunctionSpy = jest.fn(function (h) {
      h.setQuery('test').search();
    });

    var fakeClient = {
      search: jest.fn(),
      addAlgoliaAgent: function addAlgoliaAgent() {}
    };

    var search = new InstantSearch({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchFunction: searchFunctionSpy,
      createAlgoliaClient: function createAlgoliaClient() {
        return fakeClient;
      }
    });

    search.start();

    search.addWidget({
      render: function render() {}
    });

    jest.runAllTimers();
  });
});