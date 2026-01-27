import { useEffect, useMemo, useState } from 'react';
import { IUseUser } from './response.interface';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { IUserAllInfoResponse } from '@interfaces/user/UserAllInfo.response';
import UserService from '@services/User.service';

export const useUserDeprecated = (id?: number): IUseUser => {
	const [user, setUser] = useState<IUserAllInfoResponse>();
	const authUserId = useStateSelector((state) => state.app.auth.userId);
	const userId = useMemo(() => Number(id || authUserId || 0), [authUserId, id]);

	useEffect(() => {
		if (!userId) {
			return;
		}
		let isMounted = true;

		(async () => {
			const [findUser] = await UserService.findAllInfoById(userId);

			if (findUser && isMounted) {
				setUser(findUser);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [userId]);
	return {
		user: user || null,
		userId: user?.id || null,
		team: user?.team || null,
		parent: user?.parentId || null,
		children: user?.childrenId || null,

		department: user?.department || null,
		territory: user?.territory || null,

		rolesAlias: user?.roles ? user.roles.map((role) => role.alias) : null,
	};
};
