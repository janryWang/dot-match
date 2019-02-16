import test from "ava"
import { Parser } from "../src/parser"

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
        type: "WildcardOperator"
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
                        value: "c"
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
                        type: "WildcardOperator"
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
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "Identifier",
                                    value: "111"
                                },
                                {
                                    type: "Identifier",
                                    value: "222"
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa"
                                }
                            ]
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
                        filter: {
                            type: "GroupExpression",
                            isExclude: true,
                            value: [
                                {
                                    type: "Identifier",
                                    value: "111"
                                },
                                {
                                    type: "Identifier",
                                    value: "222"
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa"
                                }
                            ]
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
                        filter: {
                            type: "RangeExpression",
                            start: {
                                type: "Identifier",
                                value: "11"
                            },
                            end: {
                                type: "Identifier",
                                value: "22"
                            }
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
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "Identifier",
                                    value: "123123!,()"
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa"
                                }
                            ]
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
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "Identifier",
                                    value: "123123!,()"
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa"
                                }
                            ]
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
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "Identifier",
                                    value: "123123!,()"
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa"
                                }
                            ],
                            isExclude: true
                        }
                    }
                }
            }
        }
    },
    "a.b  . *   (![[123123!,()]],aaa,bbb)": {
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
                        filter: {
                            type: "GroupExpression",
                            value: [
                                {
                                    type: "Identifier",
                                    value: "123123!,()"
                                },
                                {
                                    type: "Identifier",
                                    value: "aaa"
                                },
                                {
                                    type: "Identifier",
                                    value: "bbb"
                                }
                            ],
                            isExclude: true
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
                        type: "Identifier",
                        value: "123123!,()"
                    }
                }
            }
        }
    },
    [`a .  
     b .  
       [[123123!,()]]
    
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
                        type: "Identifier",
                        value: "123123!,()",
                        after: {
                            type: "DotOperator",
                            after: {
                                type: "Identifier",
                                value: "aaaa"
                            }
                        }
                    }
                }
            }
        }
    },
    "a.*(aaa.d.*(!sss),ddd,bbb).c.b": {
        type: "Identifier",
        value: "a",
        after: {
            type: "DotOperator",
            after: {
                type: "WildcardOperator",
                filter: {
                    type: "GroupExpression",
                    value: [
                        {
                            type: "Identifier",
                            value: "aaa",
                            after: {
                                type: "DotOperator",
                                after: {
                                    type: "Identifier",
                                    value: "d",
                                    after: {
                                        type: "DotOperator",
                                        after: {
                                            type: "WildcardOperator",
                                            filter: {
                                                type: "GroupExpression",
                                                isExclude: true,
                                                value: [
                                                    {
                                                        type: "Identifier",
                                                        value: "sss"
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            type: "Identifier",
                            value: "ddd"
                        },
                        {
                            type: "Identifier",
                            value: "bbb"
                        }
                    ]
                },
                after: {
                    type: "DotOperator",
                    after: {
                        type: "Identifier",
                        value: "c",
                        after: {
                            type: "DotOperator",
                            after: {
                                type: "Identifier",
                                value: "b"
                            }
                        }
                    }
                }
            }
        }
    }
})
