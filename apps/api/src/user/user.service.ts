import { genSalt, hash } from 'bcryptjs';
import { add, differenceInMinutes, eachDayOfInterval, format, getDaysInMonth, toDate } from 'date-fns';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SearchService } from 'src/search/search.service';
import { IUserSearchEntity } from 'src/user/search-types/user.entity';
import { UserRoleService } from '../user-role/user-role.service';
import { delay, PrismaService } from '../common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDepartmentService } from '../user-department/user-department.service';
import { UserTerritoryService } from '../user-territory/user-territory.service';
import { FileService } from '../file/file.service';
import { FindLatenessDto } from './dto/find-lateness.dto';
import { AuthLateness } from '@prisma/client';
import { LatenessEntity, LatenessEntityGrouped } from 'src/auth/entity/lateness.entity';
import { isArray, uniq } from 'lodash';
import { UserAllInfoEntity } from './entities/user-all-info.entity';
import { CountUsersDto } from './dto/count-users.dto';
import { IUserTo1CEntity } from './entities/user-to-1c.entity';

@Injectable()
export class UserService extends PrismaService {
	private logger: Logger = new Logger('UserService');
	sqlIncludes;

	constructor(
		private readonly searchService: SearchService,

		private readonly userRoleService: UserRoleService,
		private readonly fileService: FileService,
		@Inject(forwardRef(() => UserDepartmentService))
		private readonly userDepartmentService: UserDepartmentService,
		@Inject(forwardRef(() => UserTerritoryService))
		private readonly userTerritoryService: UserTerritoryService
	) {
		super();
		this.sqlIncludes = {
			child: true,
			roles: true,
			department: true,
			territory: true,
		};
	}

	public async create({
		userDto,
		parentDto,
		roleDto,
		departmentDto,
		territoryDto,
	}: CreateUserInput): Promise<UserEntity> {
		const passwordHash = await this.hashPassword(userDto.password);
		const createdUser = await this.user.create({
			data: {
				...userDto,
				password: passwordHash,
				birthday: userDto.birthday ? toDate(new Date(userDto.birthday)) : undefined,
				roles: { connect: { alias: 'user' } },
			},
		});

		if (roleDto) await this.updateUserRoles(createdUser.id, roleDto);
		if (parentDto) await this.updateParentByChildId(parentDto, createdUser.id);
		if (departmentDto) await this.updateUserDepartment(createdUser.id, departmentDto);
		if (territoryDto) await this.updateUserTerritory(createdUser.id, territoryDto);

		return await this.findById(createdUser.id);
	}

	public async findSales(): Promise<UserEntity[] | null> {
		const findDepartment = await this.user.findMany({
			where: { isFired: false, departmentId: 2 },
			orderBy: { lastName: 'asc' },
			include: this.sqlIncludes,
		});

		return await findDepartment;
	}

	public async findSeniorSales(): Promise<UserEntity[] | null> {
		return await this.remoteChildren(await this.findSales());
	}

	private async remoteChildren(users: UserEntity[]): Promise<UserEntity[] | null> {
		const children = [];
		users.forEach((user) => {
			if (user.child.length) user.child.map((child) => children.push(child.id));
		});
		return users.filter((user) => !children.includes(user.id));
	}

	public async findAll(includes?: { [key: string]: any }): Promise<UserEntity[] | null> {
		return await this.user.findMany({
			where: { isFired: false },
			orderBy: { lastName: 'asc' },
			include: includes || this.sqlIncludes,
		});
	}

	findLeads = async (includes?: { [key: string]: any }): Promise<UserEntity[] | null> => {
		const findLeads = await this.findAll(includes);
		return findLeads.length ? findLeads.filter((user) => user.child.length) : [];
	};

	public async findEverything(): Promise<UserEntity[]> {
		return await this.user.findMany({
			orderBy: { lastName: 'asc' },
			include: this.sqlIncludes,
		});
	}

	public async findActive(): Promise<UserEntity[] | null> {
		return await this.user.findMany({
			where: { isFired: false },
			orderBy: { lastName: 'asc' },
			include: this.sqlIncludes,
		});
	}

	public async findLatenessAll(dto: FindLatenessDto): Promise<UserEntity[] | null> {
		const { group, id } = dto;
		const dateStart = dto.dateStart || format(new Date(), 'yyyy-MM') + '-01';
		const dateEnd = dto.dateEnd || format(new Date(), 'yyyy-MM') + '-' + getDaysInMonth(new Date());

		const dateArray = eachDayOfInterval({
			start: new Date(dateStart),
			end: new Date(dateEnd),
		});

		const whereId = isArray(id)
			? {
					OR: id.map((item) => ({
						id: Number(item),
					})),
			  }
			: { id: Number(id) || undefined };

		const findUsers: UserEntity[] = await this.user.findMany({
			where: { isFired: false, isFixLate: true, ...whereId },
			orderBy: { lastName: 'asc' },
			include: {
				lateness: {
					where: {
						createdAt: {
							gte: dateStart + 'T00:00:00.000Z',
							lte: dateEnd + 'T23:59:59.999Z',
						},
					},
				},
			},
		});

		return findUsers.map((user) => {
			let workingMinutes = 0;
			let latenessMinutes = 0;
			const lateness: LatenessEntity[] = [];

			dateArray.forEach((date) => {
				const selfDate = new Date();
				if (toDate(date) > selfDate) return;

				const dateDay = format(date, 'yyyy-MM-dd');
				const findLateness = isArray(user.lateness)
					? user.lateness.find((item) => {
							if (dateDay === format(item.createdAt, 'yyyy-MM-dd')) return true;
					  })
					: undefined;
				const lateMinutes = findLateness
					? differenceInMinutes(
							new Date(format(add(findLateness.createdAt, { hours: 5 }), 'yyyy-MM-dd HH:mm:ss')),
							new Date(`${format(findLateness.createdAt, 'yyyy-MM-dd')} 09:00:00`)
					  )
					: 480;

				if (date.getDay() !== 0 && date.getDay() !== 6) {
					workingMinutes += 480;
					if (lateMinutes > 5) latenessMinutes += lateMinutes > 480 ? 480 : lateMinutes;
				}

				lateness.push({
					id: findLateness?.id || undefined,
					createdAt: findLateness?.createdAt || new Date(date),
					userId: user.id,
					type: '',
					comment: findLateness?.comment || '',
					metaInfo: findLateness?.metaInfo || '',
					isSkipped: findLateness?.isSkipped,
				});
			});

			const latenessGroup: LatenessEntityGrouped = {
				arrived: [],
				lateness: [],
				didCome: [],
			};

			if (group)
				lateness.forEach((item) => {
					// Не пришел на работу
					if (format(item.createdAt, 'HHmm') === '0000')
						latenessGroup.didCome.push({
							date: format(item.createdAt, 'yyyy-MM-dd'),
							comment: item.comment,
							metaInfo: item.metaInfo,
							isSkipped: item.isSkipped,
						});
					// Пришел на работу вовремя
					else if (Number(format(add(item.createdAt, { hours: 5 }), 'Hmm')) <= 905)
						latenessGroup.arrived.push({
							id: item.id,
							date: format(item.createdAt, 'yyyy-MM-dd'),
							time: format(add(item.createdAt, { hours: 5 }), 'HH:mm'),
							comment: item.comment,
							metaInfo: item.metaInfo,
							isSkipped: item.isSkipped,
						});
					// Опоздал
					else {
						latenessGroup.lateness.push({
							id: item.id,
							date: format(item.createdAt, 'yyyy-MM-dd'),
							time: format(add(item.createdAt, { hours: 5 }), 'HH:mm'),
							latenessMinutes: Number(format(add(item.createdAt, { hours: 5 }), 'Hmm')) - 900,
							comment: item.comment,
							metaInfo: item.metaInfo,
							isSkipped: item.isSkipped,
						});
					}
				});

			return {
				...user,
				lateness: group ? latenessGroup : lateness,
				workingMinutes: workingMinutes || 1,
				latenessMinutes: latenessMinutes || 1,
			};
		});
	}

	findDidComeToday = async (date?: Date): Promise<UserEntity[] | null> => {
		const getUsers = await this.findLatenessAll({
			dateStart: format(date || new Date(), 'yyyy-MM-dd'),
			dateEnd: format(date || new Date(), 'yyyy-MM-dd'),
			group: true,
		});

		return getUsers.filter((user) => {
			return !!(user.lateness && !isArray(user.lateness) && user.lateness.didCome.length);
		});
	};

	findLastLatenessByUserId = async (userId: number | string): Promise<AuthLateness> => {
		return await this.authLateness.findFirst({
			where: { userId: Number(userId) },
			orderBy: { id: 'desc' },
		});
	};

	async findById(id: number | string): Promise<UserEntity | null> {
		const findUser: UserEntity = await this.user.findUnique({
			where: { id: Number(id) },
			include: this.sqlIncludes,
		});

		if (findUser) {
			const parentUser = await this.findParentByChildId(findUser.id);
			if (parentUser.length > 0) findUser.parent = parentUser[0];
		}

		return findUser;
	}

	public async findByIdMany(id: (string | number)[]): Promise<UserEntity[] | null> {
		return await Promise.all(id.map(async (item) => await this.findById(item)));
	}

	public async findAllInfoById(id: number | string): Promise<UserAllInfoEntity | null> {
		const findUser: UserAllInfoEntity = await this.user.findUnique({
			where: { id: Number(id) },
			include: { territory: true, department: true, child: true, roles: true },
		});

		if (findUser) {
			if (findUser.child.length > 0) {
				findUser.children = findUser.child;
				findUser.childrenId = findUser.child.map((user) => user.id);
			}

			const parentUser = await this.findParentByChildId(findUser.id);
			if (parentUser.length > 0) {
				findUser.parentId = parentUser[0].id;
				findUser.parent = parentUser[0];
			}

			if (findUser.roles.length) {
				findUser.rolesAlias = findUser.roles.map((role) => role.alias);
			}

			const team = await this.findMyTeamUsersId(findUser.id);
			if (team) findUser.team = team;
		}

		return findUser;
	}

	public async findByUsername(username: string): Promise<UserEntity | null> {
		const findUser: UserEntity = await this.user.findUnique({
			where: { username: String(username) },
			include: this.sqlIncludes,
		});

		if (findUser) {
			const parentUser = await this.findParentByChildId(findUser.id);
			if (parentUser.length > 0) findUser.parent = parentUser[0];
		}

		return findUser;
	}

	public async findByTerritoryId(territoryId: number): Promise<UserEntity[] | null> {
		return await this.user.findMany({
			where: { territoryId: Number(territoryId) },
			include: this.sqlIncludes,
		});
	}

	public async findByDepartmentId(departmentId: number): Promise<UserEntity[] | null> {
		return await this.user.findMany({
			where: { departmentId: Number(departmentId) },
			include: this.sqlIncludes,
		});
	}

	public async findByVoip(phone: string): Promise<UserEntity | null> {
		return await this.user.findFirst({
			where: { AND: [{ phoneVoip: phone }, { isFired: false }] },
			include: this.sqlIncludes,
		});
	}

	public async findByMobile(phone: string): Promise<UserEntity | null> {
		if (phone.length !== 12 && phone.length !== 9) return;
		return await this.user.findFirst({
			where: { AND: [{ phoneMobile: phone.length === 12 ? phone : { contains: phone } }, { isFired: false }] },
			include: this.sqlIncludes,
		});
	}

	public async findByRole(role: string): Promise<UserEntity[] | null> {
		return await this.user.findMany({
			where: { roles: { some: { alias: role } } },
			include: this.sqlIncludes,
		});
	}

	public async findParentByChildId(childId: number | string): Promise<UserEntity[]> {
		return await this.user.findMany({
			where: {
				child: { some: { id: Number(childId) } },
			},
			include: this.sqlIncludes,
		});
	}

	findMyTeamUsersId = async (userId: number | string): Promise<number[]> => {
		const result = [Number(userId)];

		const findUser = await this.findById(userId);
		if (findUser.child) findUser.child.forEach((item) => result.push(item.id));

		const findParentByChildId = await this.findParentByChildId(userId);
		if (findParentByChildId) {
			findParentByChildId.map((user) => {
				result.push(user.id);

				if (user.child) user.child.forEach((userChild) => result.push(userChild.id));
			});
		}

		return uniq(result);
	};

	findEmployeeTo1C = async (): Promise<IUserTo1CEntity[]> => {
		const foundUsers = await this.user.findMany({
			where: { roles: { some: { alias: 'crm' } } },
		});
		return foundUsers.map((user) => ({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			sex: user.sex,
			color: user.color,
			photo: user.photo,
			phoneVoip: user.phoneVoip,
			workPosition: user.workPosition,
			phoneMobile: user.phoneMobile,
		}));
	};

	count = async (options?: CountUsersDto) => {
		const { isFiredIncluded, sex, departmentId, territoryId } = options || {};
		return await this.user.count({
			where: {
				isFired: isFiredIncluded ? undefined : false,
				sex: sex || undefined,
				departmentId: departmentId || undefined,
				territoryId: territoryId || undefined,
			},
		});
	};

	getBirthdayUpcoming = async (count: number): Promise<UserEntity[]> => {
		const findBirthdayUpcoming: UserEntity[] = await this.$queryRaw`select *
      from (
        select *, cast(birthday + ((extract(year from age(birthday)) + 1) * interval '1' year) as date) as next_birthday
        from public.user
      ) as upcoming
      where upcoming.next_birthday <= current_date + 365 AND NOT "isFired"
      order by next_birthday
      limit ${count}`;

		if (findBirthdayUpcoming.length) return await this.findByIdMany(findBirthdayUpcoming.map((item) => item.id));

		return null;
	};

	getBirthdayToday = async (): Promise<UserEntity[]> => {
		const findBirthdayUpcoming: UserEntity[] = await this.$queryRaw`
			SELECT * FROM public.user WHERE date_part('day', birthday) = date_part('day', CURRENT_DATE) 
			AND date_part('month', birthday) = date_part('month', CURRENT_DATE)
			AND NOT "isFired"
		`;

		if (findBirthdayUpcoming.length) return await this.findByIdMany(findBirthdayUpcoming.map((item) => item.id));

		return null;
	};

	public async updateById(
		id: number,
		{ userDto, parentDto, roleDto, departmentDto, territoryDto }: UpdateUserInput
	): Promise<UserEntity> {
		const findUser = await this.user.findUnique({ where: { id: Number(id) } });

		if (userDto) await this.updateUserInfo(id, userDto);
		if (roleDto) await this.updateUserRoles(id, roleDto);
		if (typeof parentDto !== 'undefined') await this.updateParentByChildId(parentDto, id);
		if (departmentDto) await this.updateUserDepartment(id, departmentDto);
		if (territoryDto) await this.updateUserTerritory(id, territoryDto);

		if (userDto.isFired === false && userDto.isFired !== findUser.isFired) {
			await this.user.update({
				where: { id: Number(id) },
				data: { roles: { connect: { alias: 'user' } } },
			});
		}

		return await this.findById(id);
	}

	public async updatePasswordByUserId(id: number, password: string): Promise<UserEntity> {
		const passwordHash = await this.hashPassword(password);
		return await this.user.update({
			where: { id: Number(id) },
			data: {
				password: passwordHash,
			},
		});
	}

	removeParentChildBind = async (userId: number | string): Promise<void> => {
		const findParent = (await this.findParentByChildId(userId))[0];

		if (findParent?.id)
			await this.updateChildByParentId(
				findParent.id,
				findParent.child.filter((user) => user.id !== Number(userId)).map((user) => user.id)
			);
	};

	removeAllChildrenByParentId = async (parentId: number | string): Promise<void> => {
		await this.user.update({
			where: { id: Number(parentId) },
			data: { child: { set: [] } },
		});
	};

	public async updateFiredByUserId(id: number | string): Promise<UserEntity> {
		const findUser = await this.findById(Number(id));

		await this.user.update({
			where: { id: Number(id) },
			data: {
				isFired: true,
				phoneVoip: '',
				territoryId: null,
				departmentId: null,
				workPosition: '',
				roles: { set: [] },
			},
		});

		if (findUser.child) await this.removeAllChildrenByParentId(id);
		await this.removeParentChildBind(id);

		await this.userTerritoryService.updateTerritoryUsers();
		await this.userDepartmentService.updateDepartmentUsers();

		return findUser;
	}

	private async updateUserInfo(id: number, dto: UpdateUserDto): Promise<void> {
		await this.user.update({
			where: { id: Number(id) },
			data: {
				...dto,
				birthday: dto.birthday ? toDate(new Date(dto.birthday)) : undefined,
			},
		});

		if (dto.password) {
			const passwordHash = await this.hashPassword(dto.password);
			await this.user.update({
				where: { id: Number(id) },
				data: {
					password: passwordHash,
				},
			});
		}
	}

	private async updateUserRoles(id: number, dto: number[]): Promise<void> {
		const filterRoles = await this.userRoleService.filterExistingById(dto);
		await this.user.update({
			where: { id: Number(id) },
			data: {
				roles: {
					set: [],
					connect: filterRoles.map((value) => ({ id: value })),
				},
			},
		});
	}

	public async updateUserDepartment(userId: number, departmentId: number): Promise<UserEntity> {
		await this.user.update({
			where: { id: Number(userId) },
			data: {
				departmentId: departmentId,
			},
		});

		await this.userDepartmentService.updateDepartmentUsers();
		return this.findById(userId);
	}

	public async updateUserTerritory(userId: number, territoryId: number): Promise<UserEntity> {
		await this.user.update({
			where: { id: Number(userId) },
			data: {
				territoryId: territoryId,
			},
		});

		await this.userTerritoryService.updateTerritoryUsers();

		return this.findById(userId);
	}

	private async updateChildByParentId(parentId: number, child: number[]): Promise<void> {
		await this.user.update({
			where: { id: Number(parentId) },
			data: {
				child: {
					set: [],
					connect: child.map((childId) => ({ id: Number(childId) })),
				},
			},
		});
	}

	private async updateParentByChildId(parentId: number, childId: number): Promise<void> {
		// Удаляет childId у всех родителей
		const findOldParent = await this.findParentByChildId(childId);
		findOldParent.map(async (parent) => {
			const filterChild = parent.child.filter((child) => child.id !== Number(childId)).map((child) => child.id);
			await this.updateChildByParentId(parent.id, filterChild);
		});

		// Добавляет childId для нового родителя
		if (parentId !== 0) {
			const findNewParent = await this.findById(parentId);
			const filerChild = findNewParent.child.map((child) => child.id);
			filerChild.push(childId);
			await this.updateChildByParentId(parentId, filerChild);
		}
	}

	public async deleteById(id: number): Promise<UserEntity> {
		const findUser = await this.user.findUnique({ where: { id: Number(id) } });

		await this.auth.deleteMany({ where: { userId: Number(id) } });
		await this.user.delete({ where: { id: Number(id) } });

		if (findUser.photo) await this.fileService.deleteFile('/uploads' + findUser.photo);

		if (findUser.departmentId) await this.userDepartmentService.updateDepartmentUsers();

		if (findUser.telegramId) await this.userTerritoryService.updateTerritoryUsers();

		return findUser;
	}

	public async hashPassword(password: string): Promise<string> {
		return await hash(password, await genSalt(Number(process.env.HASH_SALT)));
	}

	searchElastic = async ({
		request,
		take,
		skip,
	}: {
		request: string;
		deep?: boolean;
		take?: number;
		skip?: number;
	}) => {
		return await this.searchService.search<IUserSearchEntity>({
			index: 'user',
			body: {
				fullName: { type: 'string', value: request },
				firstName: { type: 'string', value: request },
				lastName: { type: 'string', value: request },
				surName: { type: 'string', value: request },
				phoneMobile: { type: 'number', value: request },
				phoneVoip: { type: 'number', value: request },
			},
			take,
			skip,
		});
	};

	searchElasticById = async (id: number | string) => {
		return await this.searchService.search<IUserSearchEntity>({
			index: 'user',
			body: {
				id: { type: 'string', value: Number(id) },
			},
		});
	};

	private elasticSearchInit = async (): Promise<void> => {
		await delay(process.env.NODE_ENV === 'development' ? 0 : 60000);
		try {
			await this.searchService.ping();
		} catch (e) {
			setTimeout(() => this.onModuleInit(), 1000);
			return;
		}

		performance.mark('elasticSearchUserInitStart');
		this.logger.log('Start elastic search init');

		try {
			await this.searchService.delete('user');
		} catch (e) {}

		try {
			await this.searchService.init<IUserSearchEntity>({
				index: 'user',
				fields: {
					id: 'number',
					firstName: 'string',
					lastName: 'string',
					surName: 'string',
					fullName: 'string',
					phoneMobile: 'string',
					phoneVoip: 'string',
					isFired: 'number',
				},
			});
		} catch (e) {}

		try {
			const users = await this.findEverything();
			for (const user of users) {
				await this.searchService.index<IUserSearchEntity>({
					index: 'user',
					id: String(user.id),
					body: {
						id: user.id,
						fullName: `${user.lastName} ${user.firstName} ${user.surName}`.trim(),
						firstName: user.firstName || '',
						lastName: user.lastName || '',
						surName: user.surName || '',
						phoneMobile: user.phoneMobile || '',
						phoneVoip: user.phoneVoip || '',
						isFired: user.isFired ? 1 : 0,
					},
				});
			}
		} catch (e) {}

		performance.mark('elasticSearchUserInitFinish');
		performance.measure('elasticSearchUserInit', 'elasticSearchUserInitStart', 'elasticSearchUserInitFinish');
		const measure = performance.getEntriesByName('elasticSearchUserInit')[0];
		this.logger.log(`Elastic search init complete ${Math.round(measure.duration)}ms`);
	};

	onModuleInit = async () => {
		this.elasticSearchInit().then();
	};
}
