import { FC, useMemo } from 'react';
import { format, parseISO, sub } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import TailwindColors from '@config/tailwind/color';
import { Icon, IconPropsNames } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { CrmOrganizationConst as Const } from '../../config/const';
import { IIconBatteryProps } from './icon-battery.props';

interface ISettings {
	name: (typeof IconPropsNames)[number];
	color: string;
}

const mainDate = new Date('1990-08-19');
const empty: ISettings = { name: 'battery-empty', color: TailwindColors.error[600] };
const low: ISettings = { name: 'battery-low', color: TailwindColors.error[200] };
const medium: ISettings = { name: 'battery-medium', color: TailwindColors.warning[300] };
const full: ISettings = { name: 'battery-full', color: TailwindColors.success[300] };

export const IconBattery: FC<IIconBatteryProps> = ({ updatedAt, hardType }) => {
	const settings: ISettings = useMemo(() => {
		if (hardType) {
			if (hardType === 'empty') {
				return empty;
			}
			if (hardType === 'low') {
				return low;
			}
			if (hardType === 'medium') {
				return medium;
			}
			if (hardType === 'full') {
				return full;
			}
		}
		if (!updatedAt) {
			return empty;
		}

		const dateNow = new Date();
		const dateUpdate = parseISO(updatedAt);

		const dateEmpty = sub(dateNow, { days: Const.Settings.Power.Empty });
		if (dateUpdate < dateEmpty) {
			return empty;
		}

		const dateLow = sub(dateNow, { days: Const.Settings.Power.Low });
		if (dateUpdate < dateLow) {
			return low;
		}

		const dateMedium = sub(dateNow, { days: Const.Settings.Power.Medium });
		if (dateUpdate < dateMedium) {
			return medium;
		}

		return full;
	}, [hardType, updatedAt]);

	const lastUpdate = useMemo(() => {
		const updateDate = updatedAt ? parseISO(updatedAt) : mainDate;
		return updateDate <= mainDate
			? 'Начиная с сентября 2022 года нет данных'
			: format(updateDate, 'Последнее действие: dd MMMM yyyy', { locale: customLocaleRu });
	}, [updatedAt]);

	return (
		<Tooltip label={lastUpdate} position={'top-start'} withArrow openDelay={300}>
			<span style={{ marginTop: 4 }}>
				<Icon name={settings.name} style={{ color: settings.color }} />
			</span>
		</Tooltip>
	);
};
