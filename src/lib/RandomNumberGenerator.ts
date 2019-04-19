import { randomBytes }                                 from 'crypto';
import { IAsyncRandomNumberGenerator, IBitParameters } from '../meta/interfaces';



/**
 *
 * RandomNumberGenerator leverages the node.js Crypto module and bitwise operations to
 * generate random integers within a given range while minimizing range misses and
 * bias introduced by using the more common modulo approach.
 *
 * Synchronous invocation:
 * ```
 * const RandNum = new RandomNumberGenerator(fooBitParams, maxTries);
 *
 * const firstValue = RandNum.nextValueSync();
 * const secondValue = RandNum.nextValueSync();
 *
 * //OR
 *
 * for (let randomValue of RandNum) {
 *   // do something with randomValue
 * }
 * ```
 *
 *
 * Asynchronous invocation:
 *
 * ```
 * const RandNum = new RandomNumberGenerator(fooBitParams, maxTries);
 *
 * const firstValue = await RandNum.nextValueAsync();
 * const secondValue = await RandNum.nextValueAsync();
 *
 * //OR
 *
 * for await (let randomValue of RandNum) {
 *   // do something with randomValue
 * }
 *
 * ```
 *
 * Any combination of the invocations can be used on the instantiated object without
 * issue for example the following is perfectly valid:
 * ```
 * for (let randomSyncValue of RandNum){
 *   const asyncValue1 = await RandNum.nextAsyncValue();
 *   const syncValue1 = RandNum.nextSyncValue();
 *
 *   for await(let randomAsyncValue of RandNum){
 *     const syncValue2 = RandNum.nextSyncValue();
 *     const asyncValue2 = await RandNum.nextAsyncValue();
 *   }
 * }
 * ```
 */

export class RandomNumberGenerator implements IAsyncRandomNumberGenerator {
  public async nextValueAsync(): Promise<number> {
    let cnt = 0;
    while ( cnt < this.maxItter ) {
      cnt += 1;
      try {
        const randBytes = await this._getRandomBytes();
        return this._makeRandomValue(randBytes);
      } catch ( e ) {
        switch ( e.message ) {
          case ERROR_MESSAGES.VALUE_OUT_OF_RANGE:
            continue;
          default:
            throw e;
        }
      }
    }
    throw new Error(ERROR_MESSAGES.TOO_MANY_ITTER);
  }


  /**
   *
   */
  public nextValueSync(): number {
    let cnt = 0;
    while ( cnt < this.maxItter ) {
      cnt += 1;
      try {
        const randBytes = this._getRandomBytesSync();
        return this._makeRandomValue(randBytes);
      } catch ( e ) {
        switch ( e.message ) {
          case ERROR_MESSAGES.VALUE_OUT_OF_RANGE:
            continue;
          default:
            throw e;
        }
      }
    }
    throw new Error(ERROR_MESSAGES.TOO_MANY_ITTER);
  }


  public constructor( bitParams: IBitParameters,
                      maxItter = 10000 ) {
    this.maxItter  = maxItter;
    this.bitParams = bitParams;
  }


  private readonly maxItter: number;
  private bitParams: IBitParameters;


  private _isInRange( randomVal: number ): number {
    switch ( true ) {
      case randomVal > this.bitParams.max:
      case randomVal < this.bitParams.min:
        throw new Error(ERROR_MESSAGES.VALUE_OUT_OF_RANGE);
      default:
        return randomVal;
    }
  }


  private _makeRandomValue( randBytes: Buffer ): number {
    let randomVal = 0;
    /* Turn the random bytes into an integer, using bitwise operations. */
    for ( let i = 0; i < this.bitParams.bytes; i ++ ) {
      randomVal |= (randBytes[ i ] << (8 * i));
    }
    /* We apply the mask to reduce the amount of attempts we might need
     * to make to get a number that is in range. This is somewhat like
     * the commonly used 'modulo trick', but without the bias:
     *
     *   "Let's say you invoke secure_rand(0, 60). When the other code
     *    generates a random integer, you might get 243. If you take
     *    (243 & 63)-- noting that the mask is 63-- you get 51. Since
     *    51 is less than 60, we can return this without bias. If we
     *    got 255, then 255 & 63 is 63. 63 > 60, so we try again.
     *
     *    The purpose of the mask is to reduce the number of random
     *    numbers discarded for the sake of ensuring an unbiased
     *    distribution. In the example above, 243 would discard, but
     *    (243 & 63) is in the range of 0 and 60."
     *
     *   (Source: Scott Arciszewski)
     */
    randomVal = randomVal & this.bitParams.mask;

    return this._isInRange(randomVal + this.bitParams.min);
  }


  private _getRandomBytesSync(): Buffer {
    return randomBytes(this.bitParams.bytes);
  }


  private _getRandomBytes(): Promise<Buffer> {
    return new Promise<Buffer>(
      ( res, rej ): void => {
        randomBytes(this.bitParams.bytes,
                    ( err: Error | null, buf: Buffer ): void => {
                      if( err ) {
                        rej(err);
                      }
                      res(buf);
                    });
      });
  }


  /**
   * Will loop indefinitely.
   * ```typescript
   * const foo = new RandomNumberGenerator(minFoo, maxFoo);
   * for (let i of foo){
   *   //do whatever
   * }
   * ```
   */
  public [ Symbol.iterator ](): Iterator<number> {
    return {
      next : (): IteratorResult<number> => {
        return {
          value : this.nextValueSync(),
          done  : false,
        };
      },
    };
  }


  /**
   * Will loop indefinitely.
   * ```typescript
   * const foo = new RandomNumberGenerator(minFoo, maxFoo);
   * for await(let i of foo){
   *   //do whatever
   * }
   * ```
   */
  public [ Symbol.asyncIterator ](): AsyncIterator<number> {
    return {
      next : async (): Promise<IteratorResult<number>> => {
        return new Promise<IteratorResult<number>>(async ( res, rej ) => {
          try {
            const value: number = await this.nextValueAsync();
            return res({ value, done : false });
          } catch ( e ) {
            rej(e);
          }
        });
      },
    };
  }
}