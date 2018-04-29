"use strict";

exports.__esModule = true;
exports.createMatcher = void 0;

var _parser = require("./parser");

var _lruMemoize = _interopRequireDefault(require("lru-memoize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createMatcherByAST = function createMatcherByAST(ast) {};

var createMatcher = (0, _lruMemoize.default)(200)(function (string) {
  var parser = new _parser.Parser(string);
  var tree = parser.parse();
  var match = createMatcherByAST(tree);
  return function (path) {
    if (!Array.isArray(path)) throw new Error("The matched path must be an array!");
    return match(path);
  };
});
exports.createMatcher = createMatcher;