import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Access } from 'src/auth/decorators/roles-auth.decorator';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { UserTerritoryService } from 'src/user-territory/user-territory.service';
import { UserAllInfoEntity } from '../entities/user-all-info.entity';
import { UserCountAllEntity } from '../entities/user-count-all.entity';
import { UserEntity } from '../entities/user.entity';
import { UserConstants } from '../user.constants';
import { UserService } from '../user.service';
import { IUserTo1CEntity } from '../entities/user-to-1c.entity';

@Controller('user/find')
export class GetUserController {
	constructor(
		private readonly userService: UserService,
		private readonly userTerritoryService: UserTerritoryService
	) {}

	@Get('')
	async findAll(): Promise<UserEntity[] | null> {
		return await this.userService.findAll();
	}

	@Get('/everything')
	async findEverything(): Promise<UserEntity[] | null> {
		return await this.userService.findEverything();
	}

	@Get('/department/seniorSales')
	async findSeniorSales(): Promise<UserEntity[] | null> {
		return await this.userService.findSeniorSales();
	}

	@Get('/department/sales')
	async sales(): Promise<UserEntity[] | null> {
		return await this.userService.findSales();
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	}

	@Get('/byIdMany/')
	async findByIdManyGet(@Query() { userIds }: { userIds: string }): Promise<UserEntity[]> {
		const findUser = await this.userService.findByIdMany(userIds.split(','));
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	}

	@Post('/byId/')
	async findByIdMany(@Body() { id }: { id: number[] }): Promise<UserEntity[]> {
		const findUser = await this.userService.findByIdMany(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	}

	@Get('/allInfoById/:id')
	async findAllInfoById(@Param('id') id: number | string): Promise<UserAllInfoEntity> {
		const findUser = await this.userService.findAllInfoById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	}

	@Get('/parentByChildId/:id')
	async findParentByChildId(@Param('id') id: number): Promise<UserEntity[]> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.userService.findParentByChildId(id);
	}

	@Get('/byUsername/:username')
	async findByUsername(@Param('username') username: string): Promise<UserEntity> {
		const findUser = await this.userService.findByUsername(username);
		if (!findUser) throw new HttpException(UserConstants.ERROR_USERNAME_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	}

	@Get('/byPhone/:phone')
	async findByPhone(@Param('phone') phone: string): Promise<UserEntity> {
		const findUserWithVoip = await this.userService.findByVoip(phone);
		const findUserWithMobile = await this.userService.findByMobile(phone);
		if (!findUserWithVoip && !findUserWithMobile)
			throw new HttpException(UserConstants.ERROR_VOIP_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUserWithVoip || findUserWithMobile;
	}

	@Get('/byVoip/:voip')
	async findByVoip(@Param('voip') voip: string): Promise<UserEntity> {
		const findUser = await this.userService.findByVoip(voip);
		if (!findUser) throw new HttpException(UserConstants.ERROR_VOIP_NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	}

	@Get('/byRole/:role')
	async findByRole(@Param('role') role: string): Promise<UserEntity[]> {
		return await this.userService.findByRole(role);
	}

	@Get('/myTeamUsersId/:userId')
	async findMyTeamUsersId(@Param('userId') userId: number | string): Promise<number[]> {
		await this.findById(userId);
		return await this.userService.findMyTeamUsersId(userId);
	}

	@Get('/findDidComeToday')
	async findDidComeToday(): Promise<UserEntity[] | null> {
		return await this.userService.findDidComeToday();
	}

	@Get('/count')
	async countActive(): Promise<number> {
		return await this.userService.count();
	}

	@Get('/count/all')
	async countAllActive(): Promise<UserCountAllEntity> {
		const result: UserCountAllEntity = {
			all: 0,
			sex: {
				male: 0,
				female: 0,
			},
			territory: [],
			department: [],
		};

		result.all = await this.userService.count();
		result.sex.male = await this.userService.count({ sex: 'male' });
		result.sex.female = await this.userService.count({ sex: 'female' });

		const territoryList = await this.userTerritoryService.findAll();
		const territoryResult = await Promise.all(
			territoryList.map(async (territory) => ({
				name: territory.name,
				count: await this.userService.count({ territoryId: territory.id }),
			}))
		);
		result.territory.push(...territoryResult);

		const departmentList = await this.userTerritoryService.findAll();
		const departmentResult = await Promise.all(
			departmentList.map(async (department) => ({
				name: department.name,
				count: await this.userService.count({ departmentId: department.id }),
			}))
		);
		result.department.push(...departmentResult);

		return result;
	}

	@Get('/count/sex/:sex')
	async countSex(@Param('sex') sex: 'male' | 'female'): Promise<number> {
		return await this.userService.count({ sex });
	}

	@Get('/count/department/:departmentId')
	async countDepartment(@Param('departmentId') departmentId: number | string): Promise<number> {
		return await this.userService.count({ departmentId: Number(departmentId) });
	}

	@Get('/count/territory/:territoryId')
	async countTerritory(@Param('territoryId') territoryId: number | string): Promise<number> {
		return await this.userService.count({ territoryId: Number(territoryId) });
	}

	@Get('/birthday/upcoming')
	async getBirthdayUpcoming(): Promise<UserEntity[]> {
		return await this.userService.getBirthdayUpcoming(3);
	}

	@Get('/birthday/upcoming/:count')
	async getBirthdayUpcomingCount(@Param('count') count: number | string): Promise<UserEntity[]> {
		return await this.userService.getBirthdayUpcoming(Number(count));
	}

	@Get('/birthday/today')
	async getBirthdayToday(): Promise<UserEntity[]> {
		return await this.userService.getBirthdayToday();
	}

	@Get('/findEmployeeTo1C')
	async findEmployeeTo1C(): Promise<IUserTo1CEntity[]> {
		return await this.userService.findEmployeeTo1C();
	}

	@Get('/elastic/byId/:id')
	@Access('user')
	@UseGuards(AccessGuard)
	async elasticGetById(@Param('id') id: number | string) {
		return await this.userService.searchElasticById(id);
	}
}
