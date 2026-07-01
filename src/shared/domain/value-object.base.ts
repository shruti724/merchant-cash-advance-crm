/**
 * Base ValueObject — DDD building block.
 *
 * Structural equality: two value objects are equal if all their props are
 * equal. Value objects are immutable by convention (props are frozen).
 */
export abstract class ValueObject<Props extends Record<string, unknown>> {
  protected readonly props: Props;

  constructor(props: Props) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<Props>): boolean {
    if (vo === null || vo === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
