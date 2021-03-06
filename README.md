# dot-match

> Dot path matching tool with DPML(Dot Path Match Language)



### Usage

```
import createMatcher from "dot-match"

const match = createMatcher("a.b.*")

match(["a","b","c"]) // true
```



### Install

```
npm install --save dot-match
```

### API

- `createMatcher(string : String) : Function`

- `parseDPML(path : String) : NodeType`


### DPML



**Wildcard**

```
"*"
```

**Expand String**

```
"aaa~" or "~" or "aaa~.bbb.cc"
```

**Part Wildcard**

```
"a.b.*.c.*"
```



**Wildcard With Group Filter**

```
"a.b.*(aa.bb.dd,cc,mm)"
or 
"a.b.*(!aa.bb.dd,cc,mm)"
```



**Wildcard With Nest Group Filter**

```
"a.b.*(aa.bb.*(aa.b,c),cc,mm)"
or 
"a.b.*(!aa.bb.*(aa.b,c),cc,mm)"
```



**Wildcard With Range Filter**

```
"a.b.*[10:100]"
or 
"a.b.*[10:]"
or 
"a.b.*[:100]"
```

**Ignore Key Word**

```
"a.b.[[cc.uu()sss*\\[1222\\]]]"
```



### AST



```
NodeType {

    Identifier {
      type:"Identifier",
      value:String,
      after:NodeType
    }
    
    DotOperator {
      type:"DotOperator",
      after:NodeType,
      filter:NodeType
    }
    
    WildcardOperator {
      type:"WildcardOperator",
      after:NodeType,
      filter:NodeType
    }
    
    GroupExpression {
       type:"GroupExpression",
       value:Array<NodeType>,
       isExclude:Boolean,
       after:NodeType
    }
    
    RangeExpression {
        type:"RangeExpression",
        start:NodeType,
        end:NodeType,
        after:NodeType
    }
    
}
```



### LICENSE

The MIT License (MIT)

Copyright (c) 2018 JanryWang

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.