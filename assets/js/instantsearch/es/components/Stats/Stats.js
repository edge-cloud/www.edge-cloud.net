var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import PropTypes from 'prop-types';
import React from 'preact-compat';

import Template from '../Template.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export var RawStats = function (_React$Component) {
  _inherits(RawStats, _React$Component);

  function RawStats() {
    _classCallCheck(this, RawStats);

    return _possibleConstructorReturn(this, (RawStats.__proto__ || Object.getPrototypeOf(RawStats)).apply(this, arguments));
  }

  _createClass(RawStats, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return this.props.nbHits !== nextProps.hits || this.props.processingTimeMS !== nextProps.processingTimeMS;
    }
  }, {
    key: 'render',
    value: function render() {
      var data = {
        hasManyResults: this.props.nbHits > 1,
        hasNoResults: this.props.nbHits === 0,
        hasOneResult: this.props.nbHits === 1,
        hitsPerPage: this.props.hitsPerPage,
        nbHits: this.props.nbHits,
        nbPages: this.props.nbPages,
        page: this.props.page,
        processingTimeMS: this.props.processingTimeMS,
        query: this.props.query,
        cssClasses: this.props.cssClasses
      };

      return React.createElement(Template, _extends({ data: data, templateKey: 'body' }, this.props.templateProps));
    }
  }]);

  return RawStats;
}(React.Component);

export default autoHideContainerHOC(headerFooterHOC(RawStats));