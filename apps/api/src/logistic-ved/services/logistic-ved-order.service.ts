import { Injectable } from '@nestjs/common';
import { isArray } from 'lodash';
import { PrismaService } from '../../common';
import { CreateOrderLogisticVedDto } from '../dto/create-order.dto';
import { UpdateOrderLogisticVedDto } from '../dto/update-order.dto';
import { LogisticVedOrderEntity } from '../entity/logistic-ved-order.entity';
import { LogisticVedStageService } from './logistic-ved-stage.service';

@Injectable()
export class LogisticVedOrderService extends PrismaService {
	constructor(private readonly logisticVedStageService: LogisticVedStageService) {
		super();
	}

	create = async (dto: CreateOrderLogisticVedDto): Promise<LogisticVedOrderEntity> => {
		const findLastPosition = await this.findLastPosition();
		const findFirstStagePosition = await this.logisticVedStageService.findFirstPosition();

		return await this.logisticVedOrder.create({
			data: {
				...dto,
				position: findLastPosition ? findLastPosition.position + 1 : 0,
				stageId: findFirstStagePosition.id,
			},
		});
	};

	findAll = async (): Promise<LogisticVedOrderEntity[]> => {
		return await this.logisticVedOrder.findMany({
			orderBy: { position: 'asc' },
			include: {
				author: true,
				performer: true,
				stage: true,
				comments: true,
				history: true,
			},
		});
	};

	findActive = async (
		userId?: number | string | number[] | string[],
		include?: { [key: string]: any }
	): Promise<LogisticVedOrderEntity[]> => {
		const findId = userId
			? isArray(userId)
				? []
				: [{ authorId: Number(userId) }, { performerId: Number(userId) }]
			: undefined;

		if (isArray(userId))
			userId.forEach((id) => {
				findId.push({ authorId: Number(id) });
				findId.push({ performerId: Number(id) });
			});

		return await this.logisticVedOrder.findMany({
			where: {
				isClose: false,
				isDone: false,
				OR: findId,
			},
			orderBy: { updatedAt: 'desc' },
			include: include
				? include
				: {
						author: true,
						performer: true,
						stage: { include: { actionExpected: true } },
						comments: true,
						history: true,
				  },
		});
	};

	findActiveWithRole = async (role?: string, include?: { [key: string]: any }): Promise<LogisticVedOrderEntity[]> => {
		return await this.logisticVedOrder.findMany({
			where: {
				isClose: false,
				isDone: false,
				stage: role !== 'logisticVedOrdersAuthor' ? { actionExpected: { alias: role } } : undefined,
				isModification: role !== 'logisticVedOrdersAuthor' ? false : undefined,
			},
			orderBy: { updatedAt: 'desc' },
			include: include
				? include
				: {
						author: true,
						performer: true,
						stage: { include: { actionExpected: true } },
						comments: true,
						history: true,
				  },
		});
	};

	findById = async (id: number | string): Promise<LogisticVedOrderEntity> => {
		return await this.logisticVedOrder.findUnique({
			where: { id: Number(id) },
			include: {
				author: true,
				performer: true,
				stage: true,
				comments: { orderBy: { createdAt: 'desc' }, include: { author: true } },
				history: { orderBy: { createdAt: 'desc' }, include: { author: true } },
				file: { include: { author: true }, orderBy: { createdAt: 'desc' } },
			},
		});
	};

	findByName = async (name: string): Promise<LogisticVedOrderEntity> => {
		return await this.logisticVedOrder.findFirst({ where: { name } });
	};

	findFirstPosition = async (): Promise<LogisticVedOrderEntity> => {
		return await this.logisticVedOrder.findFirst({
			orderBy: { position: 'asc' },
		});
	};

	findLastPosition = async (): Promise<LogisticVedOrderEntity> => {
		return await this.logisticVedOrder.findFirst({
			orderBy: { position: 'desc' },
		});
	};

	updateById = async (id: number | string, dto: UpdateOrderLogisticVedDto): Promise<LogisticVedOrderEntity> => {
		return await this.logisticVedOrder.update({
			where: { id: Number(id) },
			data: {
				...dto,
				authorId: dto.authorId ? Number(dto.authorId) : undefined,
				performerId: dto.performerId ? Number(dto.performerId) : undefined,
				stageId: dto.stageId ? Number(dto.stageId) : undefined,
				position: dto.position ? Number(dto.position) : undefined,
			},
		});
	};

	deleteById = async (id: number | string): Promise<LogisticVedOrderEntity> => {
		return await this.logisticVedOrder.delete({ where: { id: Number(id) } });
	};
}
