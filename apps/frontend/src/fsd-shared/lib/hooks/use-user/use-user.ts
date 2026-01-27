import { useMemo } from 'react';
import { IUseUserResponse } from './use-user.types';
import { IStaffEntity } from '@fsd/entities/staff';
import { useStateSelector } from '../useStateSelector/useStateSelector';

const getParent = ({ user, all }: { user: IStaffEntity | null; all: IStaffEntity[] }): IStaffEntity | null => {
	if (!user || !all.length) {
		return null;
	}
	return all.find((parent) => parent.child?.some((child) => child.id === user.id)) ?? null;
};

const getChildren = ({ user, all }: { user: IStaffEntity | null; all: IStaffEntity[] }): IStaffEntity[] | null => {
	if (!user || !all.length || !user.child?.length) {
		return null;
	}
	const childrenIds = user.child.map((child) => child.id);
	return all.filter((user) => childrenIds.includes(user.id)) ?? null;
};

const getTeam = ({
	user,
	all,
	ignoreIds,
}: {
	user: IStaffEntity | null;
	all: IStaffEntity[];
	ignoreIds?: number[];
}): number[] | null => {
	if (!user || !all.length || ignoreIds?.includes(user.id)) {
		return null;
	}
	const teamOutput: number[] = [user.id];
	const ignoreIdsArray = ignoreIds ?? [];
	ignoreIdsArray.push(user.id);

	const parent = getParent({ user, all });
	const parentIds = getTeam({ user: parent, all, ignoreIds: ignoreIdsArray });
	if (parentIds && parentIds.length) {
		teamOutput.push(...parentIds);
		ignoreIds?.push(...parentIds);
	}

	const children = getChildren({ user: user, all });
	const childrenIds = children?.flatMap((child) => getTeam({ user: child, all, ignoreIds: ignoreIdsArray }));
	if (childrenIds && childrenIds.length) {
		childrenIds.forEach((child) => {
			if (child) {
				teamOutput.push(child);
				ignoreIds?.push(child);
			}
		});
	}

	return teamOutput;
};

export const useUser = (id?: number): IUseUserResponse => {
	const authUserId = useStateSelector((state) => state.app.auth.userId);
	const staffAll = useStateSelector((state) => state.staff.data.all);
	const currentUser = useMemo<IStaffEntity | null>(() => {
		return staffAll.find((user) => user.id === (id ?? authUserId)) ?? null;
	}, [authUserId, id, staffAll]);

	if (!currentUser) {
		return {
			user: null,
			userId: null,
			name: null,
			fullName: null,
			department: null,
			territory: null,

			getRoles: () => null,
			getTeam: () => null,
			getParent: () => null,
			getChildren: () => null,
		};
	}

	return {
		user: currentUser,
		userId: currentUser.id,
		name: `${currentUser.lastName} ${currentUser.firstName}`,
		fullName: `${currentUser.lastName} ${currentUser.firstName} ${currentUser.surName ?? ''}`,
		department: currentUser.department,
		territory: currentUser.territory,

		getRoles: () => currentUser?.roles.map(({ alias }) => alias) ?? null,
		getTeam: () => getTeam({ user: currentUser, all: staffAll }),
		getParent: () => getParent({ user: currentUser, all: staffAll }),
		getChildren: () => getChildren({ user: currentUser, all: staffAll }),
	};
};
