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
    expandTok,
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

    append(parent, node) {
        if (parent && node) {
            parent.after = node
        }
    }

    curContext() {
        return this.state.context[this.state.context.length - 1]
    }

    parseAtom(type) {
        switch (type) {
            case nameTok:
                return this.parseIdentifier()
            case expandTok:
                return this.parseExpandOperator()
            case starTok:
                return this.parseWildcardOperator()
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

        this.append(node, this.parseAtom(this.state.type))

        return node
    }

    parseExpandOperator() {
        const node = {
            type: "ExpandOperator"
        }

        this.next()

        this.append(node, this.parseAtom(this.state.type))

        return node
    }

    parseWildcardOperator() {
        const node = {
            type: "WildcardOperator"
        }

        this.next()

        if (this.state.type === parenLTok) {
            node.filter = this.parseGroupExpression(node)
        } else if (this.state.type === bracketLTok) {
            node.filter = this.parseRangeExpression(node)
        }

        this.append(node, this.parseAtom(this.state.type))

        return node
    }

    parseDotOperator() {
        const node = {
            type: "DotOperator"
        }

        this.next()

        this.append(node, this.parseAtom(this.state.type))

        return node
    }

    parseIgnoreOperator() {
        this.next()

        const node = {
            type: "Identifier",
            value: this.state.value
        }

        this.next()

        this.append(node, this.parseAtom(this.state.type))

        this.next()

        return node
    }

    parseGroupExpression(parent) {
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
                    node.isExclude = true
                    this.next()
                    break
                case eofTok:
                    break loop
                case parenRTok:
                    break loop
                default:
                    node.value.push(this.parseAtom(this.state.type))
            }
        }

        this.next()

        this.append(parent, this.parseAtom(this.state.type))

        return node
    }

    parseRangeExpression(parent) {
        const node = {
            type: "RangeExpression"
        }

        this.next()

        let start = false,
            hasColon = false

        loop: while (true) {
            switch (this.state.type) {
                case colonTok:
                    hasColon = true
                    start = true
                    this.next()
                    break
                case bracketRTok:
                    if (!hasColon && !node.end) {
                        node.end = node.start
                    }
                    break loop
                case commaTok:
                    throw this.unexpect()
                case eofTok:
                    break loop
                default:
                    if (!start) {
                        node.start = this.parseAtom(this.state.type)
                    } else {
                        node.end = this.parseAtom(this.state.type)
                    }
            }
        }

        this.next()

        this.append(parent, this.parseAtom(this.state.type))

        return node
    }
}
