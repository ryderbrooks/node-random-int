import { IAsyncRandomNumberGenerator, IBitParameters } from './meta/interfaces';
import { BitParams }                                   from './lib/bitParams';
import { RandomNumberGenerator }                       from './lib/RandomNumberGenerator';


function bitParamFactory( min: number, max: number ): IBitParameters {
  return new BitParams(min, max);
}


/**
 * Acts as a factory function to instantiated a new
 * RandomNumberGenerator object. Once the range has been specified is cannot be changed.
 *
 *
 * @param min must be less than or equal to max
 * @param max must be greater than or equal to min
 * @param maxTries maximum number of iteration attempts to create a new random integer
 * that falls in the range of min & max. The purpose of this is to avoid a possible
 * infinite loop. Instead it will throw an error indicating that a new random integer
 * was unable to be generated within the specified attempts.
 */
export function createRandomNumberGenerator( min: number,
                                             max: number,
                                             maxTries: number = 1000 ): IAsyncRandomNumberGenerator {

  const bitParams: IBitParameters = bitParamFactory(min, max);
  return new RandomNumberGenerator(bitParams,
                                   maxTries);
}

/**
 * Acts as a convenience method that instantiates a new
 * RandomNumberGenerator object and calls .nextValueSync() on it for each call. If you
 * need to generate multiple random values within the same range use
 * createRandomNumberGenerator to create a RandomNumberGenerator object and then
 * interact with that object.
 *
 * @param min must be less than or equal to `max`
 * @param max must be greater than equal to `min`
 * @param maxTries maximum number of iteration attempts to create a new random integer
 * that falls in the range of min & max. The purpose of this is to avoid a possible
 * infinite loop. Instead it will throw an error indicating that a new random integer
 * was unable to be generated within the specified attempts.
 */
export function getRandomInteger( min: number,
                                  max: number,
                                  maxTries: number = 1000 ): number {
  return createRandomNumberGenerator(min, max, maxTries).nextValueSync();
}


/**
 * Acts as a convenience method that instantiates a new
 * RandomNumberGenerator object and calls .nextValueAsync() on it for each call. If
 * you need to generate multiple random values within the same range use
 * createRandomNumberGenerator to create a RandomNumberGenerator object and then
 * interact with that object.
 *
 * @param min must be less than or equal to `max`
 * @param max must be greater than or equal to `min`
 * @param maxTries maximum number of iteration attempts to create a new random integer
 * that falls in the range of min & max. The purpose of this is to avoid a possible
 * infinite loop. Instead it will throw an error indicating that a new random integer
 * was unable to be generated within the specified attempts.
 */
export function getRandomIntegerAsync( min: number,
                                       max: number,
                                       maxTries: number = 1000 ): Promise<number> {
  return createRandomNumberGenerator(min, max, maxTries).nextValueAsync();
}

/**
 * A naive implementation that uses Math.random to generate
 * random values
 *
 * @param min must be less than or equal to `max`
 * @param max must be greater than or equal to `min`
 */
export function fastRandomInteger( min: number, max: number ): number {
  switch ( true ) {
    case max == null:
      throw new Error(ERROR_MESSAGES.NO_MAX);
    case min == null:
      throw new Error(ERROR_MESSAGES.NO_MIN);
    case max % 1 !== 0:
      throw new Error(ERROR_MESSAGES.MAX_MUST_BE_INT);
    case min % 1 !== 0:
      throw new Error(ERROR_MESSAGES.MIN_MUST_BE_INT);
    case max < min:
      throw new Error(ERROR_MESSAGES.MAX_LESS_THAN_MIN);
  }

  return Math.floor(Math.random() * (max - min + 1) + min);
}
