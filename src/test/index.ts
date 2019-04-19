import { assert } from 'chai';
import {
  createRandomNumberGenerator,
  fastRandomInteger,
  getRandomInteger,
  getRandomIntegerAsync,
}                 from '../index';


type throwsTest = {
  min: number;
  max: number;
  test: string;
  expectedErrorMessage: ERROR_MESSAGES
};
type functionalTest = {
  min: number;
  max: number;
  test: string;
};

type funcAlias<T> = ( min: number, max: number ) => T;
type R =
  Promise<number>
  | number;

describe('randomNumber-generator', () => {
  const tests: throwsTest[]      = [
    {
      //@ts-ignore
      min                  : undefined,
      max                  : 3000,
      test                 : 'no min value is provided',
      expectedErrorMessage : ERROR_MESSAGES.NO_MIN,
    },
    {
      min                  : 10,
      //@ts-ignore
      max                  : undefined,
      test                 : 'no max value is provided',
      expectedErrorMessage : ERROR_MESSAGES.NO_MAX,
    },
    {
      //@ts-ignore
      min                  : 'abc',
      max                  : 3000,
      test                 : 'min value is a string',
      expectedErrorMessage : ERROR_MESSAGES.MIN_MUST_BE_INT,
    },
    {
      min                  : 10,
      max                  : 1000.22,
      test                 : 'max value is a float',
      expectedErrorMessage : ERROR_MESSAGES.MAX_MUST_BE_INT,
    },

    {
      min                  : MAX_INT.MIN - 1,
      max                  : 3000,
      test                 : 'min value is too small',
      expectedErrorMessage : ERROR_MESSAGES.MIN_TOO_SMALL,
    },
    {
      min                  : MAX_INT.MAX + 1,
      max                  : 3000,
      test                 : 'min value is too large',
      expectedErrorMessage : ERROR_MESSAGES.MIN_TOO_LARGE,
    },

    {
      min                  : 1,
      max                  : MAX_INT.MAX + 1,
      test                 : 'max value is too large',
      expectedErrorMessage : ERROR_MESSAGES.MAX_TOO_LARGE,
    },
    {
      min                  : 1,
      max                  : MAX_INT.MIN - 1,
      test                 : 'max value is too small',
      expectedErrorMessage : ERROR_MESSAGES.MAX_TOO_SMALL,
    },

    {
      min                  : 101,
      max                  : 100,
      test                 : 'max value is less than min value',
      expectedErrorMessage : ERROR_MESSAGES.MAX_LESS_THAN_MIN,
    },
    {
      min                  : MAX_INT.MIN,
      max                  : MAX_INT.MAX,
      test                 : 'difference between min & max is too large',
      expectedErrorMessage : ERROR_MESSAGES.RANGE_NOT_SAFE,
    },
  ];
  const fTests: functionalTest[] = [
    { min : 10, max : 10, test : 'max === min' },
    { min : 1, max : 100, test : 'max-min > 0 < MAX_SAFE_INT' },
    { min : 0, max : MAX_INT.RANGE, test : 'min is 0 and max is 2^32' },
    { min : - MAX_INT.RANGE, max : 0, test : 'min is -2^32 and max is 0 ' },
    { min : - 1000, max : 1000, test : 'min is - and max is + ' },
  ];


  function errorTests( func: ( min: number,
                               max: number ) => any,
                       only?: Set<ERROR_MESSAGES> ): ( test: throwsTest ) => void {
    return ( test: throwsTest ): void => {
      if( only ) {
        if( !only.has(test.expectedErrorMessage) ) {
          return;
        }
      }
      it(`throws when ${ test.test }`, () => {
        try {
          func(test.min, test.max);
          assert.isTrue(false, 'no error thrown');
        } catch ( e ) {
          assert.equal(e.message, test.expectedErrorMessage);
        }
      });
    };
  }

  function functionalTests( func: ( min: number,
                                    max: number ) => Promise<number> ): ( test: functionalTest ) => void {
    return ( test: functionalTest ): void => {
      it(`returns a value between max & min when ${ test.test }`, async () => {
        try {
          const value: number = await func(test.min, test.max);
          assert.isAtLeast(value, test.min);
          assert.isAtMost(value, test.max);
        } catch ( e ) {
          throw e;
        }
      });
    };
  }


  function factoryWrapperAsync(): ( min: number, max: number ) => Promise<number> {
    return ( min: number, max: number ): Promise<number> => {
      return createRandomNumberGenerator(min, max).nextValueAsync();
    };
  }

  function factoryWrapperSync(): ( min: number, max: number ) => number {
    return ( min: number, max: number ): number => {
      return createRandomNumberGenerator(min, max).nextValueSync();
    };
  }

  function testRunner<T extends R>( genFunc: funcAlias<T>,
                                    errorFunc?: funcAlias<any>,
                                    only?: Set<ERROR_MESSAGES> ): void {
    if( errorFunc ) {
      describe(
        'input validation #errors',
        () => tests.forEach(errorTests(errorFunc, only)));
    }
    describe(
      'generated numbers',
      () => fTests.forEach(functionalTests(genFunc as funcAlias<Promise<number>>)));
  }


  describe('async API', () => {
    describe('#getRandomIntegerAsync', () => {
      testRunner<Promise<number>>(getRandomIntegerAsync,
                                  getRandomIntegerAsync);
    });

    describe('#createRandomNumberGenerator', () => {
      testRunner<Promise<number>>(factoryWrapperAsync(),
                                  createRandomNumberGenerator);

      describe('as asyncIterator', () => {
        it('works', async () => {
          const min            = - 1000;
          const max            = 1000;
          const gen            = createRandomNumberGenerator(min, max);
          const s: Set<number> = new Set();

          for await ( const value of gen ) {
            s.add(value);
            assert.isAtLeast(value, min);
            assert.isAtMost(value, max);
            if( s.size > (max - min) / 2 ) {
              break;
            }
          }
        });
      });
    });
  });


  describe('sync API', () => {
    describe('#getRandomInteger', () => {
      testRunner<number>(getRandomInteger, getRandomInteger);
    });

    describe('#createRandomNumberGenerator', () => {
      testRunner<number>(factoryWrapperSync());
    });

    describe('as syncIterator', () => {
      it('works', () => {
        const min            = - 1000;
        const max            = 1000;
        const gen            = createRandomNumberGenerator(min, max);
        const s: Set<number> = new Set();

        for ( const value of gen ) {
          s.add(value);
          assert.isAtLeast(value, min);
          assert.isAtMost(value, max);
          if( s.size > (max - min) / 2 ) {
            break;
          }
        }
      });
    });

    describe('#fastRandomInteger', () => {
      testRunner<number>(fastRandomInteger,
                         fastRandomInteger,
                         new Set<ERROR_MESSAGES>(
                           [
                             ERROR_MESSAGES.NO_MAX,
                             ERROR_MESSAGES.NO_MIN,
                             ERROR_MESSAGES.MIN_MUST_BE_INT,
                             ERROR_MESSAGES.MAX_MUST_BE_INT,
                             ERROR_MESSAGES.MAX_LESS_THAN_MIN,
                           ]));
    });
  });
});

