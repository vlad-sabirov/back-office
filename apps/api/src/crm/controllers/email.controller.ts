import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { MutationEmailDto, QueryEmailDto } from '../dto';
import { EmailEntity } from '../entity';
import { EmailService } from '../services';
import { PrismaFilter } from '../../helpers';

@Controller('crm/email')
export class EmailController {
	constructor(private readonly emailService: EmailService) {}

	@Post()
	async create(
		@Body() createDto: MutationEmailDto,
	): Promise<EmailEntity> {
		return await this.emailService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<EmailEntity> {
		return await this.emailService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryEmailDto,
		@Body('filter') filter?: PrismaFilter<Omit<EmailEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<EmailEntity> {
		return await this.emailService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryEmailDto,
		@Body('filter') filter?: PrismaFilter<Omit<EmailEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<EmailEntity[]> {
		return await this.emailService.findMany({ where, filter, include });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<EmailEntity> {
		return await this.emailService.deleteById(id);
	}
}
