import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaFilter } from 'src/helpers';
import { PrismaService } from '../../common';
import { LatenessCommentsConstants } from '../constants/lateness-comments.constants';
import { CreateLatenessCommentDto, FindLatenessCommentDto, UpdateLatenessCommentDto } from '../dto';
import { LatenessCommentEntity } from '../entity';
import { LatenessCommentParser } from '../utils';

@Injectable()
export class LatenessCommentService extends PrismaService {
	create = async ({ createDto }: { createDto: CreateLatenessCommentDto }): Promise<LatenessCommentEntity> => {
		const data = await LatenessCommentParser.create(createDto);
		await this.throwDuplicateError({ userId: data.userId, latenessId: data.latenessId });
		return await this.authLatenessComment.create({ data });
	};

	findById = async (id: number | string): Promise<LatenessCommentEntity> => {
		return await this.authLatenessComment.findUnique({ where: { id: Number(id) } });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: FindLatenessCommentDto;
		filter?: PrismaFilter<Omit<LatenessCommentEntity, 'user' | 'lateness'>>;
		include?: Record<string, boolean>;
	}): Promise<LatenessCommentEntity> => {
		const parsedWhere = await LatenessCommentParser.where(where);
		return await this.authLatenessComment.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: FindLatenessCommentDto;
		filter?: PrismaFilter<Omit<LatenessCommentEntity, 'user' | 'lateness'>>;
		include?: Record<string, boolean>;
	}): Promise<LatenessCommentEntity[]> => {
		const parsedWhere = await LatenessCommentParser.where(where);
		return await this.authLatenessComment.findMany({ where: parsedWhere, include, ...filter });
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: UpdateLatenessCommentDto;
	}): Promise<LatenessCommentEntity> => {
		const data = await LatenessCommentParser.update(updateDto);

		await this.throwNotFoundError({ id });
		const findComment = await this.findById(id);
		await this.throwDuplicateError({
			NOT: [{ id: id }],
			userId: findComment.userId,
			latenessId: findComment.latenessId,
		});

		return await this.authLatenessComment.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<LatenessCommentEntity> => {
		await this.throwNotFoundError({ id });
		return await this.authLatenessComment.delete({ where: { id: Number(id) } });
	};

	private throwNotFoundError = async (where: FindLatenessCommentDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(LatenessCommentsConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async (where: FindLatenessCommentDto): Promise<void> => {
		const parsedWhere = await LatenessCommentParser.where(where);
		const findDuplicate = await this.findOnce({ where: parsedWhere });
		if (findDuplicate) throw new HttpException(LatenessCommentsConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};
}
