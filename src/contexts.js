const ContextType = (flag, props) => {
    return {
        flag,
        ...props
    }
}

export const bracketContext = ContextType("[]")

export const bracketDContext = ContextType("[[]]")

export const parenContext = ContextType("()")
