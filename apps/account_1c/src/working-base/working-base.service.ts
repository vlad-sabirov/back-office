import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { MsCrmService } from '../ms-crm/ms-crm.service';
import { InjectModel } from '@nestjs/mongoose';
import { WorkingBaseModel } from './models/working-base.model';
import { formatISO, getMonth, getYear, parse } from 'date-fns';
import { isSameMonth, parseISO, subDays } from 'date-fns';

import {
	ICreateWorkingBaseDto,
	ICreateWorkingBaseDtoObject,
	ICreateWorkingBaseOrganization,
	ICreateWorkingBaseUser,
} from './dto/create-working-base.dto';

@Injectable()
export class WorkingBaseService {
	private readonly logger = new Logger('WorkingBaseService');

	constructor(
		private readonly msCrmService: MsCrmService,

		@InjectModel(WorkingBaseModel.name)
		private readonly workingBaseModel: Model<WorkingBaseModel>,
	) {}
	onModuleInit(): void {
		this.logger.log('Initialized');
	}

	getAll = async (): Promise<Omit<WorkingBaseModel, 'organizations'>[]> => {
		const report: WorkingBaseModel[] = JSON.parse(
			JSON.stringify(
				await this.workingBaseModel.find(
					{},
					{},
					{ sort: { year: 1, month: 1 } },
				),
			),
		);
		return report.map((item) => {
			const { organizations, ...output } = item;
			return output;
		});
	};

	getByDate = async (dto: {
		year: number;
		month: number;
	}): Promise<Omit<WorkingBaseModel, 'organizations'>> => {
		const { year, month } = dto;
		const { organizations, ...report }: WorkingBaseModel = JSON.parse(
			JSON.stringify(await this.workingBaseModel.findOne({ year, month })),
		);
		return report;
	};

	getNewOrganizationsByDate = async (dto: {
		year: number;
		month: number;
	}): Promise<Map<number, number>> => {
		const orgs = await this.msCrmService.getOrganizationAll();
		if (!('data' in orgs)) return;

		const newOrganizations = new Map<number, number>();
		orgs.data.forEach((org) => {
			const createdAt = parseISO(org.createdAt);
			if (
				getYear(createdAt) === dto.year &&
				getMonth(createdAt) === dto.month - 1
			) {
				newOrganizations.set(
					org.userId,
					(newOrganizations.get(org.userId) ?? 0) + 1,
				);
			}
		});

		return newOrganizations;
	};

	updateWorkingBase = async ({
		year,
		month,
		mediumDuration,
		lowDuration,
		emptyDuration,
	}: ICreateWorkingBaseDto): Promise<any> => {
		const updateDto: ICreateWorkingBaseDtoObject = {
			year,
			month,
			total: 0,
			active: 0,
			medium: 0,
			mediumDuration,
			low: 0,
			lowDuration,
			empty: 0,
			emptyDuration,
			organizations: [],
			users: [],
		};
		const users = await this.msCrmService.getUsers();
		const orgs = await this.msCrmService.getOrganizationAll();

		if (
			'status' in users ||
			'status' in orgs ||
			!('data' in orgs) ||
			!orgs.data.length
		) {
			return;
		}

		for (const org of orgs.data) {
			updateDto.organizations.push({
				userId: org.userId,
				organizationId: org.id,
				lastUpdate:
					org.last1CUpdate ||
					formatISO(parse('1990-08-19', 'yyyy-MM-dd', new Date())),
			});
		}

		const isSameDate = isSameMonth(
			new Date(),
			parse(`${year}-${month}`, 'yyyy-MM', new Date()),
		);
		const mediumDate = subDays(new Date(), mediumDuration);
		const lowDate = subDays(new Date(), lowDuration);
		const emptyDate = subDays(new Date(), emptyDuration);
		const organizationBuckets = new Map<
			number,
			ICreateWorkingBaseOrganization[]
		>();
		if (isSameDate) {
			for (const org of updateDto.organizations) {
				if (!organizationBuckets.has(org.userId)) {
					organizationBuckets.set(org.userId, []);
				}
				const orgHash = organizationBuckets.get(org.userId);
				orgHash.push(org);
			}
		}

		for (const user of users) {
			if (!organizationBuckets.has(user.id)) {
				continue;
			}
			const userDto: ICreateWorkingBaseUser = {
				userId: user.id,
				total: 0,
				active: 0,
				low: 0,
				empty: 0,
				medium: 0,
			};
			const foundOrgs = organizationBuckets.get(user.id);
			userDto.total = foundOrgs.length;
			for (const org of foundOrgs) {
				const date = parseISO(org.lastUpdate);
				if (date > mediumDate) {
					userDto.active++;
				} else if (date <= mediumDate && date > lowDate) {
					userDto.medium++;
				} else if (date <= lowDate && date > emptyDate) {
					userDto.low++;
				} else {
					userDto.empty++;
				}
			}
			updateDto.users.push(userDto);
			updateDto.total += userDto.total;
			updateDto.active += userDto.active;
			updateDto.medium += userDto.medium;
			updateDto.low += userDto.low;
			updateDto.empty += userDto.empty;

			const foundData = await this.workingBaseModel.findOne({ year, month });
			if (foundData) {
				await this.workingBaseModel.findOneAndUpdate(
					{ year, month },
					updateDto,
				);
			} else {
				const createData = await this.workingBaseModel.create(updateDto);
				await createData.save();
			}
		}
	};
}
