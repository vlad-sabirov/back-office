import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService, IHttpReject } from '../http';
import { URL_CRM } from '../app.constants';
import { IUserEntity } from './entities/user.entity';
import { IOrganizationInnEntity } from './entities/organization-inn.entity';
import { IOrganizationEntity } from './entities/organization.entity';
import { IUpdateOrganizationLast1CUpdate } from './dto/update-organization-last-1c-update.dto';

@Injectable()
export class MsCrmService implements OnModuleInit {
	private readonly logger = new Logger('MicroService | CRM');

	constructor(private readonly httpService: HttpService) {}
	onModuleInit(): void {
		this.logger.log('Initialized');
	}

	getUsers = async (): Promise<IUserEntity[] | IHttpReject> => {
		return await this.httpService.get<IUserEntity[]>(
			`${URL_CRM}/user/find/everything`,
		);
	};

	getTeamIdsWithUserId = async (
		userId: number,
	): Promise<number[] | IHttpReject> => {
		return await this.httpService.get<number[]>(
			`${URL_CRM}/user/find/myTeamUsersId/${userId}`,
		);
	};

	getAllOrganizations = async () => {
		return await this.httpService.get<IOrganizationInnEntity[]>(
			`${URL_CRM}/crm/organization/findInnWithUser`,
		);
	};

	getOrganizationAll = async () => {
		return await this.httpService.post<{ data: IOrganizationEntity[] }>(
			`${URL_CRM}/crm/organization/findMany`,
			{ where: { NOT: [{ userId: 0 }, { userId: 1 }] } },
		);
	};

	getOrganizationById = async (id: number | string) => {
		return await this.httpService.get<IOrganizationEntity>(
			`${URL_CRM}/crm/organization/byId/${id}`,
		);
	};

	getCountOrganizationsWithUserIds = async (userIds: number[]) => {
		return await this.httpService.post<number>(
			`${URL_CRM}/crm/organization/count/organizations`,
			{ userIds },
		);
	};

	updateOrganizationLastUpdate = async ({
		organizationId,
		lastUpdate,
	}: IUpdateOrganizationLast1CUpdate): Promise<any> => {
		return await this.httpService.patch<IOrganizationEntity>(
			`${URL_CRM}/crm/organization/byId/${organizationId}`,
			{ updateDto: { last1CUpdate: lastUpdate } },
		);
	};
}
