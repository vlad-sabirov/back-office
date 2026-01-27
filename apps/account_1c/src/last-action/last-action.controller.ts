import { Controller, Get, Query } from '@nestjs/common';
import { IPingEntity } from '../entities/ping.entity';
import { LastActionService } from './last-action.service';
import { ILastActionByOrganizationIdDto } from './dto/last-action-by-organization-id.dto';

@Controller('last-action')
export class LastActionController {
	constructor(private readonly lastActionService: LastActionService) {}

	@Get('ping')
	async ping(): Promise<IPingEntity> {
		return {
			code: 200,
			status: 'success',
			data: 'pong',
		};
	}

	@Get('byOrganizationId')
	async lastActionFrom1C(
		@Query() dto: ILastActionByOrganizationIdDto,
	): Promise<any> {
		return this.lastActionService.lastActionFrom1C({
			organizationId: dto.organizationId,
		});
	}

	@Get('all')
	async lastActionFrom1CAll(): Promise<void> {
		return this.lastActionService.lastActionFrom1CAll();
	}
}
