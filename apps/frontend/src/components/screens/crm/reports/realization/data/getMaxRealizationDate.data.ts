import { parse } from 'date-fns';
import { ReportRealizationService } from '@services';

interface Props {
	userId?: number;
	minDate?: {
		year: number | string;
		month: number | string;
	};
	maxDate?: {
		year: number | string;
		month: number | string;
	};
}

export const getMaxRealizationDateData = async ({ userId, minDate, maxDate }: Props): Promise<Date> => {
	const [response] = await ReportRealizationService.findOnce({
		where: {
			userId,
			realization: { gt: 1 },
			year: minDate || maxDate ? { gte: minDate?.year, lte: maxDate?.year } : undefined,
			month: minDate || maxDate ? { gte: minDate?.month, lte: maxDate?.month } : undefined,
		},
		filter: { orderBy: [{ year: 'desc' }, { month: 'desc' }] },
	});
	if (response) return parse(`${response.year}-${response.month}`, 'yyyy-MM', new Date());
	return new Date();
};
