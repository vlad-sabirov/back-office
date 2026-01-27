import { endOfQuarter, format, parse, startOfQuarter } from 'date-fns';
import { makeAutoObservable } from 'mobx';
import { ReportRealizationResponse } from '@interfaces';
import { getRealizationListData } from '@screens/crm/reports/realization/data';
import { ReportRealizationService } from '@services';

export class RealizationQuarterStore {
	constructor() {
		makeAutoObservable(this);
	}

	isInit = false;
	setInit = (value: typeof this.isInit): void => {
		this.isInit = value;
	};

	date: Date = new Date();
	setDate = (value: typeof this.date): void => {
		this.date = value;
	};

	realizationList: ReportRealizationResponse[] | [] = [];
	setRealizationList = (value: typeof this.realizationList): void => {
		this.realizationList = value;
	};
	getRealizationList = async (): Promise<void> => {
		const yearStart = format(startOfQuarter(this.date), 'yyyy');
		const monthStart = format(startOfQuarter(this.date), 'MM');
		const yearEnd = format(endOfQuarter(this.date), 'yyyy');
		const monthEnd = format(endOfQuarter(this.date), 'MM');
		const [response] = await ReportRealizationService.findMany({
			where: {
				AND: [
					{ year: { gte: yearStart }, month: { gte: monthStart } },
					{ year: { lte: yearEnd }, month: { lte: monthEnd } },
				],
			},
			include: { user: true },
		});
		this.setRealizationList(await this.monthToQuarter(response ?? []));
	};

	realizationListAll: ReportRealizationResponse[] | [] = [];
	setRealizationListAll = (value: typeof this.realizationListAll): void => {
		this.realizationListAll = value;
	};
	getRealizationListAll = async (): Promise<void> => {
		const response = await getRealizationListData({});
		this.setRealizationListAll(await this.monthToQuarter(response));
	};

	private monthToQuarter = async (data: ReportRealizationResponse[]): Promise<ReportRealizationResponse[]> => {
		const result: ReportRealizationResponse[] = [];
		for (const itemData of data) {
			const { year, month } = this.getQuarterDate({ year: itemData.year, month: itemData.month });
			if (
				!result.some(
					(itemResult) =>
						itemResult.year === year && itemResult.month === month && itemResult.userId === itemData.userId
				)
			) {
				result.push({ ...itemData, year, month });
			} else {
				const findResult = result.findIndex(
					(itemResult) =>
						itemResult.year === year && itemResult.month === month && itemResult.userId === itemData.userId
				);
				result[findResult].realization += itemData.realization;
				result[findResult].plan += itemData.plan;
			}
		}

		return result;
	};

	private getQuarterDate = ({ year, month }: { year: number; month: number }): { year: number; month: number } => {
		const parseDate = parse(`${year}-${month}`, 'yyyy-MM', new Date());
		const quarterDate = startOfQuarter(parseDate);
		return { year: Number(format(quarterDate, 'yyyy')), month: Number(format(quarterDate, 'MM')) };
	};
}
