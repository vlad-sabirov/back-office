import { differenceInMinutes, eachDayOfInterval, endOfDay, endOfMonth, format } from 'date-fns';
import { formatISO, isSameMonth, parse, startOfDay } from 'date-fns';
import { isAfter, isSameDay, parseISO, startOfMonth } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { LatenessDataResponse } from '@interfaces/lateness';
import ProductionCalendarService from '@screens/staff/production-calendar/ProductionCalendar.service';
import { VacationService } from '@screens/staff/vacation';
import { LatenessService } from '@services';
import UserService from '@services/User.service';

export class GetAllPerMonth {
	private static instance: GetAllPerMonth;
	private static date: Date = new Date();
	private static data: LatenessDataResponse[] = [];

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}
	private static checkInstance(): void {
		if (!GetAllPerMonth.instance) GetAllPerMonth.instance = new GetAllPerMonth();
	}

	private static clear = (): void => {
		GetAllPerMonth.data = [];
	};

	private static fetchData = async (): Promise<void> => {
		const dateStart = startOfMonth(GetAllPerMonth.date);
		const dateEnd = isAfter(new Date(), endOfMonth(GetAllPerMonth.date))
			? endOfMonth(GetAllPerMonth.date)
			: endOfDay(new Date());
		const dateEachDays = eachDayOfInterval({ start: dateStart, end: dateEnd });

		const [productionCalendar] = await ProductionCalendarService.findBetweenDateRange({
			start: dateStart,
			end: dateEnd,
		});
		const [vacations] = await VacationService.findBetweenDateRange({
			start: dateStart,
			end: dateEnd,
		});
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

		GetAllPerMonth.clear();
		// noinspection UnnecessaryLocalVariableJS
		const result: LatenessDataResponse[] = responseUsers
			.filter(
				(user) =>
					user.isFixLate &&
					(isAfter(dateStart, startOfMonth(parseISO(user.createdAt))) ||
						isSameMonth(dateStart, parseISO(user.createdAt)))
			)
			.map((user) => {
				const vacationUser = vacations?.filter((vacationItem) => vacationItem.userId === user.id);
				const vacationDates = vacationUser?.map((vacationItem) => vacationItem.dates).flat();
				const result: LatenessDataResponse = {
					user,
					data: responseLateness?.length
						? responseLateness
								.filter((lateness) => lateness.userId === user.id)
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
					calculate: responseLateness?.length
						? {
								workingMinutes: 0,
								lateMinutes: 0,
								latePercent: 0,
								arrivedDays: 0,
								lateDays: 0,
								didComeDays: 0,
						}
						: undefined,
				};

				if (!result.data.length) {
					result.data.push({
						id: 0,
						type: 'didCome',
						dateISO: formatISO(GetAllPerMonth.date),
						date: format(GetAllPerMonth.date, 'd MMMM, yyyy', { locale: customLocaleRu }),
						time: '00:00',
						comment: '',
						metaInfo: '',
						isSkipped: false,
						comments: [],
					});
				}

				if (responseLateness) {
					for (const dayItem of dateEachDays) {
						if (!result.calculate) continue;
						// Если суббота или воскресенье
						if (format(dayItem, 'i') === '6' || format(dayItem, 'i') === '7') continue;
						if (isAfter(startOfDay(parseISO(user.createdAt)), dayItem)) continue;

						// Если праздник
						if (productionCalendar?.some((calendarItem) => isSameDay(parseISO(calendarItem), dayItem)))
							continue;

						// Если отпуск
						if (vacationDates?.some((vacationItem) => isSameDay(parseISO(vacationItem), dayItem))) continue;

						const findLateness = responseLateness.filter(
							(latenessItem) =>
								latenessItem.userId === user.id && isSameDay(parseISO(latenessItem.createdAt), dayItem)
						);

						// Если нужно пропустить
						result.calculate.workingMinutes += 480;
						if (findLateness?.[0]?.isSkipped) continue;

						// Если не пришел без уважительной причины
						if (!findLateness.length) {
							result.calculate.lateMinutes += 480;
							result.calculate.didComeDays++;
							continue;
						}

						const createdAt = parseISO(findLateness[0].createdAt);

						if (Number(format(parseISO(findLateness[0].createdAt), 'mmSSS')) === 0) {
							result.calculate.didComeDays++;
							result.calculate.lateMinutes += 480;
							continue;
						}

						if (Number(format(parseISO(findLateness[0].createdAt), 'HHmm')) > 905) {
							let lateMinutes = differenceInMinutes(
								createdAt,
								parse(`${format(createdAt, 'yyyy-MM-dd')} 09:00`, 'yyyy-MM-dd HH:mm', new Date())
							);

							if (lateMinutes > 240) {
								const lateSub = lateMinutes - 300;
								lateMinutes = lateSub > 0 ? 240 + lateSub : 240;
							}

							result.calculate.lateDays++;
							result.calculate.lateMinutes += lateMinutes;
							continue;
						}

						result.calculate.arrivedDays++;
					}

					if (result.calculate)
						result.calculate.latePercent =
							100 - Math.round((result.calculate.lateMinutes / result.calculate.workingMinutes) * 100);
				}

				return result;
			});

		GetAllPerMonth.data = result;
	};

	public static get = async (date: Date) => {
		GetAllPerMonth.checkInstance();
		GetAllPerMonth.date = date;
		await GetAllPerMonth.fetchData();
		return GetAllPerMonth.data;
	};
}
