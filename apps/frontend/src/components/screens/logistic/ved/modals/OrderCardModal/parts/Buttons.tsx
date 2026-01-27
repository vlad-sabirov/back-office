import { useContext } from 'react';
import { LogisticOrderVedCardButtonsRework } from './buttonState/Rework';
import { LogisticOrderVedCardButtonsReworkComplete } from './buttonState/ReworkComplete';
import { LogisticOrderVedCardButtonsToClosed } from './buttonState/ToClosed';
import { LogisticOrderVedCardAcceptIntoWorkComplete } from './buttonState/acceptIntoWorkComplete';
import { LogisticOrderVedCardCalculateComplete } from './buttonState/calculateComplete';
import { LogisticOrderVedCardContractingComplete } from './buttonState/contractingComplete';
import { LogisticOrderVedCardDeliveryComplete } from './buttonState/deliveryComplete';
import { LogisticOrderVedCardinWorkComplete } from './buttonState/inWorkComplete';
import { observer } from 'mobx-react-lite';
import { TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import css from './Buttons.module.scss';

interface LogisticOrderVedCardButtons {
	stageId: number;
	stageAlias: string;
}

export const LogisticOrderVedCardButtons = observer(
	({ stageId, stageAlias }: LogisticOrderVedCardButtons): JSX.Element => {
		const { logisticStore } = useContext(MainContext);
		const CheckAccess = useAccess();

		if (stageId && stageAlias) {
			let result: JSX.Element;
			const defaultButtons: JSX.Element = (
				<>
					{!logisticStore.logisticVedOrderCurrent?.isModification &&
					!logisticStore.logisticVedOrderCurrent?.isClose &&
					!logisticStore.logisticVedOrderCurrent?.isDone &&
					CheckAccess(['logisticVedOrdersVed', 'developer', 'boss']) ? (
						<>
							<LogisticOrderVedCardButtonsRework />
						</>
					) : null}

					{!logisticStore.logisticVedOrderCurrent?.isClose &&
					!logisticStore.logisticVedOrderCurrent?.isDone ? (
						<LogisticOrderVedCardButtonsToClosed />
					) : null}
				</>
			);

			switch (stageAlias) {
				case 'acceptIntoWork':
					result = (
						<>
							<div className={css.buttons}>
								{CheckAccess(['logisticVedOrdersVed', 'developer', 'boss']) &&
								!logisticStore.logisticVedOrderCurrent?.isModification &&
								!logisticStore.logisticVedOrderCurrent?.isClose &&
								!logisticStore.logisticVedOrderCurrent?.isDone ? (
									<LogisticOrderVedCardAcceptIntoWorkComplete />
								) : null}
								{defaultButtons}
							</div>

							<TextField size="small" className={css.description}>
								{CheckAccess(['logisticVedOrdersVed', 'developer', 'boss'])
									? `Назначив ответственного, вы принимаете то, что заявка заполнена правильно. ` +
									`После чего она будет автоматически переведена на стадию "в работе".`
									: `Ожидание проверки заявки ВЭД отделом. Как только заявка будет проверена, ` +
									`к ней будет прикреплен сотрудник отдела ВЭД.`}
							</TextField>
						</>
					);
					break;

				case 'inWork':
					result = (
						<>
							<div className={css.buttons}>
								{CheckAccess(['logisticVedOrdersVed', 'developer', 'boss']) &&
								!logisticStore.logisticVedOrderCurrent?.isModification &&
								!logisticStore.logisticVedOrderCurrent?.isClose &&
								!logisticStore.logisticVedOrderCurrent?.isDone ? (
									<LogisticOrderVedCardinWorkComplete />
								) : null}
								{defaultButtons}
							</div>

							<TextField size="small" className={css.description}>
								{CheckAccess(['logisticVedOrdersVed', 'developer', 'boss'])
									? // eslint-disable-next-line max-len
										`Прежде чем нажать на зеленую кнопку, которая передвинет заявку на следующую стадию, ` +
										`необходимо загрузить файл с расчетами в форму выше.`
									: // eslint-disable-next-line max-len
										`Ожидание проработки заявки. На данный момент, отдел ВЭД ведет активную работу по ` +
										`проработке позиций этой заявки. Как только работа будет завершена, заявка ` +
										`автоматически перейдет на следующий этап.`}
							</TextField>
						</>
					);
					break;

				case 'calculate':
					result = (
						<>
							<div className={css.buttons}>
								{CheckAccess(['developer', 'boss', 'logisticVedOrdersCalculate']) &&
								!logisticStore.logisticVedOrderCurrent?.isModification &&
								!logisticStore.logisticVedOrderCurrent?.isClose &&
								!logisticStore.logisticVedOrderCurrent?.isDone ? (
									<LogisticOrderVedCardCalculateComplete />
								) : null}
								{defaultButtons}
							</div>

							<TextField size="small" className={css.description}>
								{CheckAccess(['developer', 'boss', 'logisticVedOrdersCalculate'])
									? // eslint-disable-next-line max-len
										'Прежде чем нажать на зеленую кнопку, которая передвинет заявку на следующую стадию, ' +
										'необходимо скачать файл заявки, внести изменения и загрузить его в обратно. ' +
										'Только после этого можно сдвинуть заявку на следующую стадию.'
									: // eslint-disable-next-line max-len
										'Ожидание расчета стоимости. На данный момент, руководство уже получило цены от ' +
									// eslint-disable-next-line max-len
										'отдела ВЭД и рассчитывает итоговую стоимость позиций. Как только работа будет завершена, ' +
										'заявка автоматически перейдет на следующую стадию и вы получите оповещение.'}
							</TextField>
						</>
					);
					break;

				case 'contracting':
					result = (
						<>
							<div className={css.buttons}>
								{CheckAccess(['developer', 'boss', 'logisticVedOrdersAuthor']) &&
								!logisticStore.logisticVedOrderCurrent?.isModification &&
								!logisticStore.logisticVedOrderCurrent?.isClose &&
								!logisticStore.logisticVedOrderCurrent?.isDone ? (
									<LogisticOrderVedCardContractingComplete />
								) : null}
								{defaultButtons}
							</div>

							<TextField size="small" className={css.description}>
								{CheckAccess(['developer', 'boss', 'logisticVedOrdersAuthor'])
									? 'Заключите контакт с клиентом, пусть клиент его оплатит, ' +
										'и только тогда передвигайте заявку в стадию доставки.'
									: 'Ожидание оплаты по договору. Как только клиент произведет ' +
										'оплату, заявка передвинется на стадию доставки'}
							</TextField>
						</>
					);
					break;

				case 'delivery':
					result = (
						<>
							<div className={css.buttons}>
								{CheckAccess(['developer', 'boss', 'logisticVedOrdersVed']) &&
								!logisticStore.logisticVedOrderCurrent?.isModification &&
								!logisticStore.logisticVedOrderCurrent?.isClose &&
								!logisticStore.logisticVedOrderCurrent?.isDone ? (
									<LogisticOrderVedCardDeliveryComplete />
								) : null}
								{defaultButtons}
							</div>

							<TextField size="small" className={css.description}>
								{CheckAccess(['developer', 'boss', 'logisticVedOrdersAuthor'])
									? `Завершите заявку как только товар прибудет на склад.`
									: `Ожидайте доставку`}
							</TextField>
						</>
					);
					break;

				default:
					result = <div className={css.buttons}>{defaultButtons}</div>;
					break;
			}

			if (logisticStore.logisticVedOrderCurrent?.isModification) {
				result = (
					<>
						<div className={css.buttons}>
							{CheckAccess(['logisticVedOrdersAuthor']) ? (
								<LogisticOrderVedCardButtonsReworkComplete />
							) : null}
							{defaultButtons}
						</div>

						<TextField size="small" className={css.description}>
							{CheckAccess(['logisticVedOrdersAuthor'])
								? // eslint-disable-next-line max-len
									'Ваша заявка была отправлена на доработку. С причиной того почему заявка была отклонена, ' +
									// eslint-disable-next-line max-len
									'можно ознакомиться в комментариях ниже. От Вас требуется изменить excel файл заявки, загрузить ' +
									'его в систему и нажать кнопку "Заявка доработана".'
								: `Ожидание доработки заявки.`}
						</TextField>
					</>
				);
			}

			if (logisticStore.logisticVedOrderCurrent?.isClose) {
				result = (
					<TextField mode="heading" className={css.isClose__text}>
						Заявка закрыта!
					</TextField>
				);
			}

			if (logisticStore.logisticVedOrderCurrent?.isDone) {
				result = (
					<TextField mode="heading" className={css.isDone__text}>
						Работа по заявке окончена
					</TextField>
				);
			}

			return <div className={css.root}>{result}</div>;
		}

		return <></>;
	}
);
