export enum LengthUnit {
	PIXELS,
	PERCENT,
}

export class Length {
	private value: number;
	private unit: LengthUnit;

	constructor(value: number, unit: LengthUnit) {
		this.value = value;
		this.unit = unit;
	}
}

export function px(value: number): Length {
	return new Length(value, LengthUnit.PIXELS);
}

export function pct(value: number): Length {
	return new Length(value, LengthUnit.PERCENT);
}
