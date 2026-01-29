import { Controller, Get, Param } from '@nestjs/common';
import { CronBirthdayService } from '../services/cron/birthday';
import { CronLatenessService } from '../services/cron/lateness';
import { CronTaskReminderService } from '../services/cron/task-reminder';
import { CronOrganizationPowerService } from '../services/cron/organization-power';

@Controller('notification/cron')
export class CronController {
	constructor(
		private readonly cronBirthdayService: CronBirthdayService,
		private readonly cronLatenessService: CronLatenessService,
		private readonly cronTaskReminderService: CronTaskReminderService,
		private readonly cronOrganizationPowerService: CronOrganizationPowerService
	) {}

	// ==================== Birthday ====================

	@Get('/birthday/findBirthdayToday')
	async birthdayFindBirthdayToday(): Promise<void> {
		return await this.cronBirthdayService.findBirthdayToday();
	}

	@Get('/birthday/findBirthdayThisMonth')
	async birthdayFindBirthdayThisMonth(): Promise<void> {
		return await this.cronBirthdayService.findBirthdayThisMonth();
	}

	// ==================== Lateness ====================

	@Get('/lateness/staffIsLate/:userId')
	async staffIsLate(@Param('userId') userId: number | string): Promise<void> {
		return await this.cronLatenessService.staffIsLate(userId);
	}

	@Get('/lateness/didComeToday')
	async didComeToday(): Promise<void> {
		return await this.cronLatenessService.didComeToday();
	}

	@Get('/lateness/forgotToCheckIn')
	async forgotToCheckIn(): Promise<void> {
		return await this.cronLatenessService.forgotToCheckIn();
	}

	@Get('/lateness/teamAttendanceReport')
	async teamAttendanceReport(): Promise<void> {
		return await this.cronLatenessService.teamAttendanceReport();
	}

	// ==================== Task Reminders ====================

	@Get('/task/checkAllDeadlines')
	async taskCheckAllDeadlines(): Promise<{ reminder3Days: number; reminder1Day: number; reminder2Hours: number; overdue: number }> {
		return await this.cronTaskReminderService.checkAllDeadlines();
	}

	@Get('/task/sendReminder3Days')
	async taskSendReminder3Days(): Promise<{ sent: number }> {
		return await this.cronTaskReminderService.sendReminder3Days();
	}

	@Get('/task/sendReminder1Day')
	async taskSendReminder1Day(): Promise<{ sent: number }> {
		return await this.cronTaskReminderService.sendReminder1Day();
	}

	@Get('/task/sendReminder2Hours')
	async taskSendReminder2Hours(): Promise<{ sent: number }> {
		return await this.cronTaskReminderService.sendReminder2Hours();
	}

	@Get('/task/sendOverdueNotifications')
	async taskSendOverdueNotifications(): Promise<{ sent: number }> {
		return await this.cronTaskReminderService.sendOverdueNotifications();
	}

	// ==================== Organization Power ====================

	@Get('/organization/checkPowerStatusChanges')
	async organizationCheckPowerStatusChanges(): Promise<{ notifications: number }> {
		return await this.cronOrganizationPowerService.checkPowerStatusChanges();
	}

	@Get('/organization/getPowerStatistics')
	async organizationGetPowerStatistics(): Promise<{ full: number; medium: number; low: number; empty: number; total: number }> {
		return await this.cronOrganizationPowerService.getPowerStatistics();
	}
}
