import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { CreateFileLogisticVedDto } from '../dto/create-file.dto';
import { LogisticVedFileEntity } from '../entity/logistic-ved-file.entity';

@Injectable()
export class LogisticVedFileService extends PrismaService {
	create = async (dto: Omit<CreateFileLogisticVedDto, 'url'> & { url: string }): Promise<LogisticVedFileEntity> => {
		return await this.logisticVedFile.create({
			data: {
				...dto,
				authorId: Number(dto.authorId),
				orderId: Number(dto.orderId),
			},
		});
	};

	findAll = async (): Promise<LogisticVedFileEntity[]> => {
		return await this.logisticVedFile.findMany();
	};

	findById = async (id: number | string): Promise<LogisticVedFileEntity> => {
		return await this.logisticVedFile.findUnique({ where: { id: Number(id) } });
	};

	findByType = async (type: string): Promise<LogisticVedFileEntity> => {
		return await this.logisticVedFile.findFirst({ where: { type } });
	};

	findByOrderId = async (orderId: number | string): Promise<LogisticVedFileEntity[]> => {
		return await this.logisticVedFile.findMany({
			where: { orderId: Number(orderId) },
		});
	};

	deleteById = async (id: number | string): Promise<LogisticVedFileEntity> => {
		return await this.logisticVedFile.delete({ where: { id: Number(id) } });
	};
}
