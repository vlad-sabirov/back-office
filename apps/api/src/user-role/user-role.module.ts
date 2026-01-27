import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { UserRoleController } from './user-role.controller';
import { UserRoleService } from './user-role.service';

@Module({
	controllers: [UserRoleController],
	providers: [UserRoleService],
	imports: [forwardRef(() => UserModule)],
	exports: [UserRoleService],
})
export class UserRoleModule {}
