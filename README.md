[![Build Status](https://travis-ci.org/ryderbrooks/node-random-int.svg?branch=master)](https://travis-ci.org/ryderbrooks/node-random-int)
[![Coverage Status](https://coveralls.io/repos/github/ryderbrooks/node-random-int/badge.svg?branch=master)](https://coverall.io/github/ryderbrooks/node-random-int?branch=master)
[![npm](https://img.shields.io/npm/v/node-random-int.svg)](https://www.npmjs.com/package/node-random-int) 

# node-random-int
Cryptographically secure pseudo-random number generator for node.js


>_The core logic is loosely based on the_ [node-random-number-csprng](https://github.com/joepie91/node-random-number-csprng) _project by_ [joepie91](https://github.com/joepie91) 

---
### Install
```npm install node-random-int```

___


# Usage
### Async:
```typescript
import {createRandomNumberGenerator} from 'node-random-int';

async function FOO(){
  const randomNumberGenerator = createRandomNumberGenerator(0, 100);
  const randomInt1 = await randomNumberGeneraton.nextValueAsync();
  const randomInt2 = await randomNumberGeneraton.nextValueAsync();
}
```
Can also be consumed via `for await` loop:
```typescript
import {createRandomNumberGenerator} from 'node-random-int';

async function FOO(){
  const randomNumberGenerator = createRandomNumberGenerator(0, 100);
  
  for await(let randomInt of randomNumberGenerator){
    // this will loop indefinitely!
    // you must implement some kind of break logic
    if(randomInt > 2){
      break;
    }
  }
}
```
>convenience method:
```typescript
import {getRandomIntegerAsync} from 'node-random-int';

async function FOO(){
  // each invocation creates a new randomNumberGenerator object
  const randomInt1 = await getRandomIntegerAsync(0, 100);
  const randomInt2 = await getRandomIntegerAsync(0, 100);
}
```




### Synchronous
```typescript
import {createRandomNumberGenerator} from 'node-random-int';

const randomNumberGenerator = createRandomNumberGenerator(0, 100);
const randomInt1 = randomNumberGeneraton.nextValueSync();
const randomInt2 = randomNumberGeneraton.nextValueSync();
```
Can be consumed synchronously via `for` loop:
```typescript
import {createRandomNumberGenerator} from 'node-random-int';

const randomNumberGenerator = createRandomNumberGenerator(0, 100);
for (let randomInt of randomNumberGenerator){
  // this will loop indefinitely!
  // you must implement some kind of break logic
  if(randomInt > 2){
    break;
  }
}
```

>convenience method:
```typescript
import {getRandomInteger} from 'node-random-int';

function FOO(){
  // each invocation creates a new randomNumberGenerator object
  const randomInt1 = getRandomInteger(0, 100);
  const randomInt2 = getRandomInteger(0, 100);
}
```


## Tests
```typescript
npm run test
```

## Licence 
