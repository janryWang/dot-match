"use strict";

exports.__esModule = true;
exports.eofTok = exports.expandTok = exports.ignoreTok = exports.commaTok = exports.parenRTok = exports.parenLTok = exports.bracketDRTok = exports.bracketDLTok = exports.bracketRTok = exports.bracketLTok = exports.colonTok = exports.bangTok = exports.dotTok = exports.starTok = exports.nameTok = void 0;

var _contexts = require("./contexts");

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var TokenType = function TokenType(flag, props) {
  return _extends({
    flag: flag
  }, props);
};

var nameTok = TokenType("name", {
  expectNext: function expectNext(next) {
    return next === dotTok || next === commaTok || next === eofTok || next === bracketRTok || next === parenRTok || next === colonTok || next === expandTok;
  }
});
exports.nameTok = nameTok;
var starTok = TokenType("*", {
  expectNext: function expectNext(next) {
    return next === dotTok || next === starTok || next === parenLTok || next === bracketLTok || next === eofTok || next === commaTok;
  }
});
exports.starTok = starTok;
var dotTok = TokenType(".", {
  expectNext: function expectNext(next) {
    return next === nameTok || next === bracketDLTok || next === starTok || next === bracketLTok;
  },
  expectPrev: function expectPrev(prev) {
    return prev === nameTok || prev === bracketDRTok || prev === starTok || prev === parenRTok || prev === bracketRTok || prev === expandTok;
  }
});
exports.dotTok = dotTok;
var bangTok = TokenType("!", {
  expectNext: function expectNext(next) {
    return next === nameTok || next === bracketDLTok;
  }
});
exports.bangTok = bangTok;
var colonTok = TokenType(":", {
  expectNext: function expectNext(next) {
    return next === nameTok || next === bracketDLTok || next === bracketRTok;
  }
});
exports.colonTok = colonTok;
var bracketLTok = TokenType("[", {
  expectNext: function expectNext(next) {
    return next === nameTok || next === bracketDLTok || next === colonTok || next === bracketLTok || next === ignoreTok;
  },
  expectPrev: function expectPrev(prev) {
    return prev === starTok || prev === bracketLTok || prev === dotTok || prev === parenLTok || prev == commaTok;
  },
  updateContext: function updateContext(prev) {
    this.state.context.push(_contexts.bracketContext);
  }
});
exports.bracketLTok = bracketLTok;
var bracketRTok = TokenType("]", {
  expectNext: function expectNext(next) {
    return next === dotTok || next === eofTok || next === commaTok || next === parenRTok || next === bracketRTok;
  },
  updateContext: function updateContext(prev) {
    if (this.curContext() !== _contexts.bracketContext) throw this.unexpect();
    this.state.context.pop();
  }
});
exports.bracketRTok = bracketRTok;
var bracketDLTok = TokenType("[[", {
  updateContext: function updateContext() {
    this.state.context.push(_contexts.bracketDContext);
  }
});
exports.bracketDLTok = bracketDLTok;
var bracketDRTok = TokenType("]]", {
  updateContext: function updateContext() {
    if (this.curContext() !== _contexts.bracketDContext) throw this.unexpect();
    this.state.context.pop();
  }
});
exports.bracketDRTok = bracketDRTok;
var parenLTok = TokenType("(", {
  expectNext: function expectNext(next) {
    return next === nameTok || next === bracketDLTok || next === bangTok || next === bracketLTok;
  },
  expectPrev: function expectPrev(prev) {
    return prev === starTok;
  },
  updateContext: function updateContext(prev) {
    this.state.context.push(_contexts.parenContext);
  }
});
exports.parenLTok = parenLTok;
var parenRTok = TokenType(")", {
  expectNext: function expectNext(next) {
    return next === dotTok || next === eofTok || next === commaTok;
  },
  updateContext: function updateContext() {
    if (this.curContext() !== _contexts.parenContext) throw this.unexpect();
    this.state.context.pop();
  }
});
exports.parenRTok = parenRTok;
var commaTok = TokenType(",", {
  expectNext: function expectNext(next) {
    return next === nameTok || next === bracketDLTok || next === bracketLTok;
  }
});
exports.commaTok = commaTok;
var ignoreTok = TokenType("ignore", {
  expectNext: function expectNext(next) {
    return next === bracketDRTok;
  },
  expectPrev: function expectPrev(prev) {
    return prev == bracketDLTok;
  }
});
exports.ignoreTok = ignoreTok;
var expandTok = TokenType("expandTok", {
  expectNext: function expectNext(next) {
    return next === dotTok || next === eofTok || next === commaTok || next === parenRTok;
  }
});
exports.expandTok = expandTok;
var eofTok = TokenType("eof");
exports.eofTok = eofTok;