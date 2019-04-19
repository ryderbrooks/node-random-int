const enum MAX_INT {
  MAX = 9007199254740991,
  MIN = -9007199254740991,
  RANGE = 429497295
}



const enum ERROR_MESSAGES {
  NO_GENERATOR = 'No suitable random number generator available. Ensure that your runtime is linked against OpenSSL (or an equivalent) correctly.',
  NO_MIN            = 'You must specify a minimum value',
  NO_MAX            = 'You must specify a maximum value',
  MAX_MUST_BE_INT   = 'Maximum value must be an integer',
  MIN_MUST_BE_INT   = 'Minimum value must be an integer',
  MAX_LESS_THAN_MIN = 'Maximum value must be greater than minimum value',

  MIN_TOO_SMALL = 'Minimum value must be greater than or equal to MIN_SAFE_INTEGER',
  MIN_TOO_LARGE = 'Minimum value must be less than or equal to MAX_SAFE_INTEGER',

  MAX_TOO_SMALL = 'Maximum value must be greater than or equal to MIN_SAFE_INTEGER',
  MAX_TOO_LARGE = 'Maximum value must be less than or equal to MAX_SAFE_INTEGER',

  RANGE_NOT_SAFE = 'Difference between min & max must be less than 2^32 -1',
  TOO_MANY_ITTER = 'Random value not found within max iterations',
  VALUE_OUT_OF_RANGE = 'Generated value is out of range'
}