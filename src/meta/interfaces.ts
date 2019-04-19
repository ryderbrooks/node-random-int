export interface IBitParameters {
  bytes: number;
  range: number;
  mask: number;
  min: number;
  max: number;
}



export interface IAsyncRandomNumberGenerator {
  [Symbol.asyncIterator]():AsyncIterator<number>;
  [Symbol.iterator]():Iterator<number>;
  nextValueAsync(): Promise<number>;
  nextValueSync():number;
}