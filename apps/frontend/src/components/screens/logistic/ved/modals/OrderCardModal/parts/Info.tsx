import { useContext } from 'react';
import cn from 'classnames';
import { differenceInDays, format, formatDistance, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Avatar, Icon, Menu, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { CheckAccessJSX } from '@helpers/CheckAccess';
import { Tooltip } from '@mantine/core';
import { ILogisticVedOrderResponse } from '@screens/logistic/ved/interfaces/LogisticVedOrder.response';
import css from './Info.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';

interface LogisticOrderVedCardInfoProps {
	order: ILogisticVedOrderResponse;
	access: string[];
}

export const LogisticOrderVedCardInfo = observer(({ order, access }: LogisticOrderVedCardInfoProps): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const createdAt = parseISO(order.createdAt);
	const updatedAt = parseISO(order.updatedAt);
	const dateDiff = differenceInDays(new Date(), updatedAt);

	return (
		<>
			<div>
				<TextField mode="paragraph" size="large" className={css.name}>
					{order.name}
				</TextField>

				{order.isModification ? <TextField className={css.isModification}>На доработке</TextField> : null}

				{order.author || order.performer ? (
					<div className={css.staff}>
						{order.author ? (
							<div className={css.author}>
								<Icon name="user" className={css.author__icon} />
								<TextField className={css.author__title}>Автор:</TextField>
								<Avatar
									size="extraSmall"
									color={order.author.color}
									text={order.author.lastName[0] + order.author.firstName[0]}
									src={order.author.photo}
									className={css.author__avatar}
								/>
								<Menu
									width={225}
									offset={-20}
									control={
										<span>
											<TextField className={css.author__name}>
												{order.author.lastName} {order.author.firstName}
											</TextField>
										</span>
									}
								>
									<MenuItemStaffUser data={order.author} />
								</Menu>
							</div>
						) : null}

						{order.performer ? (
							<div className={css.performer}>
								<Icon name="user" className={css.performer__icon} />
								<TextField className={css.performer__title}>Исполнитель:</TextField>
								<Avatar
									size="extraSmall"
									color={order.performer.color}
									text={order.performer.lastName[0] + order.performer.firstName[0]}
									src={order.performer.photo}
									className={css.performer__avatar}
								/>
								<Menu
									width={225}
									offset={-20}
									control={
										<span>
											<TextField className={css.performer__name}>
												{order.performer.lastName} {order.performer.firstName}
											</TextField>
										</span>
									}
								>
									<MenuItemStaffUser data={order.performer} />
								</Menu>
							</div>
						) : null}
					</div>
				) : null}

				<div className={css.dateInfo}>
					<div className={css.dateInfo__item}>
						<Icon name="calendar" className={css.dateInfo__icon} />
						<TextField className={css.dateInfo__key}>Дата создания заявки:</TextField>
						<TextField className={css.dateInfo__value}>
							{format(createdAt, 'd LLLL yyyy', { locale: customLocaleRu })}{' '}
							<span>
								({formatDistance(createdAt, new Date(), { locale: customLocaleRu, addSuffix: true })})
							</span>
						</TextField>
					</div>

					<div className={css.dateInfo__item}>
						<Icon name="time" className={css.dateInfo__icon} />
						<TextField className={css.dateInfo__key}>Последние действия:</TextField>
						<TextField
							className={cn({
								[css.dateInfo__value]: true,
								[css.dateInfo__value__warning]:
									order.stage &&
									dateDiff > order.stage.warningTime &&
									dateDiff <= order.stage.errorTime,
								[css.dateInfo__value__error]: order.stage && dateDiff > order.stage.errorTime,
							})}
						>
							{format(updatedAt, 'd LLLL yyyy', { locale: customLocaleRu })}{' '}
							<span>
								({formatDistance(updatedAt, new Date(), { locale: customLocaleRu, addSuffix: true })})
							</span>
						</TextField>
					</div>
				</div>
			</div>

			<div className={css.dateFiles}>
				<div className={css.dateFiles__item}>
					<Icon name="upload" className={css.dateFiles__icon} />
					<TextField className={css.dateFiles__key}>Файл заявки:</TextField>
					{order.fileOrder ? (
						<Tooltip
							label={'Скачать последнюю версию файла заявки'}
							withArrow
							openDelay={1000}
							transitionDuration={300}
						>
							<a
								href={`/api/static/${order.fileOrder}`}
								download={`Заявка ВЭД (${order.author.firstName}) ${format(createdAt, 'd LLLL yyyy', {
									locale: customLocaleRu,
								})}`}
								className={css.dateFiles__download}
							>
								<Icon name="excel" />
								скачать
							</a>
						</Tooltip>
					) : null}

					<Tooltip
						label={`Загрузить ${order.fileCalculate ? 'другую версию файла' : 'файл'} заявки`}
						withArrow
						openDelay={1000}
						transitionDuration={300}
					>
						<div>
							<TextField
								className={css.dateFiles__update}
								onClick={() => {
									logisticStore.setModalOrderStage('uploadFile', true);
									logisticStore.fileType = 'order';
								}}
							>
								<Icon name="upload-circle" /> загрузить {order.fileOrder ? 'другой' : null}
							</TextField>
						</div>
					</Tooltip>

					{order.fileOrder ? (
						<Tooltip
							label={'История работы над файлов заявки'}
							withArrow
							openDelay={1000}
							transitionDuration={300}
						>
							<div>
								<TextField
									className={css.dateFiles__history}
									onClick={() => {
										logisticStore.setModalOrderStage('fileHistory', true);
										logisticStore.fileType = 'order';
									}}
								>
									<Icon name="history" /> история
								</TextField>
							</div>
						</Tooltip>
					) : null}
				</div>

				<CheckAccessJSX
					accessRoles={access}
					content={
						<div className={css.dateFiles__item}>
							<Icon name="upload" className={css.dateFiles__icon} />
							<TextField className={css.dateFiles__key}>Файл расчетов:</TextField>
							{order.fileCalculate ? (
								<Tooltip
									label={'Скачать последнюю версию файла расчетов'}
									withArrow
									openDelay={1000}
									transitionDuration={300}
								>
									<a
										href={`/api/static/${order.fileCalculate}`}
										download={`Заявка ВЭД (${order.author.firstName}) ${format(
											createdAt,
											'yyyy-MM-dd'
										)} (расчет)`}
										className={css.dateFiles__download}
									>
										<Icon name="excel" />
										скачать
									</a>
								</Tooltip>
							) : null}

							<Tooltip
								label={`Загрузить ${order.fileCalculate ? 'другую версию файла' : 'файл'} расчетов`}
								withArrow
								openDelay={1000}
								transitionDuration={300}
							>
								<div>
									<TextField
										className={css.dateFiles__update}
										onClick={() => {
											logisticStore.setModalOrderStage('uploadFile', true);
											logisticStore.fileType = 'calculating';
										}}
									>
										<Icon name="upload-circle" /> загрузить {order.fileCalculate ? 'другой' : null}
									</TextField>
								</div>
							</Tooltip>

							{order.fileCalculate ? (
								<Tooltip
									label={'История работы над файлов заявки'}
									withArrow
									openDelay={1000}
									transitionDuration={300}
								>
									<div>
										<TextField
											className={css.dateFiles__history}
											onClick={() => {
												logisticStore.setModalOrderStage('fileHistory', true);
												logisticStore.fileType = 'calculating';
											}}
										>
											<Icon name="history" /> история
										</TextField>
									</div>
								</Tooltip>
							) : null}
						</div>
					}
				/>
			</div>
		</>
	);
});
