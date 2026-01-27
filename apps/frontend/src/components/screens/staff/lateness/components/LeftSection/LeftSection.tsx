import { FC, useContext } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { LatenessContext } from '@screens/staff/lateness';
import { LeftSectionProps } from '.';
import css from './left-section.module.scss';

export const LeftSection: FC<LeftSectionProps> = observer(({ className, ...props }) => {
	const latenessStore = useContext(LatenessContext);

	const handleRefresh = async () => {
		latenessStore.setDateSingleRefreshStamp(new Date().getTime());
		showNotification({ message: 'Обновление завершено', color: 'green' });
	};

	return (
		<div className={cn(css.root, className)} {...props}>
			<Tooltip label={'Обновить данные ежедневного отчета'} openDelay={500}>
				<div>
					<Button className={css.refreshButton} onClick={handleRefresh}>
						<Icon name={'refresh'} />
					</Button>
				</div>
			</Tooltip>
		</div>
	);
});
