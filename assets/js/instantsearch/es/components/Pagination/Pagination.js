var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import PropTypes from 'prop-types';
import React from 'preact-compat';
import forEach from 'lodash/forEach';
import defaultsDeep from 'lodash/defaultsDeep';
import { isSpecialClick } from '../../lib/utils.js';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';

import Paginator from './Paginator.js';
import PaginationLink from './PaginationLink.js';

import cx from 'classnames';

export var RawPagination = function (_React$Component) {
  _inherits(RawPagination, _React$Component);

  function RawPagination(props) {
    _classCallCheck(this, RawPagination);

    var _this = _possibleConstructorReturn(this, (RawPagination.__proto__ || Object.getPrototypeOf(RawPagination)).call(this, defaultsDeep(props, RawPagination.defaultProps)));

    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  _createClass(RawPagination, [{
    key: 'pageLink',
    value: function pageLink(_ref) {
      var label = _ref.label,
          ariaLabel = _ref.ariaLabel,
          pageNumber = _ref.pageNumber,
          _ref$additionalClassN = _ref.additionalClassName,
          additionalClassName = _ref$additionalClassN === undefined ? null : _ref$additionalClassN,
          _ref$isDisabled = _ref.isDisabled,
          isDisabled = _ref$isDisabled === undefined ? false : _ref$isDisabled,
          _ref$isActive = _ref.isActive,
          isActive = _ref$isActive === undefined ? false : _ref$isActive,
          createURL = _ref.createURL;

      var cssClasses = {
        item: cx(this.props.cssClasses.item, additionalClassName),
        link: cx(this.props.cssClasses.link)
      };
      if (isDisabled) {
        cssClasses.item = cx(cssClasses.item, this.props.cssClasses.disabled);
      } else if (isActive) {
        cssClasses.item = cx(cssClasses.item, this.props.cssClasses.active);
      }

      var url = createURL && !isDisabled ? createURL(pageNumber) : '#';

      return React.createElement(PaginationLink, {
        ariaLabel: ariaLabel,
        cssClasses: cssClasses,
        handleClick: this.handleClick,
        isDisabled: isDisabled,
        key: label + pageNumber,
        label: label,
        pageNumber: pageNumber,
        url: url
      });
    }
  }, {
    key: 'previousPageLink',
    value: function previousPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'Previous',
        additionalClassName: this.props.cssClasses.previous,
        isDisabled: pager.isFirstPage(),
        label: this.props.labels.previous,
        pageNumber: pager.currentPage - 1,
        createURL: createURL
      });
    }
  }, {
    key: 'nextPageLink',
    value: function nextPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'Next',
        additionalClassName: this.props.cssClasses.next,
        isDisabled: pager.isLastPage(),
        label: this.props.labels.next,
        pageNumber: pager.currentPage + 1,
        createURL: createURL
      });
    }
  }, {
    key: 'firstPageLink',
    value: function firstPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'First',
        additionalClassName: this.props.cssClasses.first,
        isDisabled: pager.isFirstPage(),
        label: this.props.labels.first,
        pageNumber: 0,
        createURL: createURL
      });
    }
  }, {
    key: 'lastPageLink',
    value: function lastPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'Last',
        additionalClassName: this.props.cssClasses.last,
        isDisabled: pager.isLastPage(),
        label: this.props.labels.last,
        pageNumber: pager.total - 1,
        createURL: createURL
      });
    }
  }, {
    key: 'pages',
    value: function pages(pager, createURL) {
      var _this2 = this;

      var pages = [];

      forEach(pager.pages(), function (pageNumber) {
        var isActive = pageNumber === pager.currentPage;

        pages.push(_this2.pageLink({
          ariaLabel: pageNumber + 1,
          additionalClassName: _this2.props.cssClasses.page,
          isActive: isActive,
          label: pageNumber + 1,
          pageNumber: pageNumber,
          createURL: createURL
        }));
      });

      return pages;
    }
  }, {
    key: 'handleClick',
    value: function handleClick(pageNumber, event) {
      if (isSpecialClick(event)) {
        // do not alter the default browser behavior
        // if one special key is down
        return;
      }
      event.preventDefault();
      this.props.setCurrentPage(pageNumber);
    }
  }, {
    key: 'render',
    value: function render() {
      var pager = new Paginator({
        currentPage: this.props.currentPage,
        total: this.props.nbPages,
        padding: this.props.padding
      });

      var createURL = this.props.createURL;

      return React.createElement(
        'ul',
        { className: this.props.cssClasses.root },
        this.props.showFirstLast ? this.firstPageLink(pager, createURL) : null,
        this.previousPageLink(pager, createURL),
        this.pages(pager, createURL),
        this.nextPageLink(pager, createURL),
        this.props.showFirstLast ? this.lastPageLink(pager, createURL) : null
      );
    }
  }]);

  return RawPagination;
}(React.Component);

RawPagination.defaultProps = {
  nbHits: 0,
  currentPage: 0,
  nbPages: 0
};

export default autoHideContainerHOC(RawPagination);