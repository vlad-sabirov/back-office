import { Module } from '@nestjs/common';
import { HttpModule } from './http';
import { MongoConnect } from './config';
import { RealizationMonthModule } from './realization-month/realization-month.module';
import { LastActionModule } from './last-action/last-action.module';
import { WorkingBaseModule } from './working-base/working-base.module';

@Module({
	imports: [
		RealizationMonthModule,
		LastActionModule,
		WorkingBaseModule,
		HttpModule,
		MongoConnect,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
