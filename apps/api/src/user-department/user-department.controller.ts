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
import { isArray } from 'class-validator';
import { CreateUserDepartmentDto } from './dto/create-department.dto';
import { ResortDepartmentDto } from './dto/resort-department.dto';
import { UpdateUserDepartmentDto } from './dto/update-department.dto';
import { UserDepartmentEntity } from './entity/user-department.entity';
import { UserDepartmentConstants } from './user-department.constants';
import { UserDepartmentService } from './user-department.service';

@Controller('user-department')
export class UserDepartmentController {
	constructor(private readonly userDepartmentService: UserDepartmentService) {}

	@Post('')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateUserDepartmentDto): Promise<UserDepartmentEntity> {
		const { departmentDto } = dto;

		const findDepartment = await this.userDepartmentService.findByName(departmentDto.name);
		if (findDepartment) throw new HttpException(UserDepartmentConstants.ERROR_NAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userDepartmentService.create(dto);
	}

	@Get('')
	async findAll(): Promise<UserDepartmentEntity[]> {
		return await this.userDepartmentService.findAll();
	}

	@Get('/withDeepFilter')
	async findAllWithDeepFilter(): Promise<UserDepartmentEntity[]> {
		return await this.userDepartmentService.findAll(true);
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number): Promise<UserDepartmentEntity> {
		const findDepartment = await this.userDepartmentService.findById(id);
		if (!findDepartment) throw new HttpException(UserDepartmentConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findDepartment;
	}

	@Get('/byChildId/:childId')
	async findByChildId(@Param('childId') childId: number): Promise<UserDepartmentEntity[]> {
		const findParentDepartment = await this.userDepartmentService.findParentByChildId(childId);

		if (!findParentDepartment.length)
			throw new HttpException(UserDepartmentConstants.ERROR_CHILD_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findParentDepartment;
	}

	@Get('/byName/:name')
	async findByName(@Param('name') name: string): Promise<UserDepartmentEntity> {
		const findDepartment = await this.userDepartmentService.findByName(name);
		if (!findDepartment) throw new HttpException(UserDepartmentConstants.ERROR_NAME_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findDepartment;
	}

	@Patch('/byId/:id')
	@UsePipes(new ValidationPipe())
	async updateById(@Body() dto: UpdateUserDepartmentDto, @Param('id') id: number): Promise<UserDepartmentEntity> {
		const { child, ...data } = dto.departmentDto;

		if (!child) null;
		const findDepartment = await this.findById(id);
		if (!findDepartment) throw new HttpException(UserDepartmentConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		const findDuplicate = await this.userDepartmentService.findByName(data.name);
		if (findDuplicate && findDuplicate.id !== findDepartment.id)
			throw new HttpException(UserDepartmentConstants.ERROR_NAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userDepartmentService.updateById(dto, id);
	}

	@Patch('/resort')
	@UsePipes(new ValidationPipe())
	async resortDepartment(@Body() dto: ResortDepartmentDto[]): Promise<void> {
		if (!isArray(dto))
			throw new HttpException(
				UserDepartmentConstants.ERROR_RESORT_DEPARTMENT_DTO_IS_NOT_ARRAY,
				HttpStatus.BAD_REQUEST
			);

		await this.userDepartmentService.resortDepartment(dto);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number): Promise<UserDepartmentEntity> {
		const findDepartment = await this.findById(id);
		if (!findDepartment) throw new HttpException(UserDepartmentConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.userDepartmentService.deleteById(id);
	}
}
