import { endOfDay, format, formatISO, parseISO, startOfDay } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { LatenessDataResponse } from '@interfaces/lateness';
import { LatenessService } from '@services';
import UserService from '@services/User.service';

export class GetAllToday {
	private static instance: GetAllToday;
	private static date: Date = new Date();
	private static data: LatenessDataResponse[] = [];

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}
	private static checkInstance(): void {
		if (!GetAllToday.instance) GetAllToday.instance = new GetAllToday();
	}

	private static clear = (): void => {
		GetAllToday.data = [];
	};

	private static fetchData = async (): Promise<void> => {
		const dateStart = startOfDay(GetAllToday.date);
		const dateEnd = endOfDay(GetAllToday.date);
		const [responseUsers] = await UserService.findAll();
		const [responseLateness] = await LatenessService.findWithPass({
			where: {
				createdAt: {
					gte: format(dateStart, 'yyyy-MM-dd HH:mm:ss'),
					lt: format(dateEnd, 'yyyy-MM-dd HH:mm:ss'),
				},
			},
			include: { comments: { include: { user: true } } },
		});

		if (!responseUsers?.length) return;

		GetAllToday.clear();
		// noinspection UnnecessaryLocalVariableJS
		const result: LatenessDataResponse[] = responseUsers
			.filter((user) => user.isFixLate)
			.map((user) => {
				const result: LatenessDataResponse = {
					user,
					data: responseLateness?.length
						? responseLateness
								.filter((lateness) => lateness.userId == user.id)
								.map((lateness) => {
									const parseDate = parseISO(lateness.createdAt);
									return {
										id: lateness.id ?? 0,
										type:
											Number(format(parseDate, 'mmSSS')) === 0
												? 'didCome'
												: Number(format(parseDate, 'Hmm')) > 905
												? 'late'
												: 'arrived',
										dateISO: formatISO(parseDate),
										date: format(parseDate, 'd MMMM, yyyy', { locale: customLocaleRu }),
										time: format(parseDate, 'HH:mm'),
										comment: lateness.comment,
										metaInfo: lateness.metaInfo,
										isSkipped: lateness.isSkipped ?? false,
										comments: lateness.comments,
									};
								})
						: [],
				};

				if (!result.data.length)
					result.data.push({
						id: 0,
						type: 'didCome',
						dateISO: formatISO(GetAllToday.date),
						date: format(GetAllToday.date, 'd MMMM, yyyy', { locale: customLocaleRu }),
						time: '00:00',
						comment: '',
						metaInfo: '',
						isSkipped: false,
						comments: [],
					});

				return result;
			});

		GetAllToday.data = result;
	};

	public static get = async (date: Date) => {
		GetAllToday.checkInstance();
		GetAllToday.date = date;
		await GetAllToday.fetchData();
		return GetAllToday.data;
	};
}
