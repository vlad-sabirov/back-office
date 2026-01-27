import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../common';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { ResortTerritoryDto } from './dto/resort-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { UserTerritoryEntity } from './entity/user-territory.entity';
import { UserTerritoryConstants } from './user-territory.constants';

@Injectable()
export class UserTerritoryService extends PrismaService {
	sqlIncludes;

	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {
		super();
		this.sqlIncludes = {
			users: { where: { isFired: false }, orderBy: { position: 'asc' } },
		};
	}

	public create = async (dto: CreateTerritoryDto): Promise<UserTerritoryEntity> => {
		const position = (await this.findLastPosition()) + 1;
		return await this.userTerritory.create({
			data: { ...dto.territoryDto, position },
		});
	};

	public findAll = async (): Promise<UserTerritoryEntity[]> => {
		return await this.userTerritory.findMany({
			orderBy: { position: 'asc' },
			include: this.sqlIncludes,
		});
	};

	public findFirst = async (ignoreId?: number): Promise<UserTerritoryEntity> => {
		return await this.userTerritory.findFirst({
			where: ignoreId ? { NOT: { id: Number(ignoreId) } } : undefined,
			orderBy: { position: 'asc' },
		});
	};

	public findById = async (id: number): Promise<UserTerritoryEntity> => {
		return await this.userTerritory.findUnique({
			where: { id: Number(id) },
			include: this.sqlIncludes,
		});
	};

	public findByName = async (name: string): Promise<UserTerritoryEntity> => {
		return await this.userTerritory.findUnique({
			where: { name: String(name) },
			include: this.sqlIncludes,
		});
	};

	public findByAddress = async (address: string): Promise<UserTerritoryEntity> => {
		return await this.userTerritory.findUnique({
			where: { address: String(address) },
			include: this.sqlIncludes,
		});
	};

	public findLastPosition = async (): Promise<number> => {
		const findLastPositionTerritory = await this.userTerritory.findFirst({
			orderBy: { position: 'desc' },
			include: this.sqlIncludes,
		});

		if (findLastPositionTerritory) return findLastPositionTerritory.position;
		return 0;
	};

	public updateById = async (id: number, dto: UpdateTerritoryDto): Promise<UserTerritoryEntity> => {
		return await this.userTerritory.update({
			where: { id: Number(id) },
			data: dto.territoryDto,
			include: this.sqlIncludes,
		});
	};

	public updateTerritoryUsers = async (): Promise<boolean> => {
		const findTerritories = await this.userTerritory.findMany({
			where: { isHide: false },
		});
		if (!findTerritories.length) return false;

		for (const territory of findTerritories) {
			const staffCount = await this.user.count({
				where: { territoryId: Number(territory.id), isFired: false },
			});

			await this.userTerritory.update({
				where: { id: Number(territory.id) },
				data: { staffCount: Number(staffCount) },
			});
		}

		return true;
	};

	public resort = async (dto: ResortTerritoryDto[]): Promise<void> => {
		dto?.map(async (territory) => {
			await this.userTerritory.update({
				where: { id: Number(territory.id) },
				data: { position: Number(territory.position) },
				include: this.sqlIncludes,
			});
		});
	};

	public deleteById = async (id: number): Promise<UserTerritoryEntity> => {
		const findUsers = await this.userService.findByTerritoryId(id);
		const firstTerritory = await this.findFirst(id);

		if (!firstTerritory)
			throw new HttpException(UserTerritoryConstants.ERROR_IT_IS_LAST_TERRITORY, HttpStatus.BAD_REQUEST);

		findUsers.map(async (user) => await this.userService.updateUserTerritory(user.id, firstTerritory.id));

		return await this.userTerritory.delete({
			where: { id: Number(id) },
			include: this.sqlIncludes,
		});
	};
}
