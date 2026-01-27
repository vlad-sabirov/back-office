import { Injectable } from '@nestjs/common';

@Injectable()
export class DateTimeHelper {
	public async timeShortToMilliseconds(value: string): Promise<number> {
		const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };

		const num = Number(value.slice(0, -1));
		const multiplier = multipliers[value.slice(-1).toLowerCase()];

		return num * multiplier * 1000;
	}
}
