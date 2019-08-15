import test from 'ava'
import createMatcher, { isAbsolutePath, isWildMatchPath,getPathSegments } from '../src/index'

const match = obj => {
  for (let name in obj) {
    test('test match ' + name, t => {
      const match = createMatcher(name)
      if (Array.isArray(obj[name]) && Array.isArray(obj[name][0])) {
        obj[name].forEach(path => {
          t.truthy(match(path))
        })
      } else {
        t.truthy(match(obj[name]))
      }
    })
  }
}

const unmatch = obj => {
  for (let name in obj) {
    test('test unmatch ' + name, t => {
      const match = createMatcher(name)
      if (Array.isArray(obj[name]) && Array.isArray(obj[name][0])) {
        obj[name].forEach(path => {
          t.falsy(match(path))
        })
      } else {
        t.falsy(match(obj[name]))
      }
    })
  }
}

test('getPathSegments',t=>{
  t.deepEqual(getPathSegments('a.b. c'),['a','b','c'])
  t.deepEqual(getPathSegments('a  . b'),['a','b'])
  t.notDeepEqual(getPathSegments('a  . b'),['a','b','c'])
})

test('isAbsolutePath', (t) => {
  t.truthy(isAbsolutePath('a.b. c .d'))
  t.truthy(isAbsolutePath('[[\\[aa,bb\\]]]'))
  t.falsy(isAbsolutePath('a.b.*[1:2]'))
  t.falsy(isAbsolutePath('a.b~'))
  t.falsy(isAbsolutePath('a.b~.cc'))
})

test('isWildMatchPath', (t) => {
  t.falsy(isWildMatchPath('a.b. c .d'))
  t.falsy(isWildMatchPath('a.b.*[1:2]'))
  t.truthy(isWildMatchPath('a.b~'))
  t.truthy(isWildMatchPath('a.b~.cc'))
})

match({
  '*': ['a', 'b', 'c'],
  '*': [[], ['aa'], ['aa', 'bb', 'cc'], ['aa', 'dd', 'gg']],
  '*.a.b': [['c', 'a', 'b'], ['k', 'a', 'b'], ['m', 'a', 'b']],
  'a.*.k': [['a', 'b', 'k'], ['a', 'd', 'k'], ['a', 'c', 'k']],
  'a.*(b,d,m).k': [['a', 'b', 'k'], ['a', 'd', 'k'], ['a', 'm', 'k']],
  'a.*(!b,d,m).*(!a,b)': [['a', 'o', 'k'], ['a', 'q', 'k'], ['a', 'c', 'k']],
  'a.*(b.c.d,d,m).k': [
    ['a', 'b', 'c', 'd', 'k'],
    ['a', 'd', 'k'],
    ['a', 'm', 'k']
  ],
  'a.*(b.*(c,k).d,d,m).k': [
    ['a', 'b', 'c', 'd', 'k'],
    ['a', 'b', 'k', 'd', 'k'],
    ['a', 'd', 'k'],
    ['a', 'm', 'k']
  ],
  'a.*[10:50].*(!a,b)': [['a', 49, 's'], ['a', 10, 's'], ['a', 50, 's']],
  'a.*[:50].*(!a,b)': [['a', 49, 's'], ['a', 10, 's'], ['a', 50, 's']],
  'a.*([[a.b.c]],[[c.b.d~]])': [['a', 'a.b.c'], ['a', 'c.b.d~']],
  'a.*(!k,d,m).k': [['a', 'u', 'k'], ['a', 'o', 'k'], ['a', 'p', 'k']],
  'a\\.\\*\\[1\\]': [['a.*[1]']],
  '[[\\[aa,bb\\]]]': [['[aa,bb]']],
  '[[\\[aa,bb\\]   ]]': [['[aa,bb]   ']],
  '[[   \\[aa,bb~\\]   ]]': [['   [aa,bb~]   ']],
  'aa.bb.*': [['aa', 'bb', 'ccc']],
  'a.*': [['a', 'b'], ['a', 'b', 'c']],
  'aaa.products.0.*': [['aaa', 'products', 0, 'aaa']],
  'aa~.ccc': [['aa', 'ccc'], ['aa12', 'ccc']],
  '*(aa~,bb~).*': [['aa12323', 'asdasd'], ['bb12222', 'asd']],
  '*(aa,bb,bb.aa)': [['bb', 'aa']],
  '*(!aa,bb,bb.aa)': [['xx'], ['yyy'], ['bb', 'ss']],
  '*(!aaa)': [['bbb']]
})

unmatch({
  'a.*': [['a'], ['b']],
  'aa.bb.*': [['aa', 'bb']],
  'a.*.b': [['a', 'k', 'b', 'd']],
  '*(!aaa)': [['aaa']],
  a: [['c', 'b']],
  'aa~.ccc': [['a', 'ccc'], ['aa'], ['aaasdd']],
  bb: [['bb', 'cc']]
})
