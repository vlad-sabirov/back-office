import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Ms1cService } from '../ms-1c/ms-1c.service';
import { MsCrmService } from '../ms-crm/ms-crm.service';
import { ILastActionByOrganizationIdDto } from './dto/last-action-by-organization-id.dto';
import { formatISO, parseISO } from 'date-fns';
import { delay } from '../utils';

@Injectable()
export class LastActionService {
	private readonly logger = new Logger('LastActionService');

	constructor(
		private readonly ms1cService: Ms1cService,
		private readonly msCrmService: MsCrmService,
	) {}
	onModuleInit(): void {
		this.logger.log('Initialized');
	}

	lastActionFrom1C = async ({
		organizationId,
	}: ILastActionByOrganizationIdDto): Promise<void> => {
		if (!organizationId) {
			return;
		}
		const foundOrganization = await this.msCrmService.getOrganizationById(
			organizationId,
		);
		if ('message' in foundOrganization) {
			this.logger.debug('Не удалось найти организацию', organizationId);
			return;
		}

		const dtoCustomer: string[] = [];
		const dtoCustomerCode: string[] = [];

		foundOrganization.requisites.forEach((r) => {
			if (!!r.inn) {
				dtoCustomer.push(String(r.inn));
			}
			if (!!r.code1c) {
				dtoCustomerCode.push(r.code1c);
			}
		});

		const lastUpdateFetch = await this.ms1cService.getLastUpdate({
			// customer: dtoCustomer.length ? dtoCustomer : undefined,
			customer_code: dtoCustomerCode.length ? dtoCustomerCode : undefined,
		});
		const lastUpdate =
			!('data' in lastUpdateFetch) || !lastUpdateFetch.data?.[0]?.timestamp
				? formatISO(new Date('1990-08-19'))
				: formatISO(parseISO(lastUpdateFetch.data[0].timestamp));
		const update = await this.msCrmService.updateOrganizationLastUpdate({
			organizationId,
			lastUpdate,
		});

		if ('status' in update && process.env.NODE_ENV === 'development') {
			this.logger.debug(
				'Не удалось обновить данные организации',
				organizationId,
			);
		}
	};

	lastActionFrom1CAll = async (): Promise<void> => {
		const foundOrganizations = await this.msCrmService.getAllOrganizations();
		if ('status' in foundOrganizations) {
			throw new HttpException(
				'Организации не найдены',
				HttpStatus.NOT_FOUND,
			);
		}
		let i = 0;
		for (const org of foundOrganizations) {
			i++;
			await delay(process.env.NODE_ENV === 'development' ? 100 : 1000);
			await this.lastActionFrom1C(org);
			if (process.env.NODE_ENV === 'development') {
				this.logger.debug(`${i}/${foundOrganizations.length}`);
			}
		}
	};
}
