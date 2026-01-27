import { Controller, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { Body, Param, Patch, Delete, Post } from '@nestjs/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { FindLatenessDto as FindLatenessDtoLateness } from 'src/auth/dto/find-lateness.dto';
import { LatenessEntity } from 'src/auth/entity/lateness.entity';
import { LatenessService } from 'src/auth/services/lateness.service';
import { PrismaFilter } from '../helpers';
import { UserDepartmentService } from '../user-department/user-department.service';
import { UserTerritoryService } from '../user-territory/user-territory.service';
import { CreateUserInput } from './dto/create-user.input';
import { FindLatenessDto } from './dto/find-lateness.dto';
import { UpdateUserInput } from './dto/update-user.input';
import { UserEntity } from './entities/user.entity';
import { UserConstants } from './user.constants';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly userTerritoryService: UserTerritoryService,
		private readonly userDepartmentService: UserDepartmentService,
		private readonly latenessService: LatenessService
	) {}

	@UsePipes(new ValidationPipe())
	@Post('/')
	async create(@Body() dto: CreateUserInput): Promise<UserEntity> {
		const findUser = await this.userService.findByUsername(dto.userDto.username);
		if (findUser) throw new HttpException(UserConstants.ERROR_USERNAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		const findVoipDuplicate = await this.userService.findByVoip(String(dto.userDto.phoneVoip));
		if (findVoipDuplicate) throw new HttpException(UserConstants.ERROR_VOIP_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userService.create(dto);
	}

	@Post('/latenessAll')
	async findLatenessAll(@Body() dto: FindLatenessDto): Promise<UserEntity[] | null> {
		return await this.userService.findLatenessAll(dto);
	}

	@Post('/latenessOnce')
	@HttpCode(200)
	async findLatenessOnce(
		@Body('where') where: FindLatenessDtoLateness,
		@Body('filter') filter?: PrismaFilter<LatenessEntity>,
		@Body('include') include?: Record<string, boolean>
	): Promise<LatenessEntity | null> {
		return await this.latenessService.findOnce({ where, filter, include });
	}

	@Patch('/byId/:id')
	@UsePipes(new ValidationPipe())
	async updateById(@Param('id') id: number, @Body() dto: UpdateUserInput): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (dto.userDto) {
			const findDuplicate = await this.userService.findByUsername(dto.userDto.username);
			if (findDuplicate && findDuplicate.id !== findUser.id)
				throw new HttpException(UserConstants.ERROR_USERNAME_DUPLICATE, HttpStatus.BAD_REQUEST);

			const findVoipDuplicate = await this.userService.findByVoip(String(dto.userDto.phoneVoip));
			if (findVoipDuplicate && findVoipDuplicate.id !== findUser.id)
				throw new HttpException(UserConstants.ERROR_VOIP_DUPLICATE, HttpStatus.BAD_REQUEST);
		}

		return await this.userService.updateById(id, dto);
	}

	@Patch('/updatePasswordByUserId/:id')
	@UsePipes(new ValidationPipe())
	async updatePasswordByUserId(@Param('id') id: number, @Body() { password }): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.userService.updatePasswordByUserId(id, password);
	}

	@Patch('/updateFiredByUserId/:id')
	@UsePipes(new ValidationPipe())
	async updateFiredByUserId(@Param('id') id: number): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.userService.updateFiredByUserId(id);
	}

	@Patch('/updateTerritoryByUserId/:id')
	@UsePipes(new ValidationPipe())
	async updateTerritoryByUserId(@Param('id') id: number, @Body() { territoryId }): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		const result = await this.userService.updateUserTerritory(id, territoryId);
		await this.userTerritoryService.updateTerritoryUsers();
		return result;
	}

	@Patch('/updateDepartmentByUserId/:id')
	@UsePipes(new ValidationPipe())
	async updateDepartmentByUserId(@Param('id') id: number, @Body() { departmentId }): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		const result = await this.userService.updateUserDepartment(id, departmentId);
		await this.userDepartmentService.updateDepartmentUsers();
		return result;
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number): Promise<UserEntity> {
		const findUser = await this.userService.findById(id);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.userService.deleteById(id);
	}
}
