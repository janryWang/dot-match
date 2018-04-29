import {
    nameTok,
    colonTok,
    dotTok,
    starTok,
    bangTok,
    bracketLTok,
    bracketRTok,
    bracketDRTok,
    parenLTok,
    parenRTok,
    commaTok,
    eofTok,
    ignoreTok,
    bracketDLTok
} from "./tokens"
import { bracketDContext } from "./contexts"

const nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/

const fullCharCodeAtPos = (input, pos) => {
    const code = input.charCodeAt(pos)
    if (code <= 0xd7ff || code >= 0xe000) return code

    const next = input.charCodeAt(pos + 1)
    return (code << 10) + next - 0x35fdc00
}

const isRewordCode = code =>
    code === 42 ||
    code === 46 ||
    code === 33 ||
    code === 91 ||
    code === 93 ||
    code === 40 ||
    code === 41 ||
    code === 44 ||
    code === 58

const getError = (message, props) => {
    const err = new Error(message)
    Object.assign(err, props)
    return err
}

export class Tokenizer {
    constructor(input) {
        this.input = input
        this.state = {
            context: [],
            type: null,
            pos: 0
        }
    }

    unexpect(type) {
        type = type || this.state.type
        return getError(
            `Unexpect token "${type.flag}" in ${this.state.pos} char.`,
            {
                pos: this.state.pos
            }
        )
    }

    expectNext(type, next) {
        if (type && type.expectNext) {
            if (next && !type.expectNext.call(this, next)) {
                throw getError(
                    `Unexpect token "${
                        next.flag
                    }" token should not be behind "${type.flag}" token.(${
                        this.state.pos
                    }th char)`,
                    {
                        pos: this.state.pos
                    }
                )
            }
        }
    }

    expectPrev(type, prev) {
        if (type && type.expectPrev) {
            if (prev && !type.expectPrev.call(this, prev)) {
                throw getError(
                    `Unexpect token "${type.flag}" should not be behind "${
                        prev.flag
                    }"(${this.state.pos}th char).`,
                    {
                        pos: this.state.pos
                    }
                )
            }
        }
    }

    match(type) {
        return this.state.type === type
    }

    skipSpace() {
        loop: while (this.state.pos < this.input.length) {
            const ch = this.input.charCodeAt(this.state.pos)
            switch (ch) {
                case 32:
                case 160:
                    ++this.state.pos
                    break

                case 13:
                    if (this.input.charCodeAt(this.state.pos + 1) === 10) {
                        ++this.state.pos
                    }

                case 10:
                case 8232:
                case 8233:
                    ++this.state.pos
                    break
                default:
                    if (
                        (ch > 8 && ch < 14) ||
                        (ch >= 5760 &&
                            nonASCIIwhitespace.test(String.fromCharCode(ch)))
                    ) {
                        ++this.state.pos
                    } else {
                        break loop
                    }
            }
        }
    }

    next() {
        if (this.input.length <= this.state.pos) {
            return this.finishToken(eofTok)
        }

        this.skipSpace()
        this.readToken(this.getCode())
    }

    getCode() {
        return fullCharCodeAtPos(this.input, this.state.pos)
    }

    eat(type) {
        if (this.match(type)) {
            this.next()
            return true
        } else {
            return false
        }
    }

    readName() {
        let startPos = this.state.pos,
            string = ""
        while (true) {
            let code = this.getCode()
            if (this.input.length === this.state.pos) {
                string = this.input.slice(startPos, this.state.pos + 1)
                break
            }
            if (!isRewordCode(code)) {
                if (
                    code === 32 ||
                    code === 160 ||
                    code === 10 ||
                    code === 8232 ||
                    code === 8233
                ) {
                    string = this.input.slice(startPos, this.state.pos)
                    break
                }
                if (
                    code === 13 &&
                    this.input.charCodeAt(this.state.pos + 1) === 10
                ) {
                    string = this.input.slice(startPos, this.state.pos)
                    break
                }
                if (
                    (code > 8 && code < 14) ||
                    (code >= 5760 &&
                        nonASCIIwhitespace.test(String.fromCharCode(code)))
                ) {
                    string = this.input.slice(startPos, this.state.pos)
                    break
                }
                this.state.pos++
            } else {
                string = this.input.slice(startPos, this.state.pos)
                break
            }
        }

        this.finishToken(nameTok, string)
    }

    readIngoreString() {
        let startPos = this.state.pos,
            prevCode,
            sliced = false,
            string = ""
        while (true) {
            let code = this.getCode()
            if (code !== 93 || prevCode !== 93) {
                this.state.pos++
                prevCode = code
            } else {
                //]]
                if (!sliced) {
                    string = this.input.slice(startPos, this.state.pos - 1)
                    this.state.pos++
                    sliced = true
                    break
                }
            }
        }

        this.finishToken(ignoreTok, string)
        this.finishToken(bracketDRTok)
    }

    finishToken(type, value) {
        const preType = this.state.type
        this.state.type = type
        if (value !== undefined) this.state.value = value
        this.expectNext(preType, type)
        this.expectPrev(type, preType)
        if (type.updateContext) {
            type.updateContext.call(this, preType)
        }
    }

    readToken(code) {
        if (this.input.length <= this.state.pos) {
            this.finishToken(eofTok)
        } else if (this.curContext() === bracketDContext) {
            this.readIngoreString()
        } else if (code === 42) {
            this.state.pos++
            this.finishToken(starTok)
        } else if (code === 33) {
            this.state.pos++
            this.finishToken(bangTok)
        } else if (code === 46) {
            this.state.pos++
            this.finishToken(dotTok)
        } else if (code === 91) {
            this.state.pos++
            if (this.getCode() === 91) {
                this.state.pos++
                return this.finishToken(bracketDLTok)
            }
            this.finishToken(bracketLTok)
        } else if (code === 93) {
            this.state.pos++
            this.finishToken(bracketRTok)
        } else if (code === 40) {
            this.state.pos++
            this.finishToken(parenLTok)
        } else if (code === 41) {
            this.state.pos++
            this.finishToken(parenRTok)
        } else if (code === 44) {
            this.state.pos++
            this.finishToken(commaTok)
        } else if (code === 58) {
            this.state.pos++
            this.finishToken(colonTok)
        } else {
            this.readName()
        }
    }
}