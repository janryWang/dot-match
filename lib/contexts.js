"use strict";

exports.__esModule = true;
exports.parenContext = exports.bracketDContext = exports.bracketContext = void 0;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var ContextType = function ContextType(flag, props) {
  return _extends({
    flag: flag
  }, props);
};

var bracketContext = ContextType("[]");
exports.bracketContext = bracketContext;
var bracketDContext = ContextType("[[]]");
exports.bracketDContext = bracketDContext;
var parenContext = ContextType("()");
exports.parenContext = parenContext;