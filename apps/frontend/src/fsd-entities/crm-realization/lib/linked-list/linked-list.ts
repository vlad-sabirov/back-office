import { diff } from './libs/diff';
import { getEmployeeByUserId } from './libs/get-employee-by-user-id';
import { getTeamByUserId } from './libs/get-team-by-user-id';
import { toArrayAll } from './libs/to-array-all';
import { toArrayTeam } from './libs/to-array-team';
import { ILinkedListAll, ILinkedListAllValue } from './types.linked-list';
import { IMonthRes } from '../../api/res';

export const LinkedList = (data: IMonthRes[]): ILinkedListAll => {
	const hashMap: ILinkedListAll['linkedList'] = {};
	if (!data || !data.length) {
		return {
			linkedList: hashMap,
			toArray: () => [],
			first: null,
			last: null,
			getTeamByUserId: () => [],
			getEmployeeByUserId: () => [],
		};
	}

	let prev: ILinkedListAllValue | null = null;
	let first: ILinkedListAllValue | null = null;
	let last: ILinkedListAllValue | null = null;

	/* --------------
	-----------------
	------- 1 -------
	-----------------
	-------------- */
	for (const reportAll of data) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { teams, ...data } = reportAll;
		const key = `${reportAll.year}-${reportAll.month < 10 ? '0' : ''}${reportAll.month}`;

		const value: ILinkedListAllValue = {
			data: data,
			downToTeams: {
				linkedList: [],
				toArray: () => [],
			},
			downToEmployees: {
				linkedList: [],
				toArray: () => [],
			},
			first: null,
			prev,
			next: null,
			last: null,
			diff: () => null,
		};
		hashMap[key] = value;
		if (prev) {
			prev.next = value;
			last = value;
		} else {
			first = value;
		}
		prev = value;
	}

	/* --------------
	-----------------
	------- 2 -------
	-----------------
	-------------- */
	for (const reportAll of data) {
		const { teams } = reportAll;
		const key = `${reportAll.year}-${reportAll.month < 10 ? '0' : ''}${reportAll.month}`;
		const report = hashMap[key];
		if (!report) {
			continue;
		}

		report.first = first;
		report.last = last;
		report.diff = (node) => diff(report, node);

		teams?.forEach((team) => {
			report.downToTeams.linkedList[team.userId] = {
				data: { ...team, year: reportAll.year, month: reportAll.month },
				prev: null,
				next: null,
				upToAll: null,
				downToEmployee: null,
				diff: () => null,
			};

			team.employees?.forEach((employee) => {
				report.downToEmployees.linkedList[employee.userId] = {
					data: { ...JSON.parse(JSON.stringify(employee)), year: reportAll.year, month: reportAll.month },
					next: null,
					prev: null,
					upToTeam: null,
					diff: () => null,
				};
			});
		});
		report.downToTeams.toArray = () => toArrayTeam(report.downToTeams);
	}

	/* --------------
	-----------------
	------- 3 -------
	-----------------
	-------------- */
	for (const reportAll of data) {
		const { teams } = reportAll;
		const key = `${reportAll.year}-${reportAll.month < 10 ? '0' : ''}${reportAll.month}`;
		if (!teams || !teams.length || !hashMap[key]) {
			continue;
		}
		const { prev, next, downToTeams: hashTeams, downToEmployees: hashEmployees } = hashMap[key];

		teams?.forEach((team) => {
			const foundTeam = hashTeams.linkedList[team.userId];
			foundTeam.prev = prev?.downToTeams?.linkedList?.[team.userId]
				? prev.downToTeams.linkedList[team.userId]
				: null;
			foundTeam.next = next?.downToTeams?.linkedList?.[team.userId]
				? next.downToTeams.linkedList[team.userId]
				: null;
			foundTeam.upToAll = hashMap[key];
			foundTeam.diff = (node) => diff(foundTeam, node);

			team.employees?.forEach((employee) => {
				const foundEmployee = hashEmployees.linkedList[employee.userId];
				foundEmployee.prev = prev?.downToEmployees?.linkedList?.[employee.userId]
					? prev.downToEmployees?.linkedList?.[employee.userId]
					: null;
				foundEmployee.next = next?.downToEmployees?.linkedList?.[employee.userId]
					? next.downToEmployees?.linkedList?.[employee.userId]
					: null;
				foundEmployee.upToTeam = foundTeam;
				foundEmployee.diff = (node) => diff(foundEmployee, node);
				foundTeam.downToEmployee = hashEmployees;
			});
		});
	}

	return {
		linkedList: hashMap,
		toArray: (options) => toArrayAll(first, last, options),
		first,
		last,
		getTeamByUserId: (userId, options) => getTeamByUserId(first, userId, options),
		getEmployeeByUserId: (userId, options) => getEmployeeByUserId(first, userId, options),
	};
};
