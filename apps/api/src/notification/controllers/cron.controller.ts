import { Controller, Get, Param } from '@nestjs/common';
import { CronBirthdayService } from '../services/cron/birthday';
import { CronLatenessService } from '../services/cron/lateness';

@Controller('notification/cron')
export class CronController {
	constructor(
		private readonly cronBirthdayService: CronBirthdayService,
		private readonly cronLatenessService: CronLatenessService
	) {}

	@Get('/birthday/findBirthdayToday')
	async birthdayFindBirthdayToday(): Promise<void> {
		return await this.cronBirthdayService.findBirthdayToday();
	}

	@Get('/birthday/findBirthdayThisMonth')
	async birthdayFindBirthdayThisMonth(): Promise<void> {
		return await this.cronBirthdayService.findBirthdayThisMonth();
	}

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
}
