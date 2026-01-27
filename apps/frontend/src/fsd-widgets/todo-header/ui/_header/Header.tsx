import { FC, useCallback, useState } from 'react';
import TailwindColors from '@config/tailwind/color';
import { useTodoActions } from '@fsd/entities/todo';
import { Icon } from '@fsd/shared/ui-kit';
import { TodoCreateModalWidget } from '@fsd/widgets/todo-create-modal';
import { TodoListMy } from '@fsd/widgets/todo-list-my';
import { Indicator, Popover, Tooltip } from '@mantine/core';
import css from './header.module.scss';

export const Header: FC = () => {
	const [opened, setOpened] = useState(false);
	const todoActions = useTodoActions();

	const handleShowModalCreate = useCallback(() => {
		todoActions.setModalShow({ modal: 'create', show: true });
		setOpened(false);
	}, [todoActions]);

	return (
		<>
			<Popover width={360} position={'bottom'} shadow={'lg'} radius={'md'} opened={opened} onChange={setOpened}>
				<Popover.Target>
					<Indicator
						position={'bottom-start'}
						color={TailwindColors.primary.mainLighten}
						label={0}
						overflowCount={9}
						inline
						size={16}
						showZero={false}
						dot={false}
						style={{ cursor: 'pointer' }}
						onClick={() => setOpened(true)}
					>
						<div onClick={() => setOpened(true)}>
							<Icon name={'todo'} className={css.icon} />
						</div>
					</Indicator>
				</Popover.Target>
				<Popover.Dropdown>
					<Tooltip label={'Добавить новую задачу'} withArrow>
						<div className={css.create}>
							<Icon name={'plus-medium'} onClick={handleShowModalCreate} />
						</div>
					</Tooltip>

					<TodoListMy
						onClickToTask={() => {
							setOpened(false);
						}}
					/>
				</Popover.Dropdown>
			</Popover>

			<TodoCreateModalWidget />
		</>
	);
};
