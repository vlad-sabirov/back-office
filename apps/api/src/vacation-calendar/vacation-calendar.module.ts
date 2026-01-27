import { Module } from '@nestjs/common';
import { VacationCalendarController } from './controllers';
import { VacationCalendarService } from './services';

@Module({
	controllers: [VacationCalendarController],
	providers: [VacationCalendarService],
	exports: [VacationCalendarService],
})
export class VacationCalendarModule {}
