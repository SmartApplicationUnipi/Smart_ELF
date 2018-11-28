/**
 * This class represent a point into the cartesian space.
 * Point is an immutable object.
 */
export class Point {
	/**
	 * Builds a new Point.
	 * @param x 
	 * @param y 
	 */
	constructor(private x: number, private y: number) {}

	/**
	 * Returns the value of x
	 */
	public getX(): number {
		return this.x;
	}

	/**
	 * Returns the value of y
	 */
	public getY(): number {
		return this.y;
	}

	/**
	 * Returns a new Point whose coordinates are the sum between this point and p coordinates.
	 * @param p The point holding to add.
	 */
	public add(p: Point): Point {
		return new Point(this.x + p.x, this.y + p.y);
	}

	/**
	 * Returns the distance between this point and p.
	 * @param p A point
	 */
	public distanceTo(p: Point): number {
		let diff = this.add(new Point(-p.x, -p.y));
		return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
	}
}