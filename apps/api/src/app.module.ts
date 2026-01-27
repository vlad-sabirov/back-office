import { Module } from '@nestjs/common';
import { PrismaService } from './common';
import { UserModule } from './user/user.module';
import { UserRoleModule } from './user-role/user-role.module';
import { AuthModule } from './auth/auth.module';
import { UserDepartmentModule } from './user-department/user-department.module';
import { UserTerritoryModule } from './user-territory/user-territory.module';
import { FileModule } from './file/file.module';
import { LogisticVedModule } from './logistic-ved/logistic-ved.module';
import { NotificationModule } from './notification/notification.module';
import { CrmModule } from './crm/crm.module';
import { ProductionCalendarModule } from './production-calendar/production-calendar.module';
import { VacationCalendarModule } from './vacation-calendar/vacation-calendar.module';

@Module({
	imports: [
		UserModule,
		UserRoleModule,
		AuthModule,
		UserDepartmentModule,
		UserTerritoryModule,
		FileModule,
		LogisticVedModule,
		NotificationModule,
		CrmModule,
		ProductionCalendarModule,
		VacationCalendarModule,
	],
	controllers: [],
	providers: [PrismaService],
})
export class AppModule {}
