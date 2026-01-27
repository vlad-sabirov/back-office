export class StringHelper {
	static toNumber = (value: string): number => Number(value.replace(/\D/g, ''));
}
