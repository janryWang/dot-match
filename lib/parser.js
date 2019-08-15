"use strict";

exports.__esModule = true;
exports.Parser = void 0;

var _tokenizer = require("./tokenizer");

var _tokens = require("./tokens");

var _contexts = require("./contexts");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Parser =
/*#__PURE__*/
function (_Tokenizer) {
  _inheritsLoose(Parser, _Tokenizer);

  function Parser() {
    return _Tokenizer.apply(this, arguments) || this;
  }

  var _proto = Parser.prototype;

  _proto.parse = function parse() {
    var node;

    if (!this.eat(_tokens.eofTok)) {
      this.next();
      node = this.parseAtom(this.state.type);
    }

    return node;
  };

  _proto.append = function append(parent, node) {
    if (parent && node) {
      parent.after = node;
    }
  };

  _proto.curContext = function curContext() {
    return this.state.context[this.state.context.length - 1];
  };

  _proto.parseAtom = function parseAtom(type) {
    switch (type) {
      case _tokens.nameTok:
        return this.parseIdentifier();

      case _tokens.expandTok:
        return this.parseExpandOperator();

      case _tokens.starTok:
        return this.parseWildcardOperator();

      case _tokens.bracketDLTok:
        return this.parseIgnoreOperator();

      case _tokens.dotTok:
        return this.parseDotOperator();
    }
  };

  _proto.parseIdentifier = function parseIdentifier(parent) {
    var node = {
      type: "Identifier",
      value: this.state.value
    };
    this.next();
    this.append(node, this.parseAtom(this.state.type));
    return node;
  };

  _proto.parseExpandOperator = function parseExpandOperator() {
    var node = {
      type: "ExpandOperator"
    };
    this.next();
    this.append(node, this.parseAtom(this.state.type));
    return node;
  };

  _proto.parseWildcardOperator = function parseWildcardOperator() {
    var node = {
      type: "WildcardOperator"
    };
    this.next();

    if (this.state.type === _tokens.parenLTok) {
      node.filter = this.parseGroupExpression(node);
    } else if (this.state.type === _tokens.bracketLTok) {
      node.filter = this.parseRangeExpression(node);
    }

    this.append(node, this.parseAtom(this.state.type));
    return node;
  };

  _proto.parseDotOperator = function parseDotOperator() {
    var node = {
      type: "DotOperator"
    };
    this.next();
    this.append(node, this.parseAtom(this.state.type));
    return node;
  };

  _proto.parseIgnoreOperator = function parseIgnoreOperator() {
    this.next();
    var node = {
      type: "Identifier",
      value: this.state.value
    };
    this.next();
    this.append(node, this.parseAtom(this.state.type));
    this.next();
    return node;
  };

  _proto.parseGroupExpression = function parseGroupExpression(parent) {
    var node = {
      type: "GroupExpression",
      value: []
    };
    this.next();

    loop: while (true) {
      switch (this.state.type) {
        case _tokens.commaTok:
          this.next();
          break;

        case _tokens.bangTok:
          node.isExclude = true;
          this.next();
          break;

        case _tokens.eofTok:
          break loop;

        case _tokens.parenRTok:
          break loop;

        default:
          node.value.push(this.parseAtom(this.state.type));
      }
    }

    this.next();
    this.append(parent, this.parseAtom(this.state.type));
    return node;
  };

  _proto.parseRangeExpression = function parseRangeExpression(parent) {
    var node = {
      type: "RangeExpression"
    };
    this.next();
    var start = false,
        hasColon = false;

    loop: while (true) {
      switch (this.state.type) {
        case _tokens.colonTok:
          hasColon = true;
          start = true;
          this.next();
          break;

        case _tokens.bracketRTok:
          if (!hasColon && !node.end) {
            node.end = node.start;
          }

          break loop;

        case _tokens.commaTok:
          throw this.unexpect();

        case _tokens.eofTok:
          break loop;

        default:
          if (!start) {
            node.start = this.parseAtom(this.state.type);
          } else {
            node.end = this.parseAtom(this.state.type);
          }

      }
    }

    this.next();
    this.append(parent, this.parseAtom(this.state.type));
    return node;
  };

  return Parser;
}(_tokenizer.Tokenizer);

exports.Parser = Parser;