import { FC, useCallback, useState } from 'react';
import cn from 'classnames';
import { formatISO, sub } from 'date-fns';
import { CrmOrganizationConst, useCrmOrganizationActions } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import { INavigationProps } from './navigation.props';
import css from './navigation.module.scss';

type ITypes = 'all' | 'empty' | 'medium' | 'low';
const isShow = CrmOrganizationConst.Settings.showPower;

export const Navigation: FC<INavigationProps> = ({ className, ...props }) => {
	const [active, setActive] = useState<ITypes>('all');
	const { empty, medium, low } = useStateSelector((state) => state.crm_organization.count);
	const filter = useStateSelector((state) => state.crm_organization.filter.list);
	const actions = useCrmOrganizationActions();

	const handleShowPower = useCallback(
		(active: ITypes) => {
			setActive(active);
			const datePzdc = formatISO(sub(new Date(), { years: 100 }));
			const dateMedium = formatISO(sub(new Date(), { days: CrmOrganizationConst.Settings.Power.Medium }));
			const dateLow = formatISO(sub(new Date(), { days: CrmOrganizationConst.Settings.Power.Low }));
			const dateEmpty = formatISO(sub(new Date(), { days: CrmOrganizationConst.Settings.Power.Empty }));

			actions.setFilterList({ ...filter, ignoreUserIds: [0, 1] });

			if (active === 'all') {
				actions.setFilterList({ ...filter, last1CUpdate: undefined, ignoreUserIds: [] });
			}

			if (active === 'empty') {
				actions.setFilterList({
					...filter,
					last1CUpdate: { start: datePzdc, end: dateEmpty },
					ignoreUserIds: undefined,
				});
			}

			if (active === 'low') {
				actions.setFilterList({
					...filter,
					last1CUpdate: { start: dateEmpty, end: dateLow },
					ignoreUserIds: undefined,
				});
			}

			if (active === 'medium') {
				actions.setFilterList({
					...filter,
					last1CUpdate: { start: dateLow, end: dateMedium },
					ignoreUserIds: undefined,
				});
			}
		},
		[actions, filter]
	);

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			{isShow && (
				<div
					className={cn(css.item, css.total)}
					data-active={active === 'all'}
					onClick={() => handleShowPower('all')}
				>
					<Icon name={'crm'} />
					<TextField size={'small'}>Все</TextField>
				</div>
			)}

			{!!empty && isShow && (
				<div
					className={cn(css.item, css.empty)}
					data-active={active === 'empty'}
					onClick={() => handleShowPower('empty')}
				>
					<Icon name={'battery-empty'} />
					<TextField size={'small'}>Забытых: {empty}</TextField>
				</div>
			)}

			{!!low && isShow && (
				<div
					className={cn(css.item, css.low, { [css.active]: active === 'low' })}
					data-active={active === 'low'}
					onClick={() => handleShowPower('low')}
				>
					<Icon name={'battery-low'} />
					<TextField size={'small'}>Холодных: {low}</TextField>
				</div>
			)}

			{!!medium && isShow && (
				<div
					className={cn(css.item, css.medium, { [css.active]: active === 'medium' })}
					data-active={active === 'medium'}
					onClick={() => handleShowPower('medium')}
				>
					<Icon name={'battery-medium'} />
					<TextField size={'small'}>Теплых: {medium}</TextField>
				</div>
			)}
		</div>
	);
};
