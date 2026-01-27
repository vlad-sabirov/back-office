import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CreateUserRoleInput } from './dto/create-user-role.input';
import { UpdateUserRoleInput } from './dto/update-user-role.input';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserRoleConstants } from './user-role.constants';
import { UserRoleService } from './user-role.service';

@Controller('user-role')
export class UserRoleController {
	constructor(private readonly userRoleService: UserRoleService) {}

	@Post('/')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateUserRoleInput): Promise<UserRoleEntity> {
		const { roleDto } = dto;
		const findRole = await this.userRoleService.findByAlias(roleDto.alias);
		if (findRole) throw new HttpException(UserRoleConstants.ERROR_ALIAS_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userRoleService.create(dto);
	}

	@Get('/')
	async findAll(): Promise<UserRoleEntity[] | null> {
		return await this.userRoleService.findAll();
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number): Promise<UserRoleEntity> {
		const findRole = await this.userRoleService.findById(id);
		if (!findRole) throw new HttpException(UserRoleConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		return findRole;
	}

	@Get('/byAlias/:alias')
	// @Access('user')
	// @UseGuards(AccessGuard)
	async findByAlias(@Param('alias') alias: string): Promise<UserRoleEntity> {
		const findRole = await this.userRoleService.findByAlias(alias);
		if (!findRole) throw new HttpException(UserRoleConstants.ERROR_ALIAS_NOTFOUND, HttpStatus.NOT_FOUND);

		return findRole;
	}

	@Patch('/byId/:id')
	@UsePipes(new ValidationPipe())
	async updateById(@Param('id') id: number, @Body() dto: UpdateUserRoleInput): Promise<UserRoleEntity> {
		const findRole = await this.userRoleService.findById(id);
		if (!findRole) throw new HttpException(UserRoleConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		const findDuplicate = await this.userRoleService.findByAlias(dto.roleDto.alias);
		if (findDuplicate && findDuplicate.id !== findRole.id)
			throw new HttpException(UserRoleConstants.ERROR_ALIAS_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userRoleService.updateById(id, dto);
	}

	@Patch('staffByRoleId/:roleId')
	async updateRoleStaff(@Param('roleId') roleId: number | string, @Body() dto: number[]) {
		const findRole = await this.userRoleService.findById(Number(roleId));
		if (!findRole) throw new HttpException(UserRoleConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		return await this.userRoleService.updateRoleStaff(roleId, dto);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number): Promise<UserRoleEntity> {
		const findRole = await this.userRoleService.findById(id);
		if (!findRole) throw new HttpException(UserRoleConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		return await this.userRoleService.deleteById(id);
	}
}
