import test from "ava"
import { Parser } from "./src/parser"

const parse = (string, json, index) => {
    test("test " + string + ` : ${index}`, t => {
        const parser = new Parser(string)
        t.deepEqual(parser.parse(), json)
    })
}

const batchTest = obj => {
    let i = 0
    for (let key in obj) {
        i++
        parse(key, obj[key], i)
    }
}

batchTest({
    "*": {
        type: "WildcardOperator",
        after: undefined
    },
    "a.b.c": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "Identifier",
                        value: "c",
                        after: undefined
                    }
                }
            }
        }
    },
    "a.b.*": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined
                    }
                }
            }
        }
    },
    "a.b.*(111,222,aaa)": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "Identifier",
                                    value: "111",
                                    after: undefined
                                },
                                {
                                    type: "Identifier",
                                    value: "222",
                                    after: undefined
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa",
                                    after: undefined
                                }
                            ],
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b.*(!111,222,aaa)": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "GroupExpression",
                            isNone: true,
                            value: [
                                {
                                    type: "Identifier",
                                    value: "111",
                                    after: undefined
                                },
                                {
                                    type: "Identifier",
                                    value: "222",
                                    after: undefined
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa",
                                    after: undefined
                                }
                            ],
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b. * [  11 :  22  ]": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "RangeExpression",
                            start: {
                                type: "Identifier",
                                value: "11",
                                after: undefined
                            },
                            end: {
                                type: "Identifier",
                                value: "22",
                                after: undefined
                            },
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b.*([[123123!,()]],[[aaa]])": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "IgnoreOperator",
                                    value: "123123!,()",
                                    after: undefined
                                },
                                {
                                    type: "IgnoreOperator",
                                    value: "aaa",
                                    after: undefined
                                }
                            ],
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b.*([[123123!,()]],aaa)": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "IgnoreOperator",
                                    value: "123123!,()",
                                    after: undefined
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa",
                                    after: undefined
                                }
                            ],
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b.*(![[123123!,()]],aaa)": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "IgnoreOperator",
                                    value: "123123!,()",
                                    after: undefined
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa",
                                    after: undefined
                                }
                            ],
                            isNone: true,
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b  . *   (![[123123!,()]])": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "WildcardOperator",
                        after: undefined,
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "IgnoreOperator",
                                    value: "123123!,()",
                                    after: undefined
                                }
                            ],
                            isNone: true,
                            after: undefined
                        }
                    }
                }
            }
        }
    },
    "a.b.[[123123!,()]]   ": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "IgnoreOperator",
                        value: "123123!,()",
                        after: undefined
                    }
                }
            }
        }
    },
    [`a .  
     b .  
       [[123123!,()[]]
    
    .aaaa`]: {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "Identifier",
                value: "b",
                after: {
                    type: "DotOperator",
                    after: {
                        type: "IgnoreOperator",
                        value: "123123!,()[",
                        after: {
                            type: "DotOperator",
                            after: {
                                type: "Identifier",
                                value: "aaaa",
                                after: undefined
                            }
                        }
                    }
                }
            }
        }
    }
})
