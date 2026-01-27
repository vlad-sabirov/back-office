import { FC, useContext } from 'react';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { Tooltip } from '@mantine/core';
import { Access } from '@screens/staff/cfg';

export const RightSection: FC = () => {
	const { modalStore } = useContext(MainContext);
	const CheckAccess = useAccess();

	return (
		<>
			{CheckAccess(Access.userAdd) && (
				<Tooltip
					label={'Добавить сотрудника'}
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
							onClick={() => modalStore.modalOpen('staffUserRegister', true)}
						>
							Сотрудник
						</Button>
					</div>
				</Tooltip>
			)}
		</>
	);
};
