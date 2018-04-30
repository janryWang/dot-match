"use strict";

exports.__esModule = true;
exports.default = exports.createMatcher = void 0;

var _parser = require("./parser");

var _lruMemoize = _interopRequireDefault(require("lru-memoize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseDPML = (0, _lruMemoize.default)(200)(function (string) {
  var parser = new _parser.Parser(string);
  return parser.parse();
});

var toArray = function toArray(val) {
  return Array.isArray(val) ? val : val ? [val] : [];
};

var createMatcherByAST = function createMatcherByAST(root) {
  var stepDepth = 0;

  var matchPath = function matchPath(path, node, start, parent) {
    if (start === void 0) {
      start = 0;
    }

    if (!node) return true;

    switch (node.type) {
      case "Identifier":
        return node.value === path[start] && matchPath(path, node.after, start);

      case "WildcardOperator":
        return node.filter ? matchPath(path, node.filter, start, node) : matchPath(path, node.after, start);

      case "GroupExpression":
        if (node.isNone) {
          return toArray(node.value).every(function (_node) {
            var unmatched = !matchPath(path, _node, start) && matchPath(path, parent.after, stepDepth);

            if (unmatched) {
              stepDepth = start;
            }

            return unmatched;
          });
        } else {
          return toArray(node.value).some(function (_node) {
            var matched = matchPath(path, _node, start) && matchPath(path, parent.after, stepDepth);

            if (!matched) {
              stepDepth = start;
            }

            return matched;
          });
        }

      case "RangeExpression":
        if (node.start) {
          if (node.end) {
            return path[start] >= parseInt(node.start.value) && path[start] <= parseInt(node.end.value) && matchPath(path, parent.after, start);
          } else {
            return path[start] >= parseInt(node.start.value) && matchPath(path, parent.after, start);
          }
        } else {
          if (node.end) {
            return path[start] <= parseInt(node.end.value) && matchPath(path, parent.after, start);
          } else {
            return matchPath(path, parent.after, start);
          }
        }

      case "DotOperator":
        stepDepth++;
        return matchPath(path, node.after, start + 1);
    }

    return true;
  };

  return function (path) {
    stepDepth = 0;
    return matchPath(path, root);
  };
};

var createMatcher = function createMatcher(string) {
  return createMatcherByAST(parseDPML(string));
};

exports.createMatcher = createMatcher;
var _default = createMatcher;
exports.default = _default;