import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserTerritoryController } from './user-territory.controller';
import { UserTerritoryService } from './user-territory.service';

@Module({
	controllers: [UserTerritoryController],
	providers: [UserTerritoryService],
	exports: [UserTerritoryService],
	imports: [forwardRef(() => UserModule)],
})
export class UserTerritoryModule {}
