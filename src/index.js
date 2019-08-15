import { Parser } from "./parser"
import memo from "fast-memoize"

export const parseDPML = string => {
    const parser = new Parser(string)
    return parser.parse()
}

const isFn = val => typeof val === "function"

const isArr = val => Array.isArray(val)

const isStr = val => typeof val == "string"

const toArray = val => {
    return isArr(val) ? val : val ? [val] : []
}

const createMatcherByAST = root => {
    let stepIndex = 0
    let lastNode = root
    let parents = []
    const matchPath = (path, node, start = 0) => {
        if (!node) {
            if (path[start + 1]) return false
            if (start == path.length - 1) return true
        }

        if (node) {
            switch (node.type) {
                case "Identifier":
                    lastNode = node
                    if (node.after && node.after.type === "ExpandOperator") {
                        return (
                            node.value ===
                                String(path[start]).substring(
                                    0,
                                    node.value.length
                                ) &&
                            (node.after.after
                                ? matchPath(path, node.after.after, start)
                                : !!path[start])
                        )
                    }
                    if (path[start + 1] && !node.after) {
                        if (parents.length) {
                            for (let i = parents.length - 1; i >= 0; i--) {
                                if (!parents[i].after || !parents[i].filter)
                                    return false
                            }
                        } else {
                            return false
                        }
                    }
                    return (
                        node.value == path[start] &&
                        (node.after
                            ? matchPath(path, node.after, start)
                            : !!path[start])
                    )
                case "ExpandOperator":
                    return matchPath(path, node.after, start)
                case "WildcardOperator":
                    lastNode = node
                    parents.push(node)
                    const result = node.filter
                        ? matchPath(path, node.filter, start)
                        : node.after
                        ? matchPath(path, node.after, start)
                        : !!path[start]
                    parents.pop()
                    return result
                case "GroupExpression":
                    if (node.isExclude) {
                        return toArray(node.value).every((_node, index) => {
                            const unmatched = !matchPath(
                                path,
                                _node,
                                start,
                                node
                            )
                            if (unmatched) {
                                stepIndex = start
                            }
                            return unmatched
                        })
                    } else {
                        return toArray(node.value).some(_node => {
                            const matched = matchPath(path, _node, start, node)
                            if (!matched) {
                                stepIndex = start
                            }
                            return matched
                        })
                    }
                case "RangeExpression":
                    const parent = parents[parents.length - 1]
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
                    return matchPath(path, node.after, start + 1)
            }
        }

        return true
    }
    return path => {
        stepIndex = 0
        const matchResult = matchPath(path, root)

        if (!lastNode) return false
        if (lastNode == root && lastNode.type === "WildcardOperator") {
            return true
        }

        return matchResult
    }
}

const matchAll = memo((string, path) => {
    return createMatcherByAST(parseDPML(string))(toArray(path))
})

const traverse = (ast, callback) => {
    if (!isFn(callback)) return
    const result = callback(ast)
    if (result === false) return
    if (ast.after) {
        traverse(ast.after, callback)
    }
    if (ast.filter) {
        traverse(ast.filter, callback)
    }
    if (isArr(ast.value)) {
        ast.value.forEach(node => {
            traverse(node, callback)
        })
    }
}

export const getPathSegments = memo(pattern => {
    let segments = []
    let isAbsolutePath = true
    traverse(parseDPML(pattern), ({ type, value }) => {
        if (type !== "Identifier" && type !== "DotOperator") {
            isAbsolutePath = false
            return false
        } else if (type == "Identifier") {
            segments.push(value)
        }
    })
    return isAbsolutePath ? segments : []
})

export const isAbsolutePath = memo(pattern => {
    let isAbsolutePath = true
    traverse(parseDPML(pattern), ({ type }) => {
        if (type !== "Identifier" && type !== "DotOperator") {
            isAbsolutePath = false
            return false
        }
    })
    return isAbsolutePath
})

export const isWildMatchPath = memo(pattern => {
    let hasWildMatchPath = false
    traverse(parseDPML(pattern), node => {
        const { type } = node
        if (type === "RangeExpression") {
            const isWild =
                (!node.end.value && !!node.start.value) ||
                (!node.start.value && !!node.end.value)
            if (isWild) {
                hasWildMatchPath = true
                return false
            }
        } else if (
            (type === "WildcardOperator" && !node.filter) ||
            type === "ExpandOperator"
        ) {
            hasWildMatchPath = true
            return false
        }
    })
    return hasWildMatchPath
})

export const createMatcher = (string, cache) => {
    return path => {
        return matchAll(string, path)
    }
}

export default createMatcher
