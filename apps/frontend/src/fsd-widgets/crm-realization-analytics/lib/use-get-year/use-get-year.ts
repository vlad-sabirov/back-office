import { useEffect, useState } from 'react';
import { IGetData, IGetDataEmployee, IGetDataTeam } from 'fsd-widgets/crm-realization-analytics/types/get-data.types';
import { forEach, uniq } from 'lodash';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { getAverageOrderValue, getDepthOfSales, getPercent } from '../math/math';

export const useGetYear = (year: number | string) => {
	const staffAll = useStateSelector((state) => state.staff.data.all);
	const reportAll = useStateSelector((state) => state.crm_realization.data.monthAll);
	const [dataCurrent, setDataCurrent] = useState<IGetData | null>(null);

	useEffect(() => {
		const data: IGetData = {
			plan: 0,
			realization: 0,
			customerCount: 0,
			customerShipment: 0,
			shipmentCount: 0,
			workingBasePercent: 0,
			teams: [],
		};

		/* Для того чтобы не запутаться во вложенности, создаем отдельные переменные команд и сотрудников */
		const teams: Record<number, IGetDataTeam> = {};
		const employees: Record<number, Record<number, IGetDataEmployee>> = {};

		/* Фильтруем данные по нужному году, затем проходимся по каждому отчету */
		reportAll
			.filter((report) => report.year === Number(year))
			.forEach((reportAll, iAll, accAll) => {
				/* Формируем начальные данные */
				if (reportAll.plan) data.plan += reportAll.plan;
				if (reportAll.realization) data.realization += reportAll.realization;
				if (reportAll.customerCount) data.customerCount = reportAll.customerCount;
				if (reportAll.customerShipment) data.customerShipment += reportAll.customerShipment;
				if (reportAll.shipmentCount) data.shipmentCount += reportAll.shipmentCount;
				if (iAll === accAll.length - 1) {
					if (reportAll.workingBasePercent) data.workingBasePercent = reportAll.workingBasePercent;
				}

				/* Проходимся по командам, для формирования первичных данных */
				reportAll.teams?.forEach((reportTeam) => {
					if (!teams[reportTeam.userId]) {
						/* Если команда в переменной не найдена */
						const foundUser = staffAll.find((user) => user.id == reportTeam.userId)!;
						teams[reportTeam.userId] = {
							userId: reportTeam.userId ?? 0,
							user: foundUser,
							plan: reportTeam.plan ?? 0,
							realization: reportTeam.realization ?? 0,
							customerCount: reportTeam.customerCount ?? 0,
							customerShipment: reportTeam.customerShipment ?? 0,
							shipmentCount: reportTeam.shipmentCount ?? 0,
							staffIds: reportTeam.staffIds ?? [],
							workingBasePercent: reportTeam.workingBasePercent ?? 0,
							employees: [],
						};

						/* Если находим сотрудников, то добавляем первичные данные */
						if (reportTeam.employees?.length) {
							employees[reportTeam.userId] = {};
							reportTeam.employees?.forEach((employeeReport) => {
								const foundUser = staffAll.find((user) => user.id == employeeReport.userId)!;
								employees[reportTeam.userId][employeeReport.userId] = {
									userId: employeeReport.userId,
									user: foundUser,
									plan: employeeReport.plan ?? 0,
									realization: employeeReport.realization ?? 0,
									customerCount: employeeReport.customerCount ?? 0,
									customerShipment: employeeReport.customerShipment ?? 0,
									shipmentCount: employeeReport.shipmentCount ?? 0,
									workingBasePercent: employeeReport.workingBasePercent ?? 0,
								};
							});
						}
					} else {
						/* Если команда в переменной найдена */
						const team = teams[reportTeam.userId]!;
						if (reportTeam.plan) team.plan += reportTeam.plan;
						if (reportTeam.realization) team.realization += reportTeam.realization;
						if (reportTeam.customerCount) team.customerCount = reportTeam.customerCount;
						if (reportTeam.customerShipment) team.customerShipment += reportTeam.customerShipment;
						if (reportTeam.shipmentCount) team.shipmentCount += reportTeam.shipmentCount;
						if (reportTeam.workingBasePercent) team.workingBasePercent = reportTeam.workingBasePercent;

						if (reportTeam.staffIds) team.staffIds = uniq([...reportTeam.staffIds, ...team.staffIds]);

						/* Добавляем в переменную сотрудников */
						if (reportTeam.employees?.length) {
							reportTeam.employees?.forEach((employeeReport) => {
								if (!employees[reportTeam.userId]) {
									employees[reportTeam.userId] = {};
								}

								if (!employees[reportTeam.userId][employeeReport.userId]) {
									const foundUser = staffAll.find((user) => user.id == employeeReport.userId)!;
									employees[reportTeam.userId][employeeReport.userId] = {
										userId: employeeReport.userId,
										user: foundUser,
										plan: employeeReport.plan ?? 0,
										realization: employeeReport.realization ?? 0,
										customerCount: employeeReport.customerCount ?? 0,
										customerShipment: employeeReport.customerShipment ?? 0,
										shipmentCount: employeeReport.shipmentCount ?? 0,
										workingBasePercent: employeeReport.workingBasePercent ?? 0,
									};
								} else {
									if (employeeReport.plan)
										employees[reportTeam.userId][employeeReport.userId].plan += employeeReport.plan;

									if (employeeReport.realization)
										employees[reportTeam.userId][employeeReport.userId].realization +=
											employeeReport.realization;

									if (employeeReport.customerCount)
										employees[reportTeam.userId][employeeReport.userId].customerCount =
											employeeReport.customerCount;

									if (employeeReport.customerShipment)
										employees[reportTeam.userId][employeeReport.userId].customerShipment +=
											employeeReport.customerShipment;

									if (employeeReport.shipmentCount)
										employees[reportTeam.userId][employeeReport.userId].shipmentCount +=
											employeeReport.shipmentCount;

									if (employeeReport.workingBasePercent)
										employees[reportTeam.userId][employeeReport.userId].workingBasePercent =
											employeeReport.workingBasePercent;
								}
							});
						}
					}
				});
			});

		/* Калькуляция для общей реализации */
		data.percent = getPercent(data.realization, data.plan);
		data.depthOfSales = getDepthOfSales(data.shipmentCount, data.customerShipment);
		data.averageOrderValue = getAverageOrderValue(data.realization, data.shipmentCount);

		/* Добавление сотрудников в командам */
		forEach(employees, (val, teamUserId) => {
			forEach(val, (employee) => {
				teams[Number(teamUserId)].employees.push(employee);
				teams[Number(teamUserId)].employees.sort((a, b) => b.realization - a.realization);
			});
		});

		/* Калькуляция для команд и сотрудников */
		const teamArray = Object.values(teams).sort((a, b) => b.realization - a.realization);
		teamArray.forEach((teamData, teamIndex) => {
			teamArray[teamIndex].percent = getPercent(teamData.realization, teamData.plan);
			teamArray[teamIndex].depthOfSales = getDepthOfSales(teamData.shipmentCount, teamData.customerShipment);
			teamArray[teamIndex].averageOrderValue = getAverageOrderValue(teamData.realization, teamData.shipmentCount);

			teamData.employees.forEach((employeeData, employeeIndex) => {
				teamArray[teamIndex].employees[employeeIndex].percent = getPercent(
					employeeData.realization,
					employeeData.plan
				);

				teamArray[teamIndex].employees[employeeIndex].depthOfSales = getDepthOfSales(
					employeeData.shipmentCount,
					employeeData.customerShipment
				);

				teamArray[teamIndex].employees[employeeIndex].averageOrderValue = getAverageOrderValue(
					employeeData.realization,
					employeeData.shipmentCount
				);
			});
		});
		data.teams = teamArray;

		setDataCurrent(data);
	}, [reportAll, staffAll, year]);

	return dataCurrent;
};
