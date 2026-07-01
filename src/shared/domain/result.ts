/**
 * Result<T> — explicit success/failure type used throughout the
 * application layer instead of throwing for expected business-rule
 * failures (exceptions are reserved for truly exceptional/infra errors).
 * Keeps use cases honest about their failure modes at the type level.
 */
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: string,
    private readonly _value?: T,
  ) {}

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value of a failed result. Check isSuccess first.');
    }
    return this._value as T;
  }

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}
