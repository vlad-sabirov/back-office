import { ReportRealizationResponse } from '@interfaces';
import { ReportRealizationService } from '@services';

interface Props {
	userId?: number;
	date?: {
		year: number | string;
		month: number | string;
	};
	order?: 'asc' | 'desc';
}

export const getPlanListData = async ({ userId, date, order = 'asc' }: Props): Promise<ReportRealizationResponse[]> => {
	const [response] = await ReportRealizationService.findMany({
		where: { plan: { gt: 0 }, year: date?.year, month: date?.month, userId },
		filter: { orderBy: [{ year: order }, { month: order }] },
		include: { user: true },
	});
	return response ?? [];
};
