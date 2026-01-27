import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { random } from 'lodash';
import { AuthConstants } from '../auth.constants';

@Injectable()
export class PinCodeService extends PrismaService {
	public generatePinCode = async (userId: number): Promise<number> => {
		const pinCode = random(100000, 999999);
		await this.deletePinCodeWithUserId(userId);

		await this.authPinCode.create({
			data: {
				userId,
				pinCode,
			},
		});

		return pinCode;
	};

	public validatePinCode = async (userId: number, pinCode: number): Promise<void> => {
		const findPinCode = await this.authPinCode.findFirst({
			where: {
				AND: [{ userId: Number(userId) }, { pinCode: Number(pinCode) }],
			},
		});
		if (!findPinCode) throw new HttpException(AuthConstants.ERROR_PIN_CODE_NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	public deletePinCodeWithId = async (id: number): Promise<void> => {
		await this.authPinCode.delete({ where: { id: Number(id) } });
	};

	public deletePinCodeWithUserId = async (userId: number): Promise<void> => {
		await this.authPinCode.deleteMany({ where: { userId: Number(userId) } });
	};
}
