"use strict";

exports.__esModule = true;
exports.default = exports.createMatcher = exports.parseDPML = void 0;

var _parser = require("./parser");

var parseDPML = function parseDPML(string) {
  var parser = new _parser.Parser(string);
  return parser.parse();
};

exports.parseDPML = parseDPML;

var isArr = function isArr(val) {
  return Array.isArray(val);
};

var isStr = function isStr(val) {
  return typeof val == "string";
};

var toArray = function toArray(val) {
  return isArr(val) ? val : val ? [val] : [];
};

var toString = function toString(val) {
  if (!val) return "";

  if (isArr(val)) {
    return val.join(".");
  }

  return isStr(val) ? val : "";
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

          if (node.after && node.after.type === "ExpandOperator") {
            return node.value === path[start].substring(0, node.value.length) && matchPath(path, node.after.after, start);
          }

          return node.value == path[start] && matchPath(path, node.after, start);

        case "ExpandOperator":
          return matchPath(path, node.after, start);

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

var createMatcher = function createMatcher(string, cache) {
  return function (path) {
    var result,
        key = toString(path),
        needCache = cache instanceof Map;

    if (needCache) {
      var lastValue = cache.get(key);
      if (lastValue !== undefined) return lastValue;
    }

    result = createMatcherByAST(parseDPML(string))(toArray(path));

    if (needCache) {
      cache.set(key, result);
    }

    return result;
  };
};

exports.createMatcher = createMatcher;
var _default = createMatcher;
exports.default = _default;