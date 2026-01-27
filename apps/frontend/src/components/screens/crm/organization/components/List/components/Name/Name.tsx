import { FC, useMemo } from 'react';
import cn from 'classnames';
import { parseISO, sub } from 'date-fns';
import { TextField } from '@fsd/shared/ui-kit';
import { IconCrmBattery, IconCrmBatteryPropsLevels } from '@fsd/shared/ui-kit/icon/items';
import { OrganizationConst } from '@screens/crm/organization/organization.const';
import { NameT } from '.';
import css from './name.module.scss';

export const Name: FC<NameT> = ({ organization, className }) => {
	const batteryLevel = useMemo<(typeof IconCrmBatteryPropsLevels)[number]>(() => {
		const levels = OrganizationConst.SETTINGS.LAST_UPDATE_DAYS_LEVELS;
		const updateDate = parseISO(organization.updatedAt);

		const newDate = new Date();
		const emptyDate = sub(newDate, { days: levels.EMPTY });
		const lowDate = sub(newDate, { days: levels.LOW });
		const mediumDate = sub(newDate, { days: levels.MEDIUM });

		if (updateDate < emptyDate) return 'empty';
		if (updateDate < lowDate) return 'low';
		if (updateDate < mediumDate) return 'medium';
		return 'full';
	}, [organization]);

	return (
		<div className={css.wrapper}>
			<IconCrmBattery level={batteryLevel} />
			<TextField className={cn(css.text, className)}>{organization.nameEn}</TextField>
		</div>
	);
};
