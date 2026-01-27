import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { CreateHistoryLogisticVedDto } from '../dto/create-history.dto';
import { LogisticVedHistoryEntity } from '../entity/logistic-ved-history.entity';

@Injectable()
export class LogisticVedHistoryService extends PrismaService {
	create = async (dto: CreateHistoryLogisticVedDto): Promise<LogisticVedHistoryEntity> => {
		return await this.logisticVedHistory.create({ data: dto });
	};

	findAll = async (): Promise<LogisticVedHistoryEntity[]> => {
		return await this.logisticVedHistory.findMany();
	};

	findById = async (id: number | string): Promise<LogisticVedHistoryEntity> => {
		return await this.logisticVedHistory.findUnique({
			where: { id: Number(id) },
		});
	};

	findByTitle = async (title: string): Promise<LogisticVedHistoryEntity> => {
		return await this.logisticVedHistory.findFirst({ where: { title } });
	};

	findByOrderId = async (orderId: number | string): Promise<LogisticVedHistoryEntity[]> => {
		return await this.logisticVedHistory.findMany({
			where: { orderId: Number(orderId) },
		});
	};

	deleteById = async (id: number | string): Promise<LogisticVedHistoryEntity> => {
		return await this.logisticVedHistory.delete({ where: { id: Number(id) } });
	};
}
