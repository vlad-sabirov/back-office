import { FC, createContext } from 'react';
import { UserRoleAdd, UserRoleDelete, UserRoleEdit, UserRoleList, UserRoleStaff } from './modals';
import UserRoleStore from './user-role.store';

const userRoleStore = new UserRoleStore();
export const UserRoleContext = createContext({ userRoleStore });

const UserRole: FC = () => {
	return (
		<UserRoleContext.Provider value={{ userRoleStore }}>
			<UserRoleList />
			<UserRoleAdd />
			<UserRoleEdit />
			<UserRoleDelete />
			<UserRoleStaff />
		</UserRoleContext.Provider>
	);
};

export default UserRole;
