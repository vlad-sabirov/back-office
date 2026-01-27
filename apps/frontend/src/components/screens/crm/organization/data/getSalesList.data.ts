import { IUserResponse } from '@interfaces/user/UserList.response';
import UserService from '@services/User.service';

export const getSalesListData = async (): Promise<IUserResponse[]> => {
	const [response] = await UserService.findByRole('crm');	
	return response ?? [];
};
