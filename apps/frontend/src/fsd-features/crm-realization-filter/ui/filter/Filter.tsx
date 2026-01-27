import { FC } from 'react';
import { IFilterProps } from './filter.types';
import { Month } from './ui/month/Month';
import { Year } from './ui/year/Year';
import { useCrmRealizationActions } from '@fsd/entities/crm-realization';
import { IRealizationTypes } from '@fsd/entities/crm-realization/model/realization-slice-init.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, SegmentedControl } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import css from './filter.module.scss';

export const Filter: FC<IFilterProps> = () => {
	const type = useStateSelector((state) => state.crm_realization.type);
	const realizationActions = useCrmRealizationActions();

	return (
		<Popover shadow="xl" position="right-start" offset={-8} radius={12} withArrow arrowOffset={12}>
			<Popover.Target>
				<div>
					<Button>
						<Icon name={'filter'} />
					</Button>
				</div>
			</Popover.Target>
			<Popover.Dropdown>
				<div className={css.root}>
					<SegmentedControl
						data={IRealizationTypes.map((type) => {
							if (type === 'month') return { label: 'Месяц', value: type };
							if (type === 'year') return { label: 'Год', value: type };
							return { value: type, label: type };
						})}
						value={type}
						onChange={realizationActions.setType}
					/>

					{type === 'month' && <Month />}
					{type === 'year' && <Year />}
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
