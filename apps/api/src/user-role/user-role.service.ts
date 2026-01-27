import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../common';
import { CreateUserRoleInput } from './dto/create-user-role.input';
import { UpdateUserRoleInput } from './dto/update-user-role.input';
import { UserRoleEntity } from './entities/user-role.entity';

@Injectable()
export class UserRoleService extends PrismaService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {
		super();
	}

	public async create(dto: CreateUserRoleInput): Promise<UserRoleEntity> {
		return await this.userRole.create({ data: dto.roleDto });
	}

	public async findAll(): Promise<UserRoleEntity[] | null> {
		return await this.userRole.findMany({
			orderBy: { alias: 'asc' },
			include: { users: { where: { isFired: false } } },
		});
	}

	public async findById(id: number): Promise<UserRoleEntity | null> {
		return await this.userRole.findUnique({ where: { id: Number(id) } });
	}

	public async findByAlias(alias: string): Promise<UserRoleEntity | null> {
		return await this.userRole.findUnique({ where: { alias: String(alias) } });
	}

	public async updateById(id: number, dto: UpdateUserRoleInput): Promise<UserRoleEntity> {
		const { roleDto } = dto;
		if (roleDto) await this.updateRoleInfo(id, roleDto);
		return await this.findById(id);
	}

	public async filterExistingById(roles: number[]): Promise<number[]> {
		const filterRoles = await this.userRole.findMany({
			where: {
				OR: roles.map((roleId) => ({ id: Number(roleId) })),
			},
		});
		return filterRoles.map((role) => role.id);
	}

	private async updateRoleInfo(id: number, dto: UserRoleEntity): Promise<void> {
		await this.userRole.update({ where: { id: Number(id) }, data: dto });
	}

	updateRoleStaff = async (roleId: number | string, usersId: number[]) => {
		const allUsers = await this.userService.findEverything();
		const userWithRole = [];
		const userWithoutRole = [];

		if (allUsers) {
			for (const user of allUsers) {
				if (usersId && usersId.includes(user.id)) {
					if (user.roles.some((role) => role.id == roleId)) continue;
					userWithRole.push({ id: user.id });
				} else {
					userWithoutRole.push({ id: user.id });
				}
			}

			return await this.userRole.update({
				where: { id: Number(roleId) },
				data: {
					users: {
						connect: userWithRole,
						disconnect: userWithoutRole,
					},
				},
			});
		}
	};

	public async deleteById(id: number): Promise<UserRoleEntity> {
		return await this.userRole.delete({ where: { id: Number(id) } });
	}
}
