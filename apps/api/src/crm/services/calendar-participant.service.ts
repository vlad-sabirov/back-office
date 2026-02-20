import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common';
import { TelegramService } from '../../notification/services/telegram.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';

interface AddParticipantsDto {
	eventId: number;
	userIds: number[];
}

interface UpdateParticipantStatusDto {
	eventId: number;
	userId: number;
	status: 'accepted' | 'declined';
}

@Injectable()
export class CalendarParticipantService extends PrismaService {
	private readonly logger = new Logger(CalendarParticipantService.name);

	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	/**
	 * Добавить участников к событию
	 */
	addParticipants = async (dto: AddParticipantsDto, currentUserId: number): Promise<{ added: number }> => {
		const event = await this.calendarEvent.findUnique({
			where: { id: dto.eventId },
			include: { author: true, organization: true },
		});

		if (!event) {
			throw new HttpException('Событие не найдено', HttpStatus.NOT_FOUND);
		}

		// Проверка прав: только автор или admin может добавлять участников
		if (event.authorId !== currentUserId) {
			const user = await this.user.findUnique({
				where: { id: currentUserId },
				include: { roles: true },
			});
			if (!user?.roles?.some((role) => ['boss', 'admin', 'developer', 'crmAdmin'].includes(role.alias))) {
				throw new HttpException('Нет прав на добавление участников', HttpStatus.FORBIDDEN);
			}
		}

		let addedCount = 0;

		for (const userId of dto.userIds) {
			// Проверить, что участник ещё не добавлен
			const existing = await this.calendarEventParticipant.findUnique({
				where: {
					eventId_userId: { eventId: dto.eventId, userId },
				},
			});

			if (!existing) {
				await this.calendarEventParticipant.create({
					data: {
						eventId: dto.eventId,
						userId,
						status: 'pending',
					},
				});
				addedCount++;

				// Отправить приглашение в Telegram
				await this.sendInvitation(event, userId);
			}
		}

		return { added: addedCount };
	};

	/**
	 * Удалить участника
	 */
	removeParticipant = async (eventId: number, userId: number, currentUserId: number): Promise<void> => {
		const event = await this.calendarEvent.findUnique({
			where: { id: eventId },
		});

		if (!event) {
			throw new HttpException('Событие не найдено', HttpStatus.NOT_FOUND);
		}

		// Проверка прав: только автор или сам участник может удалить
		if (event.authorId !== currentUserId && userId !== currentUserId) {
			const user = await this.user.findUnique({
				where: { id: currentUserId },
				include: { roles: true },
			});
			if (!user?.roles?.some((role) => ['boss', 'admin', 'developer', 'crmAdmin'].includes(role.alias))) {
				throw new HttpException('Нет прав на удаление участника', HttpStatus.FORBIDDEN);
			}
		}

		await this.calendarEventParticipant.deleteMany({
			where: { eventId, userId },
		});
	};

	/**
	 * Обновить статус участника (принять/отклонить приглашение)
	 */
	updateStatus = async (dto: UpdateParticipantStatusDto, currentUserId: number): Promise<{ status: string }> => {
		// Только сам участник может менять свой статус
		if (dto.userId !== currentUserId) {
			throw new HttpException('Можно изменить только свой статус', HttpStatus.FORBIDDEN);
		}

		const participant = await this.calendarEventParticipant.findUnique({
			where: {
				eventId_userId: { eventId: dto.eventId, userId: dto.userId },
			},
			include: { event: { include: { author: true } } },
		});

		if (!participant) {
			throw new HttpException('Приглашение не найдено', HttpStatus.NOT_FOUND);
		}

		await this.calendarEventParticipant.update({
			where: { id: participant.id },
			data: { status: dto.status },
		});

		// Уведомить автора о решении
		await this.notifyAuthorAboutResponse(participant.event, dto.userId, dto.status);

		return { status: dto.status };
	};

	/**
	 * Получить участников события
	 */
	getEventParticipants = async (eventId: number): Promise<any[]> => {
		return this.calendarEventParticipant.findMany({
			where: { eventId },
			include: { user: true },
		});
	};

	/**
	 * Получить приглашения пользователя
	 */
	getUserInvitations = async (userId: number): Promise<any[]> => {
		return this.calendarEventParticipant.findMany({
			where: { userId, status: 'pending' },
			include: {
				event: {
					include: { author: true, organization: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	};

	// Private методы

	private readonly timeZone = 'Asia/Tashkent';

	private formatTime(date: Date): string {
		const zonedDate = utcToZonedTime(date, this.timeZone);
		return format(zonedDate, 'HH:mm', { locale: ru });
	}

	private formatDate(date: Date): string {
		const zonedDate = utcToZonedTime(date, this.timeZone);
		return format(zonedDate, 'd MMMM yyyy', { locale: ru });
	}

	private formatEventType(type: string): string {
		const types: Record<string, string> = {
			meeting: '📅 Встреча',
			call: '📞 Звонок',
			note: '📝 Заметка',
			reminder: '🔔 Напоминание',
		};
		return types[type] || type;
	}

	private async sendInvitation(event: any, userId: number): Promise<void> {
		try {
			const user = await this.user.findUnique({
				where: { id: userId },
				select: { telegramId: true, firstName: true },
			});

			if (!user?.telegramId) return;

			const author = event.author;
			const message = `📨 <b>Приглашение на ${this.formatEventType(event.type).toLowerCase()}</b>

"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))} — ${this.formatTime(new Date(event.dateEnd))}
📅 ${this.formatDate(new Date(event.dateStart))}
${event.location ? `📍 ${event.location}\n` : ''}${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}\n` : ''}
👤 От: ${author?.lastName || ''} ${author?.firstName || ''}`;

			await this.telegramService.sendMessage(Number(user.telegramId), message);
			this.logger.log(`Sent invitation to user ${userId} for event ${event.id}`);
		} catch (error) {
			this.logger.error(`Failed to send invitation to user ${userId}:`, error);
		}
	}

	private async notifyAuthorAboutResponse(event: any, userId: number, status: string): Promise<void> {
		try {
			const author = event.author;
			if (!author?.telegramId) return;

			const participant = await this.user.findUnique({
				where: { id: userId },
				select: { firstName: true, lastName: true },
			});

			const statusText = status === 'accepted' ? '✅ принял(а) приглашение' : '❌ отклонил(а) приглашение';
			const message = `${this.formatEventType(event.type)}: ${participant?.lastName || ''} ${participant?.firstName || ''} ${statusText}

"${event.title}"
📅 ${this.formatDate(new Date(event.dateStart))}`;

			await this.telegramService.sendMessage(Number(author.telegramId), message);
		} catch (error) {
			this.logger.error(`Failed to notify author about response:`, error);
		}
	}
}
