import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserDepartmentService } from './user-department.service';
import { UserDepartmentController } from './user-department.controller';

@Module({
	providers: [UserDepartmentService],
	controllers: [UserDepartmentController],
	exports: [UserDepartmentService],
	imports: [forwardRef(() => UserModule)],
})
export class UserDepartmentModule {}
