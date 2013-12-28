export function arraysEqual(a1: any[], a2: any[]): boolean {
	if (a1 === a2)
		return true;

	if (a1 == null || a2 == null)
		return false;

	return (
		a1.length === a2.length &&
		a1.every((item, i) => item === a2[i])
	);
}
