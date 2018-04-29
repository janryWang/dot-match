import { Tokenizer } from "./tokenizer"
import {
    nameTok,
    colonTok,
    dotTok,
    starTok,
    bangTok,
    bracketLTok,
    bracketRTok,
    bracketDLTok,
    bracketDRTok,
    parenLTok,
    parenRTok,
    commaTok,
    eofTok,
    ignoreTok
} from "./tokens"
import { bracketDContext, bracketContext, parenContext } from "./contexts"

export class Parser extends Tokenizer {
    parse() {
        let node
        if (!this.eat(eofTok)) {
            this.next()
            node = this.parseAtom(this.state.type)
        }

        return node
    }

    curContext() {
        return this.state.context[this.state.context.length - 1]
    }

    parseAtom(type) {
        switch (type) {
            case nameTok:
                return this.parseIdentifier()
            case starTok:
                return this.parseWildcardOperator()
            case bracketLTok:
                return this.parseRangeExpression()
            case bracketDLTok:
                return this.parseIgnoreOperator()
            case dotTok:
                return this.parseDotOperator()
        }
    }

    parseIdentifier(parent) {
        const node = {
            type: "Identifier",
            value: this.state.value
        }

        this.next()

        node.after = this.parseAtom(this.state.type)

        return node
    }

    parseWildcardOperator(parent) {
        const node = {
            type: "WildcardOperator"
        }

        this.next()

        if (this.state.type === parenLTok) {
            node.filter = this.parseGroupExpression()
        } else if (this.state.type === bracketLTok) {
            node.filter = this.parseRangeExpression()
        }

        node.after = this.parseAtom(this.state.type)

        return node
    }

    parseDotOperator() {
        const node = {
            type: "DotOperator"
        }

        this.next()

        node.after = this.parseAtom(this.state.type)

        return node
    }

    parseIgnoreOperator() {
        this.next()

        const node = {
            type: "IgnoreOperator",
            value: this.state.value
        }

        this.next()

        node.after = this.parseAtom(this.state.type)

        this.next()

        return node
    }

    parseGroupExpression() {
        const node = {
            type: "GroupExpression",
            value: []
        }

        this.next()

        loop: while (true) {
            switch (this.state.type) {
                case commaTok:
                    this.next()
                    break
                case bangTok:
                    node.isNone = true
                    this.next()
                    break
                case eofTok:
                    break loop
                case parenRTok:
                    if (this.curContext() !== bracketContext) {
                        this.next()
                        break loop
                    } else {
                        this.next()
                        break
                    }
                    break
                default:
                    node.value.push(this.parseAtom(this.state.type))
            }
        }

        this.next()

        node.after = this.parseAtom(this.state.type)

        return node
    }

    parseRangeExpression() {
        const node = {
            type: "RangeExpression"
        }

        this.next()

        let start = false

        loop: while (true) {
            switch (this.state.type) {
                case colonTok:
                    this.next()
                    break
                case bracketRTok:
                    if (!this.curContext()) {
                        this.next()
                        break loop
                    } else {
                        this.next()
                        break
                    }
                case commaTok:
                    throw this.unexpect()
                case eofTok:
                    break loop
                default:
                    if (!start) {
                        node.start = this.parseAtom(this.state.type)
                        start = true
                        this.next()
                    } else {
                        node.end = this.parseAtom(this.state.type)
                    }
            }
        }

        node.after = this.parseAtom(this.state.type)

        return node
    }
}
