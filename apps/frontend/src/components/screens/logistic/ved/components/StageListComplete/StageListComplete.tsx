import { FC, useContext, useEffect, useState } from 'react';
import cn from 'classnames';
import { format, getUnixTime, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Avatar, ContentBlock, Menu, Table, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { CheckAccessBoolean } from '@helpers/CheckAccess';
import { ILogisticVedOrderResponse } from '@screens/logistic/ved/interfaces/LogisticVedOrder.response';
import { StageListCompleteProps } from './props';
import css from './styles.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const StageListComplete: FC<StageListCompleteProps> = observer(({ data: dataStage }) => {
	const { modalStore, logisticStore } = useContext(MainContext);
	const [data, setData] = useState<ILogisticVedOrderResponse[]>([]);
	const roles = useStateSelector((state) => state.app.auth.roles);

	useEffect(() => {
		let dataOrder: ILogisticVedOrderResponse[] = [];
		dataStage.forEach((stage) => {
			if (stage.orders?.length) dataOrder = [...dataOrder, ...stage.orders];
		});
		setData(dataOrder);
	}, [dataStage]);

	if (data?.length) {
		const tableData = {
			header: [
				{ key: 'createdAt', label: 'Дата заявки' },
				{ key: 'name', label: 'Название заявки' },
				{ key: 'author', label: 'Автор заявки' },
				{ key: 'performer', label: 'Исполнитель ВЭД' },
			],
			sortKeys: ['createdAt', 'author'],
			body: data.map((order) => {
				const notAuthor: boolean = CheckAccessBoolean(
					['boss', 'developer', 'logisticVedOrdersCalculate', 'logisticVedOrdersVed'],
					roles ?? []
				);

				let author = false;
				if (
					CheckAccessBoolean(['logisticVedOrdersAuthor'], roles ?? []) &&
					logisticStore.accessAuthorId.includes(order.authorId)
				)
					author = true;

				return {
					createdAt: {
						output: (
							<TextField
								className={css.date}
								style={{
									pointerEvents: notAuthor || author ? undefined : 'none',
									userSelect: notAuthor || author ? undefined : 'none',
									opacity: notAuthor || author ? undefined : '0.5',
								}}
							>
								{format(parseISO(order.createdAt), 'd LLLL yyyy', { locale: customLocaleRu })}
							</TextField>
						),
						index: getUnixTime(parseISO(order.createdAt)),
					},
					name: {
						output: (
							<TextField
								className={cn({
									[css.name]: true,
									[css.name__done]: logisticStore.displayOrdersDone,
									[css.name__closed]: logisticStore.displayOrdersClosed,
								})}
								onClick={() => {
									if (notAuthor || author) {
										logisticStore.setLogisticVedOrderCurrent(order);
										logisticStore.getLogisticVedOrderByID(order.id);
										modalStore.modalOpen('logisticVedOrderCard', true);
									}
								}}
								style={{
									pointerEvents: notAuthor || author ? undefined : 'none',
									userSelect: notAuthor || author ? undefined : 'none',
									opacity: notAuthor || author ? undefined : '0.5',
								}}
							>
								{order.name}
							</TextField>
						),
						index: order.name,
					},
					author: {
						output: (
							<Menu
								offset={-20}
								width={250}
								control={
									<div
										className={css.staff}
										style={{
											pointerEvents: notAuthor || author ? undefined : 'none',
											userSelect: notAuthor || author ? undefined : 'none',
											opacity: notAuthor || author ? undefined : '0.5',
										}}
									>
										<Avatar
											color={order.author.color}
											text={order.author.lastName[0] + order.author.firstName[0]}
											src={order.author.photo}
											className={css.staff_avatar}
											size="small"
										/>
										<TextField className={css.staff__text}>
											{order.author.lastName} {order.author.firstName}
										</TextField>
									</div>
								}
							>
								<MenuItemStaffUser data={order.author} />
							</Menu>
						),
						index: order.author.lastName + order.author.firstName,
					},
					performer: {
						output: order.performer ? (
							<Menu
								offset={-20}
								width={250}
								control={
									<div
										className={css.staff}
										style={{
											pointerEvents: notAuthor || author ? undefined : 'none',
											userSelect: notAuthor || author ? undefined : 'none',
											opacity: notAuthor || author ? undefined : '0.5',
										}}
									>
										<Avatar
											color={order.performer.color}
											text={order.performer.lastName[0] + order.performer.firstName[0]}
											src={order.performer.photo}
											className={css.staff_avatar}
											size="small"
										/>
										<TextField className={css.staff__text}>
											{order.performer.lastName} {order.performer.firstName}
										</TextField>
									</div>
								}
							>
								<MenuItemStaffUser data={order.performer} />
							</Menu>
						) : (
							''
						),
						index: order.performer ? order.performer.lastName + order.performer.firstName : '',
					},
				};
			}),
		};

		return (
			<ContentBlock withoutPaddingX>
				<Table data={tableData} />
			</ContentBlock>
		);
	}

	return <></>;
});
