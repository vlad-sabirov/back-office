import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Icon, SegmentedControl } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { CheckAccessJSX } from '@helpers/CheckAccess';
import { Popover, Tooltip } from '@mantine/core';
import UserService from '@services/User.service';
import css from './style.module.scss';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const OrderFilter: FC = () => {
	const { logisticStore } = useContext(MainContext);
	const [opened, setOpened] = useState(false);
	const [orderAuthor, setOrderAuthor] = useState([{ value: '0', label: 'Все' }]);
	const [filterAuthor, setFilterAuthor] = useState<number | number[] | string | string[]>(
		logisticStore.displayOrdersAuthor
	);
	const [filterState, setFilterState] = useState<string>('');
	const userId = useStateSelector((state) => state.app.auth.userId);

	const getAccessAuthorId = useCallback(async () => {
		const [authUser] = await UserService.findById(userId ?? 0);
		if (authUser) {
			const newAccessAuthorId = [authUser.id];

			if (authUser.child?.length) authUser.child.map((user) => newAccessAuthorId.push(user.id));
			else {
				const [parent] = await UserService.findParentByChildId(authUser.id);
				if (!parent) return;

				parent.forEach((parentUser) => {
					newAccessAuthorId.push(parentUser.id);
					parentUser.child?.forEach((childUser) => {
						if (authUser.id !== childUser.id) newAccessAuthorId.push(childUser.id);
					});
				});
			}

			logisticStore.setAccessAuthorId(newAccessAuthorId);
		}
	}, [userId, logisticStore]);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			if (isMounted) {
				logisticStore.setLogisticVedStageList([]);
				await logisticStore.getLogisticVedStageListWithOrderOptions({
					userId: logisticStore.displayOrdersAuthor,
					isClose: logisticStore.displayOrdersClosed,
					isDone: logisticStore.displayOrdersDone,
				});
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [filterAuthor, filterState, logisticStore]);

	useEffect(() => {
		if (userId) getAccessAuthorId();
	}, [userId, getAccessAuthorId]);

	useEffect(() => {
		if (!logisticStore.accessAuthorId) return;

		const filterOrderAuthor = [
			{ value: '0', label: 'Все' },
			{ value: String(userId ?? 0), label: 'Мои' },
		];
		if (typeof logisticStore.accessAuthorId === 'object' && logisticStore.accessAuthorId?.length > 1)
			filterOrderAuthor.push({ value: JSON.stringify(logisticStore.accessAuthorId), label: 'Отдел' });

		setOrderAuthor(filterOrderAuthor);
	}, [userId, logisticStore.accessAuthorId, opened]);

	return (
		<Popover
			opened={opened}
			onClose={() => setOpened(false)}
			shadow="xl"
			position="right-start"
			offset={-8}
			radius={12}
			withArrow
			arrowOffset={12}
		>
			<Popover.Target>
				<Tooltip label={'Фильтровать заявки'} withArrow openDelay={1000} transitionDuration={300}>
					<div>
						<Button color="neutral" variant="easy" onClick={() => setOpened((o) => !o)}>
							<Icon name="filter" />
						</Button>
					</div>
				</Tooltip>
			</Popover.Target>

			<Popover.Dropdown>
				<div className={css.wrapper}>
					<CheckAccessJSX
						accessRoles={['logisticVedOrdersAuthor']}
						content={
							<SegmentedControl
								label="Автор"
								size="medium"
								color="lighten"
								data={orderAuthor}
								value={
									typeof filterAuthor === 'object'
										? JSON.stringify(filterAuthor)
										: String(filterAuthor)
								}
								onChange={(value) => {
									logisticStore.setDisplayOrdersAuthor(JSON.parse(value));
									setFilterAuthor(JSON.parse(value));
								}}
							/>
						}
					/>

					<SegmentedControl
						label="Статус"
						size="medium"
						color="lighten"
						data={[
							{ value: 'active', label: 'Активные' },
							{ value: 'isDone', label: 'Завершенные' },
							{ value: 'isClose', label: 'Закрытые' },
						]}
						value={filterState}
						onChange={async (value) => {
							switch (value) {
								case 'active':
									logisticStore.setDisplayOrdersClosed(false);
									logisticStore.setDisplayOrdersDone(false);
									break;
								case 'isDone':
									logisticStore.setDisplayOrdersClosed(false);
									logisticStore.setDisplayOrdersDone(true);
									break;
								case 'isClose':
									logisticStore.setDisplayOrdersClosed(true);
									logisticStore.setDisplayOrdersDone(false);
									break;
								default:
									break;
							}

							setFilterState(value);
						}}
					/>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
