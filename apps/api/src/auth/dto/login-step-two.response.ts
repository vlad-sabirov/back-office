import { UserEntity } from 'src/user/entities/user.entity';

export class LoginStepTwoResponse extends UserEntity {
	pinCode: number;
}
