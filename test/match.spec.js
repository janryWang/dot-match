import test from "ava"
import createMatcher from "../src/index"


const match = (obj)=>{
    for(let name in obj){
        test(name,(t)=>{
            const match = createMatcher(name)
            if(Array.isArray(obj[name]) && Array.isArray(obj[name][0])){
                obj[name].forEach((path)=>{
                    t.truthy(match(path))
                })
            } else {
                t.truthy(match(obj[name]))
            }
        })
    }
}


match({
    "*":["a","b","c"],
    "*.a.b":[
        ["c","a","b"],
        ["k","a","b"],
        ["m","a","b"]
    ],
    "a.*.k":[
        ["a","b","k"],
        ["a","d","k"],
        ["a","c","k"]
    ],
    "a.*(b,d,m).k":[
        ["a","b","k"],
        ["a","d","k"],
        ["a","m","k"]
    ],
    "a.*(!b,d,m).*(!a,b)":[
        ["a","o","k"],
        ["a","q","k"],
        ["a","c","k"]
    ],
    "a.*(b.c.d,d,m).k":[
        ["a","b","c","d","k"],
        ["a","d","k"],
        ["a","m","k"]
    ],
    "a.*(b.*(c,k).d,d,m).k":[
        ["a","b","c","d","k"],
        ["a","b","k","d","k"],
        ["a","d","k"],
        ["a","m","k"]
    ],
    "a.*[10:50].*(!a,b)":[
        ["a",49,"s"],
        ["a",10,"s"],
        ["a",50,"s"]
    ],
    "a.*[:50].*(!a,b)":[
        ["a",49,"s"],
        ["a",10,"s"],
        ["a",50,"s"]
    ],
    "a.*([[a.b.c]],[[c.b.d]])":[
        ["a","a.b.c"],
        ["a","c.b.d"]
    ],
    "a.*(!k,d,m).k":[
        ["a","u","k"],
        ["a","o","k"],
        ["a","p","k"]
    ],
})
