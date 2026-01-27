import { FC, useCallback, useState } from 'react';
import cn from 'classnames';
import { formatISO, sub } from 'date-fns';
import { CrmContactConst, useCrmContactActions } from '@fsd/entities/crm-contact';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import { INavigationProps } from './navigation.props';
import css from './navigation.module.scss';

type ITypes = 'all' | 'empty' | 'medium' | 'low';
const isShow = CrmContactConst.Settings.showPower;

export const Navigation: FC<INavigationProps> = ({ className, ...props }) => {
	const [active, setActive] = useState<ITypes>('all');
	const { empty, medium, low } = useStateSelector((state) => state.crm_contact.count);
	const filter = useStateSelector((state) => state.crm_contact.filter.list);
	const actions = useCrmContactActions();

	const handleShowPower = useCallback(
		(active: ITypes) => {
			setActive(active);
			const datePzdc = formatISO(sub(new Date(), { years: 100 }));
			const dateMedium = formatISO(sub(new Date(), { days: CrmContactConst.Settings.Power.Medium }));
			const dateLow = formatISO(sub(new Date(), { days: CrmContactConst.Settings.Power.Low }));
			const dateEmpty = formatISO(sub(new Date(), { days: CrmContactConst.Settings.Power.Empty }));

			if (active === 'all') {
				actions.setFilterList({ ...filter, updatedAt: undefined });
			}

			if (active === 'empty') {
				actions.setFilterList({ ...filter, updatedAt: { start: datePzdc, end: dateEmpty } });
			}

			if (active === 'low') {
				actions.setFilterList({ ...filter, updatedAt: { start: dateEmpty, end: dateLow } });
			}

			if (active === 'medium') {
				actions.setFilterList({ ...filter, updatedAt: { start: dateLow, end: dateMedium } });
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
