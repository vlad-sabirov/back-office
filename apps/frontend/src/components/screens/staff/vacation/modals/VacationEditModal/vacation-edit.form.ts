import { LooseKeys } from '@mantine/form/lib/types';
import UserService from '@services/User.service';
import { VacationEditModalFormProps } from './vacation-edit-modal.props';

interface IError {
	field: LooseKeys<VacationEditModalFormProps>;
	message: string;
}
type IResponse = IError[] | undefined;

export const VacationEditForm = async (data: VacationEditModalFormProps): Promise<IResponse> => {
	const { userId, dateStart, dateEnd } = data;

	if (!userId) return [{ field: 'userId', message: 'Укажите сотрудника' }];

	const [findUser] = await UserService.findById(userId);
	if (!findUser) return [{ field: 'userId', message: 'Неверный сотрудник' }];
	if (findUser.isFired) return [{ field: 'userId', message: 'Сотрудник уволен' }];

	if (!dateStart) return [{ field: 'dateStart', message: 'Укажите дату' }];

	if (!dateEnd) return [{ field: 'dateEnd', message: 'Укажите дату' }];

	return;
};
