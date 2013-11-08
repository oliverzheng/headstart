export enum LengthUnit {
	PIXELS,
	PERCENT,
	//AUTO,
}

export class Length {
	unit: LengthUnit;
	value: number;

	constructor(unit: LengthUnit, value?: number) {
		this.unit = unit;
		if (value != null) {
			this.value = value;
		}
	}
}

export function px(value: number): Length {
	return new Length(value, LengthUnit.PIXELS);
}

export function pct(value: number): Length {
	return new Length(value, LengthUnit.PERCENT);
}

//export var auto = new Length(LengthUnit.AUTO);
