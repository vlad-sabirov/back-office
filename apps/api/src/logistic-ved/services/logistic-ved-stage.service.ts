import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isArray } from 'lodash';
import { PrismaService } from '../../common';
import { LogisticVedStageConstants } from '../constants/logistic-ved-stage.constants';
import { CreateStageLogisticVedDto } from '../dto/create-stage.dto';
import { FindStageWithOrderOptions } from '../dto/find-stage-with-order-options';
import { ResortStageLogisticVedDto } from '../dto/resort-stage.dto';
import { UpdateStageLogisticVedDto } from '../dto/update-stage.dto';
import { LogisticVedStageEntity } from '../entity/logistic-ved-stage.entity';

@Injectable()
export class LogisticVedStageService extends PrismaService {
	constructor() {
		super();
	}

	create = async (dto: CreateStageLogisticVedDto): Promise<LogisticVedStageEntity> => {
		if (dto.position === 0 || !dto.position) {
			const findLastStage = await this.findLastPosition();
			if (findLastStage) dto.position = findLastStage.position + 1;
		}
		return await this.logisticVedStage.create({ data: dto });
	};

	findAll = async (): Promise<LogisticVedStageEntity[]> => {
		return await this.logisticVedStage.findMany({
			orderBy: { position: 'asc' },
			include: {
				orders: {
					orderBy: { updatedAt: 'desc' },
					include: { comments: true, author: true, performer: true },
				},
			},
		});
	};

	findWithOrderOptions = async ({
		userId,
		isClose,
		isDone,
	}: FindStageWithOrderOptions): Promise<LogisticVedStageEntity[]> => {
		return await this.logisticVedStage.findMany({
			orderBy: { position: 'asc' },
			include: {
				orders: {
					where: {
						isClose: isClose || false,
						isDone: isDone || false,
						OR: userId
							? isArray(userId)
								? userId.map((id) => ({
										authorId: Number(id),
								  }))
								: [{ authorId: !!userId ? Number(userId) : undefined }]
							: undefined,
					},
					orderBy: { updatedAt: 'desc' },
					include: { comments: true, author: true, performer: true },
				},
			},
		});
	};

	findById = async (id: number | string): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.findUnique({
			where: { id: Number(id) },
		});
	};

	findByAlias = async (alias: string): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.findUnique({
			where: { alias },
		});
	};

	findByName = async (name: string): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.findFirst({
			where: { name: name },
		});
	};

	findFirstPosition = async (): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.findFirst({
			orderBy: { position: 'asc' },
		});
	};

	findPrevPosition = async (id: number | string): Promise<LogisticVedStageEntity> => {
		const findStage = await this.findById(id);
		const findFirst = await this.findFirstPosition();
		if (findStage.id === findFirst.id)
			throw new HttpException(LogisticVedStageConstants.ERROR_POSITION_IS_FIRST, HttpStatus.BAD_REQUEST);

		return await this.logisticVedStage.findFirst({
			where: { position: { lt: findStage.position } },
			orderBy: { position: 'desc' },
		});
	};

	findNextPosition = async (id: number | string): Promise<LogisticVedStageEntity> => {
		const findStage = await this.findById(id);
		const findLast = await this.findLastPosition();
		if (findStage.id === findLast.id)
			throw new HttpException(LogisticVedStageConstants.ERROR_POSITION_IS_LAST, HttpStatus.BAD_REQUEST);

		return await this.logisticVedStage.findFirst({
			where: { position: { gt: findStage.position } },
			orderBy: { position: 'asc' },
		});
	};

	findLastPosition = async (): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.findFirst({
			orderBy: { position: 'desc' },
		});
	};

	updateById = async (id: number, dto: UpdateStageLogisticVedDto): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.update({
			where: { id: Number(id) },
			data: dto,
		});
	};

	resort = async (dto: ResortStageLogisticVedDto[]): Promise<void> => {
		if (dto && dto.length)
			dto.map(async (stage) => {
				await this.logisticVedStage.update({
					where: { id: Number(stage.id) },
					data: { position: Number(stage.position) },
				});
			});
	};

	deleteById = async (id: number): Promise<LogisticVedStageEntity> => {
		return await this.logisticVedStage.delete({ where: { id: Number(id) } });
	};
}
