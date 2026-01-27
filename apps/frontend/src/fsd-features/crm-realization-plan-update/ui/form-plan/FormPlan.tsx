import { FC, useMemo } from 'react';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Team } from '../team/Team';
import css from './form-plan.module.scss';

export const FormPlan: FC = () => {
	const staffAll = useStateSelector((state) => state.staff.data.sales);

	const planAll = useCrmRealizationGetDataMonthAll()?.last;

	const staff = useMemo(() => {
		const ignoreId = staffAll.reduce((acc: number[], user) => {
			if (user.child?.length) {
				acc.push(...user.child.map((child) => child.id));
			}
			return acc;
		}, []);
		return staffAll.filter((user) => !ignoreId.includes(user.id) && user.id !== 9);
	}, [staffAll]);

	return (
		<div className={css.wrapper}>
			{staff.length &&
				staff.map((user) => {
					const prevPlan = planAll?.downToTeams.linkedList[user.id] ?? null;
					return <Team key={`team_${user.id}`} user={user} report={prevPlan} />;
				})}
		</div>
	);
};
