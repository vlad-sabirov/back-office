import { useEffect } from 'react';
import { IStaffEntity } from '@fsd/entities/staff';
import { StaffService } from '@fsd/entities/staff';
import { StaffActions } from '@fsd/entities/staff';
import { IStaffVoip } from '@fsd/entities/staff/model/staff.types';
import { useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';

export const useStoreConfigureStaff = () => {
	const team = useStateSelector((state) => state.app.auth.team);
	const all = useStateSelector((state) => state.staff.data.all);
	const actions = useStateActions(StaffActions);
	const [getSales] = StaffService.getSales();
	const [getByIdMany] = StaffService.getByIdMany();
	const [getAll] = StaffService.getEverything();

	useEffect(() => {
		if (!team) {
			return;
		}
		(async () => {
			const { data } = await getByIdMany(team);
			if (data) actions.setDataTeam(data);
		})();
	}, [actions, getByIdMany, team]);

	useEffect(() => {
		(async () => {
			const { data } = await getSales();
			if (data) actions.setDataSales(data);
		})();
	}, [actions, getSales]);

	useEffect(() => {
		(async () => {
			const { data } = await getAll();
			if (data) {
				actions.setDataAll(data);
				const worked: IStaffEntity[] = [];
				data.forEach((user) => {
					if (!user.isFired) {
						worked.push(user);
					}
				});
				actions.setDataWorked(worked);
			}
		})();
	}, [actions, getAll]);

	useEffect(() => {
		if (!all.length) {
			return;
		}
		const data: Record<string, IStaffVoip> = {};
		all.forEach((user) => {
			const dataUser = {
				id: user.id,
				name: `${user.lastName} ${user.firstName}`,
				sex: user.sex,
				phoneMobile: user.phoneMobile,
				phoneVoip: user.phoneVoip,
				photo: user.photo,
				color: user.color,
				initial: `${user.lastName[0]}${user.firstName[0]}`,
			};
			if (user.phoneMobile) {
				data[user.phoneMobile.slice(-9)] = dataUser;
			}
			if (user.phoneVoip) {
				data[user.phoneVoip] = dataUser;
			}
		});
		actions.setDataVoip(data);
	}, [all, actions]);
};
