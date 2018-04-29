"use strict";

exports.__esModule = true;
exports.Parser = void 0;

var _tokenizer = require("./tokenizer");

var _tokens = require("./tokens");

var _contexts = require("./contexts");

function _inheritsLoose(subClass, superClass) { subClass.prototype.__proto__ = superClass && superClass.prototype; subClass.__proto__ = superClass; }

var Parser =
/*#__PURE__*/
function (_Tokenizer) {
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

  _proto.curContext = function curContext() {
    return this.state.context[this.state.context.length - 1];
  };

  _proto.parseAtom = function parseAtom(type) {
    switch (type) {
      case _tokens.nameTok:
        return this.parseIdentifier();

      case _tokens.starTok:
        return this.parseWildcardOperator();

      case _tokens.bracketLTok:
        return this.parseRangeExpression();

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
    node.after = this.parseAtom(this.state.type);
    return node;
  };

  _proto.parseWildcardOperator = function parseWildcardOperator(parent) {
    var node = {
      type: "WildcardOperator"
    };
    this.next();

    if (this.state.type === _tokens.parenLTok) {
      node.filter = this.parseGroupExpression();
    } else if (this.state.type === _tokens.bracketLTok) {
      node.filter = this.parseRangeExpression();
    }

    node.after = this.parseAtom(this.state.type);
    return node;
  };

  _proto.parseDotOperator = function parseDotOperator() {
    var node = {
      type: "DotOperator"
    };
    this.next();
    node.after = this.parseAtom(this.state.type);
    return node;
  };

  _proto.parseIgnoreOperator = function parseIgnoreOperator() {
    this.next();
    var node = {
      type: "IgnoreOperator",
      value: this.state.value
    };
    this.next();
    node.after = this.parseAtom(this.state.type);
    this.next();
    return node;
  };

  _proto.parseGroupExpression = function parseGroupExpression() {
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
          node.isNone = true;
          this.next();
          break;

        case _tokens.eofTok:
          break loop;

        case _tokens.parenRTok:
          if (this.curContext() !== _contexts.bracketContext) {
            this.next();
            break loop;
          } else {
            this.next();
            break;
          }

          break;

        default:
          node.value.push(this.parseAtom(this.state.type));
      }
    }

    this.next();
    node.after = this.parseAtom(this.state.type);
    return node;
  };

  _proto.parseRangeExpression = function parseRangeExpression() {
    var node = {
      type: "RangeExpression"
    };
    this.next();
    var start = false;

    loop: while (true) {
      switch (this.state.type) {
        case _tokens.colonTok:
          this.next();
          break;

        case _tokens.bracketRTok:
          if (!this.curContext()) {
            this.next();
            break loop;
          } else {
            this.next();
            break;
          }

        case _tokens.commaTok:
          throw this.unexpect();

        case _tokens.eofTok:
          break loop;

        default:
          if (!start) {
            node.start = this.parseAtom(this.state.type);
            start = true;
            this.next();
          } else {
            node.end = this.parseAtom(this.state.type);
          }

      }
    }

    node.after = this.parseAtom(this.state.type);
    return node;
  };

  _inheritsLoose(Parser, _Tokenizer);

  return Parser;
}(_tokenizer.Tokenizer);

exports.Parser = Parser;