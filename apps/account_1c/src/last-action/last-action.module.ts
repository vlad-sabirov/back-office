import { Module } from '@nestjs/common';
import { Ms1cModule } from '../ms-1c/ms-1c.module';
import { MsCrmModule } from '../ms-crm/ms-crm.module';
import { LastActionController } from './last-action.controller';
import { LastActionService } from './last-action.service';

@Module({
	imports: [Ms1cModule, MsCrmModule],
	providers: [LastActionService],
	controllers: [LastActionController],
})
export class LastActionModule {}
