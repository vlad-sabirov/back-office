import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Ms1cService } from '../ms-1c/ms-1c.service';
import { MsCrmService } from '../ms-crm/ms-crm.service';
import { InjectModel } from '@nestjs/mongoose';
import { RealizationMonthModel } from './models/realization-month-all.model';
import { ICreateDto } from './dto/create.dto';
import { IUpdateAllByDateDto } from './dto/update-all-by-date.dto';
import { GetTotal } from './utils/get-total';
import { IFindByDate } from './dto/find-by-date.dto';
import { IFindAllDto } from './dto/find-all.dto';
import { IBuildAllByDateDto } from './dto/build-all-by-date.dto';
import { IHashTeamTypes } from './types/hash-users.types';
import { RealizationMonthTeamModel } from './models/realization-month-team.model';
import { startOfMonth, endOfMonth, parse } from 'date-fns';
import { formatISO, subMonths, format } from 'date-fns';
import { uniq, merge } from 'lodash';
import { WorkingBaseService } from 'src/working-base/working-base.service';

@Injectable()
export class RealizationMonthService {
	private readonly logger = new Logger('RealizationMonthService');

	constructor(
		private readonly ms1cService: Ms1cService,
		private readonly msCrmService: MsCrmService,
		private readonly workingBaseService: WorkingBaseService,

		@InjectModel(RealizationMonthModel.name)
		private readonly realizationMonthModel: Model<RealizationMonthModel>,
	) {}
	onModuleInit(): void {
		this.logger.log('Initialized');
	}

	create = async (dto: ICreateDto): Promise<RealizationMonthModel> => {
		const teams = GetTotal.getTotalTeam(dto.teams);
		const data: RealizationMonthModel = GetTotal.getTotalAll({
			...dto,
			teams,
		});
		const createReport = await this.realizationMonthModel.create(data);
		return createReport.save();
	};

	update = async (dto: ICreateDto): Promise<RealizationMonthModel> => {
		const report = await this.findByDate({
			year: dto.year,
			month: dto.month,
		});

		const teams = GetTotal.getTotalTeam(dto.teams);
		const data: RealizationMonthModel = GetTotal.getTotalAll({
			...dto,
			teams,
		});

		return this.realizationMonthModel.findOneAndUpdate(
			{ year: dto.year, month: dto.month },
			GetTotal.getTotalAll(merge(report, data)),
			{ new: true },
		);
	};

	findAll = async (dto?: IFindAllDto): Promise<RealizationMonthModel[]> => {
		const order = dto?.order ?? 'asc';
		return this.realizationMonthModel.find(null, null, {
			sort: { year: order, month: order },
		});
	};

	findByDate = async (dto: IFindByDate): Promise<RealizationMonthModel> => {
		const { year, month } = dto;
		return this.realizationMonthModel.findOne({ year, month });
	};

	updateAllByDate = async (
		dto: IUpdateAllByDateDto,
	): Promise<RealizationMonthModel> => {
		const foundReport = await this.findByDate({
			year: dto.year,
			month: dto.month,
		});
		const data = Object.assign(foundReport, dto.data);
		const teams = GetTotal.getTotalTeam(data.teams);
		const response = await this.realizationMonthModel.findOneAndUpdate(
			{ year: dto.year, month: dto.month },
			GetTotal.getTotalAll(Object.assign(data, teams)),
			{ new: true },
		);

		return response;
	};

	buildAllByDate = async (
		dto: IBuildAllByDateDto,
	): Promise<RealizationMonthModel> => {
		const year = Number(dto.year);
		const month = Number(dto.month);
		const parsedDate = parse(`${year}-${month}`, 'yyyy-MM', new Date());
		const isTodayMonth =
			startOfMonth(new Date()).getTime() == parsedDate.getTime();
		const date_start = formatISO(startOfMonth(parsedDate));
		const date_end = formatISO(endOfMonth(parsedDate));

		// Получение первичных данных
		const foundReport = await this.realizationMonthModel.findOne({
			year,
			month,
		});
		const foundTeams = await this.ms1cService.getTeams();
		const foundUsers = await this.msCrmService.getUsers();
		if (!foundReport || !('data' in foundTeams) || 'status' in foundUsers) {
			return null;
		}

		// Составляю список разницы в организациях
		const currentWoringBase =
			await this.workingBaseService.getNewOrganizationsByDate({
				year,
				month,
			});

		// Набор ID уволенных сотрудников
		const firedUserIds = new Set(
			foundUsers.filter((u) => u.isFired).map((u) => u.id),
		);

		// Матчинг по ФИО или алиасу name1c
		const matchUser = (name: string) =>
			foundUsers.find(
				(u) =>
					name === `${u.lastName} ${u.firstName}` ||
					(u.name1c && name === u.name1c),
			);

		// Создание hashmap для команд с ID, именем и кодом 1С
		const hashTeams: Map<number, IHashTeamTypes> = new Map();
		for (const team of foundTeams.data) {
			const foundUser = matchUser(team.name);
			if (!foundUser || firedUserIds.has(foundUser.id)) {
				continue;
			}
			const teamHash: IHashTeamTypes = {
				userId: foundUser.id,
				name: team.name,
				code: team.code,
				employees: [],
			};
			for (const employee of team.emloyees) {
				const foundEmployee = matchUser(employee.name);

				// Код сотрудника нужен для подсчёта реализации команды,
				// даже если он уволен — его последние продажи должны учитываться
				if (!foundEmployee?.id) {
					// Сотрудник не найден в бэкофисе — добавляем только код
					teamHash.employees.push({
						userId: 0,
						name: employee.name,
						code: employee.code,
					});
					continue;
				}

				teamHash.employees.push({
					userId: foundEmployee.id,
					name: employee.name,
					code: employee.code,
				});
			}
			hashTeams.set(foundUser.id, teamHash);
		}
		if (!hashTeams.size) {
			return null;
		}

		// Формирование объекта который будет использоваться для обновления отчета
		const updateDto: IUpdateAllByDateDto = {
			year,
			month,
			data: {
				year,
				month,
				teams: [],
			},
		};
		for (const team of foundReport.teams) {
			if (firedUserIds.has(team.userId)) {
				continue;
			}
			const foundTeam = hashTeams.get(team.userId);
			if (!foundTeam) {
				continue;
			}
			const foundTeamReport = foundReport.teams.find(
				({ userId }) => foundTeam.userId == userId,
			);
			const teamIds = isTodayMonth
				? await this.msCrmService.getTeamIdsWithUserId(team.userId)
				: team.staffIds;
			if (typeof teamIds !== 'undefined' && 'status' in teamIds) {
				return null;
			}
			const countOrganizations = isTodayMonth
				? await this.msCrmService.getCountOrganizationsWithUserIds(teamIds)
				: team.customerCount;

			const newTeam: RealizationMonthTeamModel = {
				userId: foundTeam.userId,
				plan: team.plan,
				planCustomerCount: team.planCustomerCount,
				planWorkingBasePercent: team.planWorkingBasePercent,
				employees: [],
				staffIds: teamIds,
				customerCount:
					typeof countOrganizations === 'number' ? countOrganizations : 0,
			};
			const report = await this.ms1cService.getRealization({
				date_start,
				date_end,
				employee: uniq(
					foundTeam.employees.flatMap(({ code }) => {
						const employeeCodes = team.employees.flatMap(({ userId }) =>
							hashTeams
								.get(userId)
								.employees.map((employee) => employee.code),
						);
						return [code, ...employeeCodes];
					}),
				),
			});
			if (!('data' in report)) {
				updateDto.data.teams.push(foundTeamReport);
				continue;
			}

			newTeam.realization = report.data[0].realization;
			newTeam.shipmentCount = report.data[0].shipment_count;
			newTeam.customerShipment = report.data[0].customer_shipment;
			newTeam.employees = foundTeamReport.employees;

			newTeam.employees = newTeam.employees.filter(
				(e) => !firedUserIds.has(e.userId),
			);

			if (team.employees && team.employees.length) {
				for (const employee of team.employees) {
					if (firedUserIds.has(employee.userId)) {
						continue;
					}
					const foundEmployee = hashTeams.get(employee.userId);
					const report = await this.ms1cService.getRealization({
						date_start,
						date_end,
						employee: foundEmployee.employees.map(({ code }) => code),
					});
					if (!('data' in report)) {
						continue;
					}
					const countOrganizations = isTodayMonth
						? await this.msCrmService.getCountOrganizationsWithUserIds([
								employee.userId,
						  ])
						: employee.customerCount;

					const foundEmployeeNewTeam = newTeam.employees.find(
						({ userId }) => userId == employee.userId,
					);
					foundEmployeeNewTeam.realization = report.data[0].realization;
					foundEmployeeNewTeam.shipmentCount =
						report.data[0].shipment_count;
					foundEmployeeNewTeam.customerShipment =
						report.data[0].customer_shipment;
					foundEmployeeNewTeam.customerCount =
						typeof countOrganizations === 'number'
							? countOrganizations
							: 0;
				}
			}

			updateDto.data.teams.push(newTeam);
		}

		return await this.updateAllByDate(updateDto);
	};
}
