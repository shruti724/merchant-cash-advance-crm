/**
 * Base Entity — DDD building block.
 *
 * Identity-based equality: two entities are equal if they share the same
 * id, regardless of attribute values (contrast with ValueObject).
 */
export abstract class Entity<Props> {
  protected readonly _id: string;
  protected props: Props;

  protected constructor(props: Props, id: string) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(entity?: Entity<Props>): boolean {
    if (entity === null || entity === undefined) return false;
    if (this === entity) return true;
    return this._id === entity._id;
  }
}
