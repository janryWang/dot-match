import { Parser } from "./parser"
import memoize from "lru-memoize"

const createMatcherByAST = ast => {}

export const createMatcher = memoize(200)(string => {
    const parser = new Parser(string)
    const tree = parser.parse()
    const match = createMatcherByAST(tree)
    return path => {
        if (!Array.isArray(path))
            throw new Error("The matched path must be an array!")
        return match(path)
    }
})
