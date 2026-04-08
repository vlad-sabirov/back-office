import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';

@Injectable()
export class NoteService extends PrismaService {
	create = async ({ text, organizationId, userId }: { text: string; organizationId: number; userId: number }) => {
		return this.crmNote.create({
			data: { text, organizationId, userId },
			include: { user: { select: { id: true, firstName: true, lastName: true, photo: true, color: true } } },
		});
	};

	findByOrganizationId = async (organizationId: number) => {
		return this.crmNote.findMany({
			where: { organizationId },
			include: { user: { select: { id: true, firstName: true, lastName: true, photo: true, color: true } } },
			orderBy: { createdAt: 'desc' },
		});
	};

	updateById = async ({ id, text, currentUserId }: { id: number; text: string; currentUserId: number }) => {
		const note = await this.crmNote.findUnique({ where: { id } });
		if (!note) throw new HttpException('Заметка не найдена', HttpStatus.NOT_FOUND);
		if (note.userId !== currentUserId) throw new HttpException('Можно редактировать только свои заметки', HttpStatus.FORBIDDEN);

		return this.crmNote.update({
			where: { id },
			data: { text },
			include: { user: { select: { id: true, firstName: true, lastName: true, photo: true, color: true } } },
		});
	};

	deleteById = async ({ id, currentUserId }: { id: number; currentUserId: number }) => {
		const note = await this.crmNote.findUnique({ where: { id } });
		if (!note) throw new HttpException('Заметка не найдена', HttpStatus.NOT_FOUND);
		if (note.userId !== currentUserId) throw new HttpException('Можно удалять только свои заметки', HttpStatus.FORBIDDEN);

		return this.crmNote.delete({ where: { id } });
	};

	getLastByOrganizationId = async (organizationId: number) => {
		return this.crmNote.findFirst({
			where: { organizationId },
			orderBy: { createdAt: 'desc' },
			include: { user: { select: { id: true, firstName: true, lastName: true } } },
		});
	};
}
