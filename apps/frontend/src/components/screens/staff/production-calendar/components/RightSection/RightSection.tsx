import { FC, useState } from 'react';
import cn from 'classnames';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { useAccess } from '@hooks';
import { Tooltip } from '@mantine/core';
import { CreateEventModal } from '../../modals';
import { RightSectionProps } from '.';
import css from './RightSection.module.scss';

export const RightSection: FC<RightSectionProps> = ({ className, ...props }) => {
	const [crateEventModal, setCrateEventModal] = useState<boolean>(false);
	const CheckAccess = useAccess();

	return (
		<div className={cn(className, css.root)} {...props}>
			{CheckAccess(['developer', 'boss', 'vacation']) && (
				<>
					<Tooltip
						label={'Добавить событие в календарь'}
						multiline
						withArrow
						openDelay={1000}
						transitionDuration={300}
						position="top-end"
					>
						<div>
							<Button
								color="info"
								variant="easy"
								iconLeft={<Icon name="plus-medium" style={{ width: 12 }} />}
								onClick={() => setCrateEventModal(true)}
							>
								Событие
							</Button>
						</div>
					</Tooltip>

					<CreateEventModal opened={crateEventModal} setOpened={setCrateEventModal} />
				</>
			)}
		</div>
	);
};
