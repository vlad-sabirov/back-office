import { FC, useEffect, useState } from 'react';
import { Button, Icon, InputNumber, Modal, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import { RealizationConfigurationProps } from './props';
import css from './styles.module.scss';

export const RealizationConfiguration: FC<RealizationConfigurationProps> = ({ ...props }) => {
	const { current, opened, setOpened } = props;
	const [realization, setRealization] = useState<number>(0);
	const [realizationDiff, setRealizationDiff] = useState<number>(0);
	const [customerShipment, setCustomerShipment] = useState<number>(0);
	const [deep, setDeep] = useState<number>(0);
	const [check, setCheck] = useState<number>(0);
	const [currentDeep, setCurrentDeep] = useState<number>(0);
	const [currentCheck, setCurrentCheck] = useState<number>(0);

	const handleModalClose = () => {
		setOpened(false);
	};

	const handleReset = () => {
		if (current) {
			if (current.realization) setRealization(current?.realization);
			if (current.customerShipment) setCustomerShipment(current?.customerShipment);
			if (current.customerShipment) setCustomerShipment(current?.customerShipment);

			if (current.customerShipment && current.shipmentCount) {
				const deep = Math.round((current.shipmentCount / current.customerShipment) * 10) / 10;
				setDeep(deep);
				setCurrentDeep(deep);
			}

			if (current.realization && current.shipmentCount) {
				const check = Math.round(current.realization / current.shipmentCount);
				setCheck(check);
				setCurrentCheck(check);
			}
		}
	};

	const handleRealizationDiff = () => {
		if (current && current.realization && current.customerShipment) {
			const isCurrent =
				deep === currentDeep && check === currentCheck && customerShipment === current.customerShipment;
			let realizationNew: number = Math.round((customerShipment * deep * check) / 1000000) * 1000000;
			if (isNaN(realizationNew)) realizationNew = 0;
			setRealization(!isCurrent ? realizationNew : current.realization);
			if (current?.realization) setRealizationDiff(!isCurrent ? realizationNew - current?.realization : 0);
		}
	};

	useEffect(handleRealizationDiff, [customerShipment, deep, check, current, currentDeep, currentCheck]);
	useEffect(handleReset, [current]);

	return (
		<Modal title="Что если?" opened={opened} onClose={handleModalClose} size={640}>
			<div className={css.wrapper}>
				<div className={css.information}>
					<div className={css.information__actual}>
						<TextField>Актуальные цифры:</TextField>
						<TextField size="small">
							Реализация: <span>{NumberFormat(current?.realization || 0)}</span>
						</TextField>

						<TextField size="small">
							План: <span>{NumberFormat(current?.plan || 0)}</span>
						</TextField>

						<br />

						<TextField size="small">
							Организаций отгрузилось: <span>{NumberFormat(current?.customerShipment || 0)}</span>
						</TextField>

						<TextField size="small">
							Всего отгрузок: <span>{NumberFormat(current?.shipmentCount || 0)}</span>
						</TextField>

						<br />

						<TextField size="small">
							Средний чек: <span>{NumberFormat(currentCheck)}</span>
						</TextField>

						<TextField size="small">
							Сделок на организацию: <span>{currentDeep}</span>
						</TextField>
					</div>
				</div>

				<div className={css.configuration}>
					<div className={css.realization}>
						<TextField className={css.realization__label}>Планируемая реализация</TextField>
						<TextField size="large" className={css.realization__calculate}>
							{realization > 0 ? `${NumberFormat(realization)}` : `Меньше 1млн`}
							{!!realizationDiff && NumberFormat(realizationDiff, { operator: true, sup: true })}
						</TextField>
					</div>

					<InputNumber
						label={'Отгружено'}
						value={customerShipment}
						onChange={(value) => setCustomerShipment(Number(value))}
						className={css.customerShipment}
					/>

					<InputNumber
						label={'Глубина'}
						step={0.1}
						precision={1}
						value={deep}
						onChange={(value) => setDeep(Number(value))}
						className={css.deep}
					/>

					<InputNumber
						label={'Средний чек'}
						step={100000}
						value={check}
						onChange={(value) => setCheck(Number(value))}
						className={css.check}
					/>
				</div>
			</div>

			<Modal.Buttons>
				<Button color="warning" variant="hard" onClick={handleReset} iconLeft={<Icon name={'history'} />}>
					Сбросить
				</Button>
				<Button onClick={handleModalClose}>Отмена</Button>
			</Modal.Buttons>
		</Modal>
	);
};
