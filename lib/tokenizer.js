"use strict";

exports.__esModule = true;
exports.Tokenizer = void 0;

var _tokens = require("./tokens");

var _contexts = require("./contexts");

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var fullCharCodeAtPos = function fullCharCodeAtPos(input, pos) {
  var code = input.charCodeAt(pos);
  if (code <= 0xd7ff || code >= 0xe000) return code;
  var next = input.charCodeAt(pos + 1);
  return (code << 10) + next - 0x35fdc00;
};

var isRewordCode = function isRewordCode(code) {
  return code === 42 || code === 46 || code === 33 || code === 91 || code === 93 || code === 40 || code === 41 || code === 44 || code === 58 || code === 126;
};

var getError = function getError(message, props) {
  var err = new Error(message);
  Object.assign(err, props);
  return err;
};

var slice = function slice(string, start, end) {
  var str = "";

  for (var i = start; i < end; i++) {
    var ch = string.charAt(i);

    if (ch !== "\\") {
      str += ch;
    }
  }

  return str;
};

var Tokenizer =
/*#__PURE__*/
function () {
  function Tokenizer(input) {
    this.input = input;
    this.state = {
      context: [],
      type: null,
      pos: 0
    };
  }

  var _proto = Tokenizer.prototype;

  _proto.unexpect = function unexpect(type) {
    type = type || this.state.type;
    return getError("Unexpect token \"" + type.flag + "\" in " + this.state.pos + " char.", {
      pos: this.state.pos
    });
  };

  _proto.expectNext = function expectNext(type, next) {
    if (type && type.expectNext) {
      if (next && !type.expectNext.call(this, next)) {
        throw getError("Unexpect token \"" + next.flag + "\" token should not be behind \"" + type.flag + "\" token.(" + this.state.pos + "th char)", {
          pos: this.state.pos
        });
      }
    }
  };

  _proto.expectPrev = function expectPrev(type, prev) {
    if (type && type.expectPrev) {
      if (prev && !type.expectPrev.call(this, prev)) {
        throw getError("Unexpect token \"" + type.flag + "\" should not be behind \"" + prev.flag + "\"(" + this.state.pos + "th char).", {
          pos: this.state.pos
        });
      }
    }
  };

  _proto.match = function match(type) {
    return this.state.type === type;
  };

  _proto.skipSpace = function skipSpace() {
    if (this.curContext() === _contexts.bracketDContext) return;

    loop: while (this.state.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.state.pos);

      switch (ch) {
        case 32:
        case 160:
          ++this.state.pos;
          break;

        case 13:
          if (this.input.charCodeAt(this.state.pos + 1) === 10) {
            ++this.state.pos;
          }

        case 10:
        case 8232:
        case 8233:
          ++this.state.pos;
          break;

        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.state.pos;
          } else {
            break loop;
          }

      }
    }
  };

  _proto.next = function next() {
    if (this.input.length <= this.state.pos) {
      return this.finishToken(_tokens.eofTok);
    }

    this.skipSpace();
    this.readToken(this.getCode(), this.state.pos > 0 ? this.getCode(this.state.pos - 1) : -Infinity);
  };

  _proto.getCode = function getCode(pos) {
    if (pos === void 0) {
      pos = this.state.pos;
    }

    return fullCharCodeAtPos(this.input, pos);
  };

  _proto.eat = function eat(type) {
    if (this.match(type)) {
      this.next();
      return true;
    } else {
      return false;
    }
  };

  _proto.readKeyWord = function readKeyWord() {
    var startPos = this.state.pos,
        string = "";

    while (true) {
      var code = this.getCode();
      var prevCode = this.getCode(this.state.pos - 1);

      if (this.input.length === this.state.pos) {
        string = slice(this.input, startPos, this.state.pos + 1);
        break;
      }

      if (!isRewordCode(code) || prevCode === 92) {
        if (code === 32 || code === 160 || code === 10 || code === 8232 || code === 8233) {
          string = slice(this.input, startPos, this.state.pos);
          break;
        }

        if (code === 13 && this.input.charCodeAt(this.state.pos + 1) === 10) {
          string = slice(this.input, startPos, this.state.pos);
          break;
        }

        if (code > 8 && code < 14 || code >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(code))) {
          string = slice(this.input, startPos, this.state.pos);
          break;
        }

        this.state.pos++;
      } else {
        string = slice(this.input, startPos, this.state.pos);
        break;
      }
    }

    this.finishToken(_tokens.nameTok, string);
  };

  _proto.readIngoreString = function readIngoreString() {
    var startPos = this.state.pos,
        prevCode,
        sliced = false,
        string = "";

    while (true) {
      var code = this.getCode();
      if (this.state.pos >= this.input.length) break;

      if ((code === 91 || code === 93) && prevCode === 92) {
        this.state.pos++;
        prevCode = "";
      } else if (code == 93 && prevCode === 93) {
        string = this.input.slice(startPos, this.state.pos - 1).replace(/\\([\[\]])/g, "$1");
        this.state.pos++;
        break;
      } else {
        this.state.pos++;
        prevCode = code;
      }
    }

    this.finishToken(_tokens.ignoreTok, string);
    this.finishToken(_tokens.bracketDRTok);
  };

  _proto.finishToken = function finishToken(type, value) {
    var preType = this.state.type;
    this.state.type = type;
    if (value !== undefined) this.state.value = value;
    this.expectNext(preType, type);
    this.expectPrev(type, preType);

    if (type.updateContext) {
      type.updateContext.call(this, preType);
    }
  };

  _proto.readToken = function readToken(code, prevCode) {
    if (prevCode === 92) {
      return this.readKeyWord();
    }

    if (this.input.length <= this.state.pos) {
      this.finishToken(_tokens.eofTok);
    } else if (this.curContext() === _contexts.bracketDContext) {
      this.readIngoreString();
    } else if (code === 42) {
      this.state.pos++;
      this.finishToken(_tokens.starTok);
    } else if (code === 33) {
      this.state.pos++;
      this.finishToken(_tokens.bangTok);
    } else if (code === 46) {
      this.state.pos++;
      this.finishToken(_tokens.dotTok);
    } else if (code === 91) {
      this.state.pos++;

      if (this.getCode() === 91) {
        this.state.pos++;
        return this.finishToken(_tokens.bracketDLTok);
      }

      this.finishToken(_tokens.bracketLTok);
    } else if (code === 126) {
      this.state.pos++;
      this.finishToken(_tokens.expandTok);
    } else if (code === 93) {
      this.state.pos++;
      this.finishToken(_tokens.bracketRTok);
    } else if (code === 40) {
      this.state.pos++;
      this.finishToken(_tokens.parenLTok);
    } else if (code === 41) {
      this.state.pos++;
      this.finishToken(_tokens.parenRTok);
    } else if (code === 44) {
      this.state.pos++;
      this.finishToken(_tokens.commaTok);
    } else if (code === 58) {
      this.state.pos++;
      this.finishToken(_tokens.colonTok);
    } else {
      this.readKeyWord();
    }
  };

  return Tokenizer;
}();

exports.Tokenizer = Tokenizer;