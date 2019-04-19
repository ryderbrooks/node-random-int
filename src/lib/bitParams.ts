import { IBitParameters } from '../meta/interfaces';



/** This does the equivalent of:
 *
 *    bitsNeeded = Math.ceil(Math.log2(range));
 *    bytesNeeded = Math.ceil(bitsNeeded / 8);
 *    mask = Math.pow(2, bitsNeeded) - 1;
 *
 * ... however, it implements it as bitwise operations, to sidestep any
 * possible implementation errors regarding floating point numbers in
 * JavaScript runtimes. This is an easier solution than assessing each
 * runtime and architecture individually.
 */

/**
 * First verifies that `min` `max` are valid inputs then calculates the mask
 * and the number of bytes needed based on the range between the `min` `max` values.
 */
export class BitParams implements IBitParameters {
  public get bytes(): number {
    return this._bytesNeeded;
  }

  public get range(): number {
    return this._range;
  }

  public get mask(): number {
    return this._mask;
  }


  public min: number;
  public max:number;
  public constructor(min:number, max:number) {
    this._range = max - min;
    this.isSafe(max, min);
    this._setUp(this._range);
    this.min = min;
    this.max = max;
  }

  private isSafe( max: number, min: number ): true {
    switch ( true ) {
      case max == null:
        throw new Error(ERROR_MESSAGES.NO_MAX);
      case min == null:
        throw new Error(ERROR_MESSAGES.NO_MIN);
      case max % 1 !== 0:
        throw new Error(ERROR_MESSAGES.MAX_MUST_BE_INT);
      case min % 1 !== 0:
        throw new Error(ERROR_MESSAGES.MIN_MUST_BE_INT);



      case min < MAX_INT.MIN:
        throw new Error(ERROR_MESSAGES.MIN_TOO_SMALL);

      case min > MAX_INT.MAX:
        throw new Error(ERROR_MESSAGES.MIN_TOO_LARGE);


      case max < MAX_INT.MIN:
        throw new Error(ERROR_MESSAGES.MAX_TOO_SMALL);
      case max > MAX_INT.MAX:
        throw new Error(ERROR_MESSAGES.MAX_TOO_LARGE);

      case max < min:
        throw new Error(ERROR_MESSAGES.MAX_LESS_THAN_MIN);

      case Math.abs(this.range) > MAX_INT.RANGE:
        throw new Error(ERROR_MESSAGES.RANGE_NOT_SAFE);
      default:
        return true;

    }
  }

  private readonly _range: number;
  private _bitsNeeded: number  = 0;
  private _bytesNeeded: number = 0;
  private _mask: number        = 1;


  private _setUp( range: number ): void {
    while ( range > 0 ) {
      if( this._bitsNeeded % 8 === 0 ) {
        this._bytesNeeded += 1;
      }

      this._bitsNeeded += 1;
      this._mask = this._mask << 1 | 1; /* 0x00001111 -> 0x00011111 */

      /* SECURITY PATCH (March 8, 2016):
       *   As it turns out, `>>` is not the right operator to use here, and
       *   using it would cause strange outputs, that wouldn't fall into
       *   the specified range. This was remedied by switching to `>>>`
       *   instead, and adding checks for input parameters being within the
       *   range of 'safe integers' in JavaScript.
       */
      range      = range >>> 1; /* 0x01000000 -> 0x00100000 */
    }
  }
}
