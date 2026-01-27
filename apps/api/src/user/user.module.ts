import { forwardRef, Module } from '@nestjs/common';
import { SearchModule } from 'src/search/search.module';
import { FileModule } from '../file/file.module';
import { UserDepartmentModule } from '../user-department/user-department.module';
import { UserTerritoryModule } from '../user-territory/user-territory.module';
import { AuthModule } from '../auth/auth.module';
import { UserRoleModule } from '../user-role/user-role.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { GetUserController } from './controllers/get-user.controller';

@Module({
	controllers: [UserController, GetUserController],
	providers: [UserService],
	imports: [
		forwardRef(() => AuthModule),
		forwardRef(() => UserDepartmentModule),
		forwardRef(() => UserTerritoryModule),
		forwardRef(() => UserRoleModule),
		SearchModule,
		FileModule,
		AuthModule,
	],
	exports: [UserService],
})
export class UserModule {}
