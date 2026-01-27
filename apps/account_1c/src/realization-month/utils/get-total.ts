import { RealizationMonthTeamModel } from '../models/realization-month-team.model';
import { RealizationMonthModel } from '../models/realization-month-all.model';
import { RealizationMonthEmployeeModel } from '../models/realization-month-employee.model';
import { merge } from 'lodash';

export class GetTotal {
	/*
	Получение тотального числа у всей компании
		- Временная сложность: O(n)
		- Пространственная сложность: O(1)
	 */
	static getTotalAll = (
		data: RealizationMonthModel,
	): RealizationMonthModel => {
		if (!data.teams?.length) {
			const calculate: Partial<RealizationMonthModel> = {
				realization: data.realization,
				customerCount: data.customerCount,
				percent: this.getPercent({
					plan: data.plan,
					realization: data.realization,
				}),
				depthOfSales: this.getDepthOfSales({
					shipmentCount: data.shipmentCount,
					customerShipment: data.customerShipment,
				}),
				averageOrderValue: this.getAverageOrderValue({
					shipmentCount: data.shipmentCount,
					realization: data.realization,
				}),
				workingBasePercent: this.getWorkingBasePercent({
					customerCount: data.customerCount,
					customerShipment: data.customerShipment,
				}),
			};
			return Object.assign(data, calculate);
		}

		const total: Partial<RealizationMonthModel> = {
			plan: 0,
			planCustomerCount: 0,
			planWorkingBasePercent: 0,
			realization: 0,
			customerCount: 0,
			customerShipment: 0,
			shipmentCount: 0,
		};

		data.teams?.forEach((employee) => {
			total.plan += employee.plan || 0;
			total.planCustomerCount += employee.planCustomerCount || 0;
			total.planWorkingBasePercent += employee.planWorkingBasePercent || 0;
			total.realization += employee.realization || 0;
			total.customerCount += employee.customerCount || 0;
			total.customerShipment += employee.customerShipment || 0;
			total.shipmentCount += employee.shipmentCount || 0;
		});

		total.percent = this.getPercent({
			plan: total.plan,
			realization: total.realization,
		});

		total.depthOfSales = this.getDepthOfSales({
			shipmentCount: total.shipmentCount,
			customerShipment: total.customerShipment,
		});

		total.averageOrderValue = this.getAverageOrderValue({
			shipmentCount: total.shipmentCount,
			realization: total.realization,
		});

		total.workingBasePercent = this.getWorkingBasePercent({
			customerCount: total.customerCount,
			customerShipment: total.customerShipment,
		});

		return merge(data, total);
	};

	/*
	Получение тотального числа у всей компании
		- Временная сложность: O(n)
		- Пространственная сложность: O(1)
	 */
	static getTotalTeam = (
		data: RealizationMonthTeamModel[],
	): RealizationMonthTeamModel[] => {
		if (!data?.length) return undefined;
		return data.map((team) => {
			if (!team.employees?.length) {
				const calculate: Partial<RealizationMonthTeamModel> = {
					percent: this.getPercent({
						plan: team.plan,
						realization: team.realization,
					}),
					depthOfSales: this.getDepthOfSales({
						shipmentCount: team.shipmentCount,
						customerShipment: team.customerShipment,
					}),
					averageOrderValue: this.getAverageOrderValue({
						shipmentCount: team.shipmentCount,
						realization: team.realization,
					}),
					workingBasePercent: this.getWorkingBasePercent({
						customerCount: team.customerCount,
						customerShipment: team.customerShipment,
					}),
				};
				return Object.assign(team, calculate);
			}

			const total: Partial<RealizationMonthTeamModel> = {
				plan: 0,
				realization: 0,
				customerCount: 0,
				customerShipment: 0,
				shipmentCount: 0,
				employees: this.getTotalEmployee(team.employees),
			};

			team.employees?.forEach((employee) => {
				total.plan += employee.plan || 0;
				total.planCustomerCount += employee.planCustomerCount || 0;
				total.planWorkingBasePercent +=
					employee.planWorkingBasePercent || 0;
				total.realization += employee.realization || 0;
				total.customerCount += employee.customerCount || 0;
				total.customerShipment += employee.customerShipment || 0;
				total.shipmentCount += employee.shipmentCount || 0;
			});

			total.percent = this.getPercent({
				plan: total.plan,
				realization: total.realization,
			});

			total.depthOfSales = this.getDepthOfSales({
				shipmentCount: total.shipmentCount,
				customerShipment: total.customerShipment,
			});

			total.averageOrderValue = this.getAverageOrderValue({
				shipmentCount: total.shipmentCount,
				realization: total.realization,
			});

			total.workingBasePercent = this.getWorkingBasePercent({
				customerCount: total.customerCount,
				customerShipment: total.customerShipment,
			});

			return Object.assign(team, total);
		});
	};

	/*
	Получение тотального числа у всей компании
		- Временная сложность: O(n)
		- Пространственная сложность: O(1)
	 */
	static getTotalEmployee = (
		data: RealizationMonthEmployeeModel[],
	): RealizationMonthEmployeeModel[] => {
		if (!data?.length) return undefined;
		return data.map((employee) => {
			const total: Partial<RealizationMonthEmployeeModel> = {
				plan: employee.plan,
				planCustomerCount: employee.planCustomerCount,
				planWorkingBasePercent: employee.planWorkingBasePercent,
				realization: employee.realization,
				customerCount: employee.customerCount,
				customerShipment: employee.customerShipment,
				shipmentCount: employee.shipmentCount,
			};
			total.percent = this.getPercent({
				plan: total.plan,
				realization: total.realization,
			});

			total.depthOfSales = this.getDepthOfSales({
				shipmentCount: total.shipmentCount,
				customerShipment: total.customerShipment,
			});

			total.averageOrderValue = this.getAverageOrderValue({
				shipmentCount: total.shipmentCount,
				realization: total.realization,
			});

			total.workingBasePercent = this.getWorkingBasePercent({
				customerCount: total.customerCount,
				customerShipment: total.customerShipment,
			});

			return Object.assign(employee, total);
		});
	};

	/*
	Получение процента выполнения плана
		- Временная сложность: O(1)
		- Пространственная сложность: O(1)
	 */
	private static getPercent = ({
		plan,
		realization,
	}: {
		plan?: number;
		realization?: number;
	}): number | undefined => {
		if (!realization || !plan) {
			return undefined;
		}
		return Math.round((realization / plan) * 100);
	};

	/*
	Получение глубины продаж
		- Временная сложность: O(1)
		- Пространственная сложность: O(1)
	 */
	private static getDepthOfSales = ({
		shipmentCount,
		customerShipment,
	}: {
		shipmentCount?: number;
		customerShipment?: number;
	}): number | undefined => {
		if (!shipmentCount || !customerShipment) {
			return undefined;
		}
		return Math.round((shipmentCount / customerShipment) * 10) / 10;
	};

	/*
	Получение среднего чека
		- Временная сложность: O(1)
		- Пространственная сложность: O(1)
	 */
	private static getAverageOrderValue = ({
		realization,
		shipmentCount,
	}: {
		realization?: number;
		shipmentCount?: number;
	}): number | undefined => {
		if (!realization || !shipmentCount) {
			return undefined;
		}
		return Math.round(realization / shipmentCount);
	};

	/*
	Получение процента работающих организаций
		- Временная сложность: O(1)
		- Пространственная сложность: O(1)
	 */
	private static getWorkingBasePercent = ({
		customerCount,
		customerShipment,
	}: {
		customerCount?: number;
		customerShipment?: number;
	}): number | undefined => {
		if (!customerShipment || !customerCount) {
			return undefined;
		}
		return Math.round((customerShipment / customerCount) * 100);
	};
}
