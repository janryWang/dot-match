import { Parser } from "./parser"
import memoize from "lru-memoize"

export const parseDPML = memoize(200)(string => {
    const parser = new Parser(string)
    return parser.parse()
})

const toArray = val => {
    return Array.isArray(val) ? val : val ? [val] : []
}

const createMatcherByAST = root => {
    let stepDepth = 0

    const matchPath = (path, node, start = 0, parent) => {
        if (!node) return true
        switch (node.type) {
            case "Identifier":
                return (
                    node.value === path[start] &&
                    matchPath(path, node.after, start)
                )
            case "WildcardOperator":
                return node.filter
                    ? matchPath(path, node.filter, start, node)
                    : matchPath(path, node.after, start)
            case "GroupExpression":
                if (node.isNone) {
                    return toArray(node.value).every(_node => {
                        const unmatched =
                            !matchPath(path, _node, start) &&
                            matchPath(path, parent.after, stepDepth)
                        if (unmatched) {
                            stepDepth = start
                        }
                        return unmatched
                    })
                } else {
                    return toArray(node.value).some(_node => {
                        const matched =
                            matchPath(path, _node, start) &&
                            matchPath(path, parent.after, stepDepth)
                        if (!matched) {
                            stepDepth = start
                        }
                        return matched
                    })
                }
            case "RangeExpression":
                if (node.start) {
                    if (node.end) {
                        return (
                            path[start] >= parseInt(node.start.value) &&
                            path[start] <= parseInt(node.end.value) &&
                            matchPath(path, parent.after, start)
                        )
                    } else {
                        return (
                            path[start] >= parseInt(node.start.value) &&
                            matchPath(path, parent.after, start)
                        )
                    }
                } else {
                    if (node.end) {
                        return (
                            path[start] <= parseInt(node.end.value) &&
                            matchPath(path, parent.after, start)
                        )
                    } else {
                        return matchPath(path, parent.after, start)
                    }
                }
            case "DotOperator":
                stepDepth++
                return matchPath(path, node.after, start + 1)
        }
        return true
    }

    return path => {
        stepDepth = 0
        return matchPath(path, root)
    }
}

export const createMatcher = string => createMatcherByAST(parseDPML(string))

export default createMatcher
