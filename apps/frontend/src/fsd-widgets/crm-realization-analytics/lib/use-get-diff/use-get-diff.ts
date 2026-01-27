import { useEffect, useState } from 'react';
import { IGetData, IGetDataEmployee, IGetDataTeam } from 'fsd-widgets/crm-realization-analytics/types/get-data.types';
import { IStaffEntity } from '@fsd/entities/staff';

export const useGetDiff = (aData: IGetData | null, bData: IGetData | null) => {
	const [diff, setDiff] = useState<IGetData>({
		plan: 0,
		realization: 0,
		customerCount: 0,
		customerShipment: 0,
		shipmentCount: 0,
		workingBasePercent: 0,
		percent: 0,
		depthOfSales: 0,
		averageOrderValue: 0,
		teams: [],
	});
	useEffect(() => {
		if (!aData || !bData) return;
		const data: IGetData = { teams: [] } as any;

		/* Общая реализация */
		data.plan = Math.round((aData.plan / bData.plan) * 100 - 100);
		data.realization = Math.round((aData.realization / bData.realization) * 100 - 100);
		data.customerCount = Math.round((aData.customerCount / bData.customerCount) * 100 - 100);
		data.customerShipment = Math.round((aData.customerShipment / bData.customerShipment) * 100 - 100);
		data.shipmentCount = Math.round((aData.shipmentCount / bData.shipmentCount) * 100 - 100);
		data.workingBasePercent = Math.round((aData.workingBasePercent / bData.workingBasePercent) * 100 - 100);
		data.percent = Math.round(((aData.percent ?? 0) / (bData.percent ?? 0)) * 100 - 100);
		data.depthOfSales = Math.round(((aData.depthOfSales ?? 0) - (bData.depthOfSales ?? 0)) * 10) / 10;
		data.averageOrderValue = Math.round(
			((aData.averageOrderValue ?? 0) / (bData.averageOrderValue ?? 0)) * 100 - 100
		);

		/* Реализация команд */
		aData.teams.forEach((aTeam) => {
			const team: IGetDataTeam = {
				userId: aTeam.userId,
				user: {} as IStaffEntity,
				plan: 0,
				realization: 0,
				customerCount: 0,
				customerShipment: 0,
				shipmentCount: 0,
				workingBasePercent: 0,
				percent: 0,
				depthOfSales: 0,
				averageOrderValue: 0,
				staffIds: [],
				employees: [],
			};
			const bTeam = bData.teams.find(({ userId }) => userId == aTeam.userId);
			if (!bTeam) {
				data.teams.push(team);
				return;
			}

			team.plan = Math.round((aTeam.plan / bTeam.plan) * 100 - 100);
			team.realization = Math.round((aTeam.realization / bTeam.realization) * 100 - 100);
			team.customerCount = Math.round((aTeam.customerCount / bTeam.customerCount) * 100 - 100);
			team.customerShipment = Math.round((aTeam.customerShipment / bTeam.customerShipment) * 100 - 100);
			team.workingBasePercent = Math.round((aTeam.workingBasePercent / bTeam.workingBasePercent) * 100 - 100);
			team.percent = Math.round(((aTeam.percent ?? 0) / (bTeam.percent ?? 0)) * 100 - 100);
			team.depthOfSales = Math.round(((aTeam.depthOfSales ?? 0) / (bTeam.depthOfSales ?? 0)) * 100 - 100);
			team.averageOrderValue = Math.round(
				((aTeam.averageOrderValue ?? 0) / (bTeam.averageOrderValue ?? 0)) * 100 - 100
			);

			/* Реализация сотрудников */
			aTeam.employees.forEach((aEmployee) => {
				const employee: IGetDataEmployee = {
					userId: aEmployee.userId,
					user: {} as IStaffEntity,
					plan: 0,
					realization: 0,
					customerCount: 0,
					customerShipment: 0,
					shipmentCount: 0,
					workingBasePercent: 0,
					percent: 0,
					depthOfSales: 0,
					averageOrderValue: 0,
				};
				const bEmployee = bTeam.employees.find(({ userId }) => userId === aEmployee.userId);
				if (!bEmployee) {
					team.employees.push(employee);
					return;
				}

				employee.plan = Math.round((aEmployee.plan / bEmployee.plan) * 100 - 100);
				employee.realization = Math.round((aEmployee.realization / bEmployee.realization) * 100 - 100);
				employee.customerCount = Math.round((aEmployee.customerCount / bEmployee.customerCount) * 100 - 100);
				employee.customerShipment = Math.round(
					(aEmployee.customerShipment / bEmployee.customerShipment) * 100 - 100
				);
				employee.workingBasePercent = Math.round(
					(aEmployee.workingBasePercent / bEmployee.workingBasePercent) * 100 - 100
				);
				employee.percent = Math.round(((aEmployee.percent ?? 0) / (bEmployee.percent ?? 0)) * 100 - 100);
				employee.depthOfSales = Math.round(
					((aEmployee.depthOfSales ?? 0) / (bEmployee.depthOfSales ?? 0)) * 100 - 100
				);
				employee.averageOrderValue = Math.round(
					((aEmployee.averageOrderValue ?? 0) / (bEmployee.averageOrderValue ?? 0)) * 100 - 100
				);

				team.employees.push(employee);
			});

			data.teams.push(team);
		});

		setDiff(data);
	}, [aData, bData]);

	return diff;
};
