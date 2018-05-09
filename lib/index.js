"use strict";

exports.__esModule = true;
exports.default = exports.createMatcher = exports.parseDPML = void 0;

var _parser = require("./parser");

var _lruMemoize = _interopRequireDefault(require("lru-memoize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseDPML = (0, _lruMemoize.default)(200)(function (string) {
  var parser = new _parser.Parser(string);
  return parser.parse();
});
exports.parseDPML = parseDPML;

var toArray = function toArray(val) {
  return Array.isArray(val) ? val : val ? [val] : [];
};

var createMatcherByAST = function createMatcherByAST(root) {
  var stepIndex = 0;
  var matchedMaxDepth = 0;
  var lastNode = root;

  var matchPath = function matchPath(path, node, start, parent) {
    if (start === void 0) {
      start = 0;
    }

    if (!node) {
      if (!parent) return true;
    }

    if (node) {
      switch (node.type) {
        case "Identifier":
          lastNode = node;
          return node.value === path[start] && matchPath(path, node.after, start);

        case "WildcardOperator":
          lastNode = node;
          return node.filter ? matchPath(path, node.filter, start, node) : node.after ? matchPath(path, node.after, start) : matchedMaxDepth <= path.length - 1;

        case "GroupExpression":
          if (node.isNone) {
            return toArray(node.value).every(function (_node, index) {
              matchedMaxDepth = start;
              var unmatched = !matchPath(path, _node, start) && matchPath(path, parent.after, stepIndex);

              if (unmatched) {
                stepIndex = start;
              }

              return unmatched;
            });
          } else {
            return toArray(node.value).some(function (_node) {
              var matched = matchPath(path, _node, start) && matchPath(path, parent.after, stepIndex);

              if (!matched) {
                stepIndex = start;
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
          stepIndex++;

          if (matchedMaxDepth <= path.length - 1) {
            matchedMaxDepth++;
          }

          return matchPath(path, node.after, start + 1);
      }
    }

    return true;
  };

  return function (path) {
    stepIndex = 0;
    matchedMaxDepth = 0;
    var matched = matchPath(path, root);
    if (!lastNode) return false;

    if (lastNode == root && lastNode.type === "WildcardOperator") {
      return true;
    }

    if (lastNode.type == "Identifier") {
      return matched && matchedMaxDepth === path.length - 1;
    } else if (lastNode.type == "WildcardOperator") {
      return matched && matchedMaxDepth <= path.length - 1;
    } else {
      return false;
    }
  };
};

var createMatcher = function createMatcher(string) {
  return createMatcherByAST(parseDPML(string));
};

exports.createMatcher = createMatcher;
var _default = createMatcher;
exports.default = _default;