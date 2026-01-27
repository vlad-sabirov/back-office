import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { CreateCommentLogisticVedDto } from '../dto/create-comment.dto';
import { UpdateCommentLogisticVedDto } from '../dto/update-comment.dto';
import { LogisticVedCommentEntity } from '../entity/logistic-ved-comment.entity';

@Injectable()
export class LogisticVedCommentService extends PrismaService {
	create = async (dto: CreateCommentLogisticVedDto): Promise<LogisticVedCommentEntity> => {
		return await this.logisticVedComment.create({ data: dto });
	};

	findAll = async (): Promise<LogisticVedCommentEntity[]> => {
		return await this.logisticVedComment.findMany({
			include: { order: true, author: true },
		});
	};

	findById = async (id: number): Promise<LogisticVedCommentEntity> => {
		return await this.logisticVedComment.findUnique({
			where: { id: Number(id) },
			include: { order: true, author: true },
		});
	};

	findByAuthorId = async (authorId: number): Promise<LogisticVedCommentEntity[]> => {
		return await this.logisticVedComment.findMany({
			where: { authorId: Number(authorId) },
			include: { order: true },
		});
	};

	findByOrderId = async (orderId: number): Promise<LogisticVedCommentEntity[]> => {
		return await this.logisticVedComment.findMany({
			where: { orderId: Number(orderId) },
			include: { order: true },
		});
	};

	findByComment = async (comment: string): Promise<LogisticVedCommentEntity> => {
		return await this.logisticVedComment.findFirst({
			where: { comment: comment },
		});
	};

	updateById = async (id: number, dto: UpdateCommentLogisticVedDto): Promise<LogisticVedCommentEntity> => {
		return await this.logisticVedComment.update({
			where: { id: Number(id) },
			data: dto,
		});
	};

	deleteById = async (id: number): Promise<LogisticVedCommentEntity> => {
		return await this.logisticVedComment.delete({ where: { id: Number(id) } });
	};
}
