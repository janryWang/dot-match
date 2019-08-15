"use strict";

exports.__esModule = true;
exports["default"] = exports.createMatcher = exports.isWildMatchPath = exports.isAbsolutePath = exports.getPathSegments = exports.parseDPML = void 0;

var _parser = require("./parser");

var _fastMemoize = _interopRequireDefault(require("fast-memoize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var parseDPML = function parseDPML(string) {
  var parser = new _parser.Parser(string);
  return parser.parse();
};

exports.parseDPML = parseDPML;

var isFn = function isFn(val) {
  return typeof val === "function";
};

var isArr = function isArr(val) {
  return Array.isArray(val);
};

var isStr = function isStr(val) {
  return typeof val == "string";
};

var toArray = function toArray(val) {
  return isArr(val) ? val : val ? [val] : [];
};

var createMatcherByAST = function createMatcherByAST(root) {
  var stepIndex = 0;
  var lastNode = root;
  var parents = [];

  var matchPath = function matchPath(path, node, start) {
    if (start === void 0) {
      start = 0;
    }

    if (!node) {
      if (path[start + 1]) return false;
      if (start == path.length - 1) return true;
    }

    if (node) {
      switch (node.type) {
        case "Identifier":
          lastNode = node;

          if (node.after && node.after.type === "ExpandOperator") {
            return node.value === String(path[start]).substring(0, node.value.length) && (node.after.after ? matchPath(path, node.after.after, start) : !!path[start]);
          }

          if (path[start + 1] && !node.after) {
            if (parents.length) {
              for (var i = parents.length - 1; i >= 0; i--) {
                if (!parents[i].after || !parents[i].filter) return false;
              }
            } else {
              return false;
            }
          }

          return node.value == path[start] && (node.after ? matchPath(path, node.after, start) : !!path[start]);

        case "ExpandOperator":
          return matchPath(path, node.after, start);

        case "WildcardOperator":
          lastNode = node;
          parents.push(node);
          var result = node.filter ? matchPath(path, node.filter, start) : node.after ? matchPath(path, node.after, start) : !!path[start];
          parents.pop();
          return result;

        case "GroupExpression":
          if (node.isExclude) {
            return toArray(node.value).every(function (_node, index) {
              var unmatched = !matchPath(path, _node, start, node);

              if (unmatched) {
                stepIndex = start;
              }

              return unmatched;
            });
          } else {
            return toArray(node.value).some(function (_node) {
              var matched = matchPath(path, _node, start, node);

              if (!matched) {
                stepIndex = start;
              }

              return matched;
            });
          }

        case "RangeExpression":
          var parent = parents[parents.length - 1];

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
          return matchPath(path, node.after, start + 1);
      }
    }

    return true;
  };

  return function (path) {
    stepIndex = 0;
    var matchResult = matchPath(path, root);
    if (!lastNode) return false;

    if (lastNode == root && lastNode.type === "WildcardOperator") {
      return true;
    }

    return matchResult;
  };
};

var matchAll = (0, _fastMemoize["default"])(function (string, path) {
  return createMatcherByAST(parseDPML(string))(toArray(path));
});

var traverse = function traverse(ast, callback) {
  if (!isFn(callback)) return;
  var result = callback(ast);
  if (result === false) return;

  if (ast.after) {
    traverse(ast.after, callback);
  }

  if (ast.filter) {
    traverse(ast.filter, callback);
  }

  if (isArr(ast.value)) {
    ast.value.forEach(function (node) {
      traverse(node, callback);
    });
  }
};

var getPathSegments = (0, _fastMemoize["default"])(function (pattern) {
  var segments = [];
  var isAbsolutePath = true;
  traverse(parseDPML(pattern), function (_ref) {
    var type = _ref.type,
        value = _ref.value;

    if (type !== "Identifier" && type !== "DotOperator") {
      isAbsolutePath = false;
      return false;
    } else if (type == "Identifier") {
      segments.push(value);
    }
  });
  return isAbsolutePath ? segments : [];
});
exports.getPathSegments = getPathSegments;
var isAbsolutePath = (0, _fastMemoize["default"])(function (pattern) {
  var isAbsolutePath = true;
  traverse(parseDPML(pattern), function (_ref2) {
    var type = _ref2.type;

    if (type !== "Identifier" && type !== "DotOperator") {
      isAbsolutePath = false;
      return false;
    }
  });
  return isAbsolutePath;
});
exports.isAbsolutePath = isAbsolutePath;
var isWildMatchPath = (0, _fastMemoize["default"])(function (pattern) {
  var hasWildMatchPath = false;
  traverse(parseDPML(pattern), function (node) {
    var type = node.type;

    if (type === "RangeExpression") {
      var isWild = !node.end.value && !!node.start.value || !node.start.value && !!node.end.value;

      if (isWild) {
        hasWildMatchPath = true;
        return false;
      }
    } else if (type === "WildcardOperator" && !node.filter || type === "ExpandOperator") {
      hasWildMatchPath = true;
      return false;
    }
  });
  return hasWildMatchPath;
});
exports.isWildMatchPath = isWildMatchPath;

var createMatcher = function createMatcher(string, cache) {
  return function (path) {
    return matchAll(string, path);
  };
};

exports.createMatcher = createMatcher;
var _default = createMatcher;
exports["default"] = _default;