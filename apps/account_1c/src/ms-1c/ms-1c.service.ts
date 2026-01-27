import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService, IHttpReject } from '../http';
import { CONFIG_1C, URL_1C } from '../app.constants';
import { IPingEntity } from './entities/ping.entity';
import { ITeamEntity } from './entities/team.entity';
import { IEmployeeEntity } from './entities/empolee.entity';
import { IRealizationEntity } from './entities/realization.entity';
import { IRealizationDto } from './dto/realization.dto';
import { IGetLastUpdateDto } from './dto/get-last-update.dto';
import { ILastUpdateEntity } from './entities/last-update.entity';

const config1C = {
	auth: {
		username: CONFIG_1C.AUTH.USERNAME,
		password: CONFIG_1C.AUTH.PASSWORD,
	},
};

@Injectable()
export class Ms1cService implements OnModuleInit {
	private readonly logger = new Logger('MicroService | 1C');

	constructor(private readonly httpService: HttpService) {}
	onModuleInit(): void {
		this.logger.log('Initialized');
	}

	ping = async (): Promise<IPingEntity | IHttpReject> => {
		return await this.httpService.get<IPingEntity>(
			`${URL_1C}/ping`,
			config1C,
		);
	};

	getTeams = async (): Promise<ITeamEntity | IHttpReject> => {
		return await this.httpService.post<ITeamEntity>(
			`${URL_1C}/team`,
			{},
			config1C,
		);
	};

	getEmployees = async (): Promise<IEmployeeEntity | IHttpReject> => {
		return await this.httpService.post<IEmployeeEntity>(
			`${URL_1C}/employee`,
			{},
			config1C,
		);
	};

	getRealization = async (
		dto: IRealizationDto,
	): Promise<IRealizationEntity | IHttpReject> => {
		return await this.httpService.post<IRealizationEntity>(
			`${URL_1C}/realization`,
			dto,
			config1C,
		);
	};

	getLastUpdate = async (
		dto: IGetLastUpdateDto,
	): Promise<ILastUpdateEntity | IHttpReject> => {
		return await this.httpService.post<ILastUpdateEntity>(
			`${URL_1C}/costumer_last_update`,
			{
				...dto,
				customer: undefined,
				customer_code: dto.customer_code?.map((code1c) => code1c),
			},
			config1C,
		);
	};
}
