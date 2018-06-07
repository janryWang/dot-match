import { bracketContext, parenContext, bracketDContext } from "./contexts"
const TokenType = (flag, props) => {
    return {
        flag,
        ...props
    }
}

export const nameTok = TokenType("name", {
    expectNext(next) {
        return (
            next === dotTok ||
            next === commaTok ||
            next === eofTok ||
            next === bracketRTok ||
            next === parenRTok ||
            next === colonTok ||
            next === expandTok
        )
    }
})
export const starTok = TokenType("*", {
    expectNext(next) {
        return (
            next === dotTok ||
            next === starTok ||
            next === parenLTok ||
            next === bracketLTok ||
            next === eofTok ||
            next === commaTok
        )
    }
})
export const dotTok = TokenType(".", {
    expectNext(next) {
        return (
            next === nameTok ||
            next === bracketDLTok ||
            next === starTok ||
            next === bracketLTok
        )
    },
    expectPrev(prev) {
        return (
            prev === nameTok ||
            prev === bracketDRTok ||
            prev === starTok ||
            prev === parenRTok ||
            prev === bracketRTok ||
            prev === expandTok
        )
    }
})
export const bangTok = TokenType("!", {
    expectNext(next) {
        return next === nameTok || next === bracketDLTok
    }
})
export const colonTok = TokenType(":", {
    expectNext(next) {
        return next === nameTok || next === bracketDLTok || next === bracketRTok
    }
})
export const bracketLTok = TokenType("[", {
    expectNext(next) {
        return (
            next === nameTok ||
            next === bracketDLTok ||
            next === colonTok ||
            next === bracketLTok ||
            next === ignoreTok
        )
    },
    expectPrev(prev) {
        return (
            prev === starTok ||
            prev === bracketLTok ||
            prev === dotTok ||
            prev === parenLTok ||
            prev == commaTok
        )
    },
    updateContext(prev) {
        this.state.context.push(bracketContext)
    }
})

export const bracketRTok = TokenType("]", {
    expectNext(next) {
        return (
            next === dotTok ||
            next === eofTok ||
            next === commaTok ||
            next === parenRTok ||
            next === bracketRTok
        )
    },
    updateContext(prev) {
        if (this.curContext() !== bracketContext) throw this.unexpect()
        this.state.context.pop()
    }
})

export const bracketDLTok = TokenType("[[", {
    updateContext() {
        this.state.context.push(bracketDContext)
    }
})

export const bracketDRTok = TokenType("]]", {
    updateContext() {
        if (this.curContext() !== bracketDContext) throw this.unexpect()
        this.state.context.pop()
    }
})

export const parenLTok = TokenType("(", {
    expectNext(next) {
        return (
            next === nameTok ||
            next === bracketDLTok ||
            next === bangTok ||
            next === bracketLTok
        )
    },
    expectPrev(prev) {
        return prev === starTok
    },
    updateContext(prev) {
        this.state.context.push(parenContext)
    }
})
export const parenRTok = TokenType(")", {
    expectNext(next) {
        return next === dotTok || next === eofTok || next === commaTok
    },
    updateContext() {
        if (this.curContext() !== parenContext) throw this.unexpect()
        this.state.context.pop()
    }
})

export const commaTok = TokenType(",", {
    expectNext(next) {
        return next === nameTok || next === bracketDLTok || next === bracketLTok
    }
})
export const ignoreTok = TokenType("ignore", {
    expectNext(next) {
        return next === bracketDRTok
    },
    expectPrev(prev) {
        return prev == bracketDLTok
    }
})

export const expandTok = TokenType("expandTok", {
    expectNext(next) {
        return (
            next === dotTok ||
            next === eofTok ||
            next === commaTok ||
            next === parenRTok
        )
    }
})

export const eofTok = TokenType("eof")
