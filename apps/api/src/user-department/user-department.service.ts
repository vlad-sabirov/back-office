import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../common';
import { CreateUserDepartmentDto } from './dto/create-department.dto';
import { ResortDepartmentDto } from './dto/resort-department.dto';
import { UpdateUserDepartmentDto } from './dto/update-department.dto';
import { UserDepartmentEntity } from './entity/user-department.entity';
import { UserDepartmentConstants } from './user-department.constants';

@Injectable()
export class UserDepartmentService extends PrismaService {
	sqlIncludes;

	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {
		super();
		this.sqlIncludes = {
			child: {
				where: { isHide: false },
				orderBy: { position: 'asc' },
				include: {
					users: { where: { isFired: false }, orderBy: { position: 'asc' } },
				},
			},
			users: { where: { isFired: false }, orderBy: { position: 'asc' } },
		};
	}

	public async create(dto: CreateUserDepartmentDto): Promise<UserDepartmentEntity> {
		const { parent, child, ...data } = dto.departmentDto;
		const position = (await this.findLastPosition()) + 1;
		const createdDepartment = await this.userDepartment.create({
			data: { ...data, position },
		});

		if (parent) await this.updateParentByChildId(parent, createdDepartment.id);
		if (child) false;

		return await this.findById(createdDepartment.id);
	}

	public async findAll(filterDeep = false): Promise<UserDepartmentEntity[]> {
		const findDepartment: UserDepartmentEntity[] = await this.userDepartment.findMany({
			orderBy: { position: 'asc' },
			include: this.sqlIncludes,
		});

		// Фильтрация родителей
		if (filterDeep) {
			const ignoreId: number[] = [];
			findDepartment.map((parent) => {
				if (parent.child)
					parent.child.map((child) => {
						ignoreId.push(child.id);
					});
			});
			return findDepartment.filter((parent) => !ignoreId.includes(parent.id));
		}

		return findDepartment;
	}

	public findFirst = async (ignoreId?: number): Promise<UserDepartmentEntity> => {
		return await this.userDepartment.findFirst({
			where: {
				NOT: [{ name: 'Руководство' }, ignoreId ? { id: Number(ignoreId) } : undefined],
			},
			orderBy: { position: 'asc' },
		});
	};

	public async findById(id: number): Promise<UserDepartmentEntity> {
		return await this.userDepartment.findUnique({
			where: { id: Number(id) },
			include: this.sqlIncludes,
		});
	}

	public async findByName(name: string): Promise<UserDepartmentEntity> {
		return await this.userDepartment.findUnique({
			where: { name: String(name) },
			include: this.sqlIncludes,
		});
	}

	public async findParentByChildId(childId: number): Promise<UserDepartmentEntity[]> {
		return await this.userDepartment.findMany({
			where: {
				child: { some: { id: Number(childId) } },
			},
			include: this.sqlIncludes,
		});
	}

	private async findLastPosition(): Promise<number> {
		const findDepartment = await this.userDepartment.findFirst({
			orderBy: { position: 'desc' },
		});

		if (findDepartment) return findDepartment.position;
		return 0;
	}

	public async updateById(dto: UpdateUserDepartmentDto, id: number): Promise<UserDepartmentEntity> {
		const { parent, child, ...data } = dto.departmentDto;
		const updatedDepartment = await this.userDepartment.update({
			where: { id: Number(id) },
			data,
		});

		if (parent) await this.updateParentByChildId(parent, updatedDepartment.id);
		if (child) false;

		return this.findById(updatedDepartment.id);
	}

	public async resortDepartment(dto: ResortDepartmentDto[]): Promise<void> {
		dto?.map(
			async (department) =>
				await this.userDepartment.update({
					where: { id: Number(department.id) },
					data: {
						position: department.position,
					},
				})
		);
	}

	private async updateChildByParentId(parentId: number, child: number[]): Promise<void> {
		await this.userDepartment.update({
			where: { id: Number(parentId) },
			data: {
				child: {
					set: [],
					connect: child.map((childId) => ({ id: childId })),
				},
			},
		});
	}

	private async updateParentByChildId(parentId: number, childId: number): Promise<void> {
		// Удаляет childId у всех родителей
		const findOldParent = await this.findParentByChildId(childId);
		findOldParent.map(async (parent) => {
			const filterChild = parent.child.filter((child) => child.id !== childId).map((child) => child.id);
			await this.updateChildByParentId(parent.id, filterChild);
		});

		// Добавляет childId для нового родителя
		const findNewParent = await this.findById(parentId);
		const filerChild = findNewParent.child.map((child) => child.id);
		filerChild.push(childId);
		await this.updateChildByParentId(parentId, filerChild);
	}

	public updateDepartmentUsers = async (): Promise<boolean> => {
		const findDepartment = await this.userDepartment.findMany({
			where: { isHide: false },
		});
		if (!findDepartment.length) return false;

		for (const department of findDepartment) {
			const staffCount = await this.user.count({
				where: { departmentId: Number(department.id), isFired: false },
			});

			await this.userDepartment.update({
				where: { id: Number(department.id) },
				data: { staffCount: Number(staffCount) },
			});
		}

		return true;
	};

	public async deleteById(id: number): Promise<UserDepartmentEntity> {
		const findUsers = await this.userService.findByDepartmentId(id);
		const firstDepartment = await this.findFirst(id);

		if (!firstDepartment)
			throw new HttpException(UserDepartmentConstants.ERROR_IT_IS_LAST_DEPARTMENT, HttpStatus.BAD_REQUEST);

		findUsers.map(async (user) => await this.userService.updateUserDepartment(user.id, firstDepartment.id));

		return await this.userDepartment.delete({ where: { id: Number(id) } });
	}
}
