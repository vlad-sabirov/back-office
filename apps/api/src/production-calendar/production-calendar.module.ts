import { Module } from '@nestjs/common';
import { ProductionCalendarService } from './production-calendar.service';
import { ProductionCalendarController } from './production-calendar.controller';

@Module({
	providers: [ProductionCalendarService],
	controllers: [ProductionCalendarController],
	exports: [ProductionCalendarService],
})
export class ProductionCalendarModule {}
