import { FC, useMemo, useState } from 'react';
import cn from 'classnames';
import TailwindColors from '@config/tailwind/color';
import { Callers } from '@fsd/entities/voip/ui/calls/Callers';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon } from '@fsd/shared/ui-kit';
import { Indicator, Popover } from '@mantine/core';
import css from './header-popup.module.scss';

export const HeaderPopup: FC = () => {
	const callEvents = useStateSelector((state) => state.voip.data.events);
	const callMy = useStateSelector((state) => state.voip.data.my);
	const hasEvents = useMemo<boolean>(() => callEvents.length > 0, [callEvents]);
	const [opened, setOpened] = useState(false);

	const missed = useStateSelector((state) => state.voip.data.missed);

	return (
		<>
			<Popover width={360} position={'bottom'} shadow={'lg'} radius={'md'} opened={opened} onChange={setOpened}>
				<Popover.Target>
					<Indicator
						position={'bottom-start'}
						color={TailwindColors.error.mainLighten}
						label={missed.length}
						overflowCount={9}
						inline
						size={16}
						showZero={false}
						dot={false}
						style={{ cursor: 'pointer' }}
						onClick={() => setOpened(true)}
					>
						<div onClick={() => setOpened(true)}>
							<Icon
								name={hasEvents ? 'phone-f' : 'phone'}
								className={cn(css.mainIcon, { [css.mainIcon__active]: callMy != null })}
							/>
						</div>
					</Indicator>
				</Popover.Target>
				<Popover.Dropdown>
					<Callers isShowPopover={setOpened} />
				</Popover.Dropdown>
			</Popover>

			{/*<ModalMyCall />*/}
		</>
	);
};
