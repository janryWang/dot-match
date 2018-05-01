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
    let stepIndex = 0
    let matchedMaxDepth = 0

    const matchPath = (path, node, start = 0, parent) => {
        if (!node) {
            if (!parent) return true
        }
        if (node) {
            switch (node.type) {
                case "Identifier":
                    return (
                        node.value === path[start] &&
                        matchPath(path, node.after, start)
                    )
                case "WildcardOperator":
                    if (!node.filter && !node.after) {
                        matchedMaxDepth = path.length - 1
                    }
                    return node.filter
                        ? matchPath(path, node.filter, start, node)
                        : node.after
                            ? matchPath(path, node.after, start)
                            : true
                case "GroupExpression":
                    if (node.isNone) {
                        return toArray(node.value).every((_node, index) => {
                            matchedMaxDepth = start
                            const unmatched =
                                !matchPath(path, _node, start) &&
                                matchPath(path, parent.after, stepIndex)
                            if (unmatched) {
                                stepIndex = start
                            }
                            return unmatched
                        })
                    } else {
                        return toArray(node.value).some(_node => {
                            const matched =
                                matchPath(path, _node, start) &&
                                matchPath(path, parent.after, stepIndex)
                            if (!matched) {
                                stepIndex = start
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
                    stepIndex++
                    if (matchedMaxDepth < path.length - 1) {
                        matchedMaxDepth++
                    }
                    return matchPath(path, node.after, start + 1)
            }
        }

        return true
    }

    return path => {
        stepIndex = 0
        matchedMaxDepth = 0
        return matchPath(path, root) && matchedMaxDepth === path.length - 1
    }
}

export const createMatcher = string => createMatcherByAST(parseDPML(string))

export default createMatcher
