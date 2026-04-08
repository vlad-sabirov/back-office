import { UserEntity } from 'src/user/entities/user.entity';

export class LoginStepOneResponse extends UserEntity {
	pinCode: number;
	botDisabled?: boolean;
}
