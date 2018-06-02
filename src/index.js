import { Parser } from "./parser"

export const parseDPML = string => {
    const parser = new Parser(string)
    return parser.parse()
}

const isArr = val => Array.isArray(val)

const isStr = val => typeof val == "string"

const toArray = val => {
    return isArr(val) ? val : val ? [val] : []
}

const toString = val => {
    if (!val) return ""
    if (isArr(val)) {
        return val.join(".")
    }
    return isStr(val) ? val : ""
}

const createMatcherByAST = root => {
    let stepIndex = 0
    let matchedMaxDepth = 0
    let lastNode = root

    const matchPath = (path, node, start = 0, parent) => {
        if (!node) {
            if (!parent) return true
        }
        if (node) {
            switch (node.type) {
                case "Identifier":
                    lastNode = node
                    if (node.after && node.after.type === "ExpandOperator") {
                        return (
                            node.value ===
                                path[start].substring(0, node.value.length) &&
                            matchPath(path, node.after.after, start)
                        )
                    }
                    return (
                        node.value == path[start] &&
                        matchPath(path, node.after, start)
                    )
                case "ExpandOperator":
                    return matchPath(path, node.after, start)
                case "WildcardOperator":
                    lastNode = node
                    return node.filter
                        ? matchPath(path, node.filter, start, node)
                        : node.after
                            ? matchPath(path, node.after, start)
                            : matchedMaxDepth <= path.length - 1
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
                    if (matchedMaxDepth <= path.length - 1) {
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

        let matched = matchPath(path, root)

        if (!lastNode) return false
        if (lastNode == root && lastNode.type === "WildcardOperator") {
            return true
        }

        if (lastNode.type == "Identifier") {
            return matched && matchedMaxDepth === path.length - 1
        } else if (lastNode.type == "WildcardOperator") {
            return matched && matchedMaxDepth <= path.length - 1
        } else {
            return false
        }
    }
}

export const createMatcher = (string, cache) => {
    return path => {
        let result,
            key = toString(path),
            needCache = cache instanceof Map
        if (needCache) {
            let lastValue = cache.get(key)
            if (lastValue !== undefined) return lastValue
        }
        result = createMatcherByAST(parseDPML(string))(toArray(path))
        if (needCache) {
            cache.set(key, result)
        }
        return result
    }
}

export default createMatcher
