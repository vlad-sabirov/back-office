import { FC, useCallback, useEffect, useState } from 'react';
import { IWhatIfProps } from './what-if.types';
import { Button, Icon, InputNumber, Modal, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import css from './what-if.module.scss';

export const WhatIf: FC<IWhatIfProps> = (props) => {
	const { report, isOpen, setIsOpen } = props;
	const [realization, setRealization] = useState<number>(0);
	const [realizationDiff, setRealizationDiff] = useState<number>(0);
	const [customerShipment, setCustomerShipment] = useState<number>(0);
	const [deep, setDeep] = useState<number>(0);
	const [check, setCheck] = useState<number>(0);
	const [currentDeep, setCurrentDeep] = useState<number>(0);
	const [currentCheck, setCurrentCheck] = useState<number>(0);

	const handleModalClose = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const handleReset = () => {
		if (!report) return;

		if (report.realization) setRealization(report.realization);
		if (report.customerShipment) setCustomerShipment(report.customerShipment);
		if (report.customerShipment) setCustomerShipment(report.customerShipment);

		if (report.customerShipment && report.shipmentCount) {
			const deep = Math.round((report.shipmentCount / report.customerShipment) * 10) / 10;
			setDeep(deep);
			setCurrentDeep(deep);
		}

		if (report.realization && report.shipmentCount) {
			const check = Math.round(report.realization / report.shipmentCount);
			setCheck(check);
			setCurrentCheck(check);
		}
	};

	const handleRealizationDiff = () => {
		if (report && report.realization && report.customerShipment) {
			const isCurrent =
				deep === currentDeep && check === currentCheck && customerShipment === report.customerShipment;
			let realizationNew: number = Math.round((customerShipment * deep * check) / 1000000) * 1000000;
			if (isNaN(realizationNew)) realizationNew = 0;
			setRealization(!isCurrent ? realizationNew : report.realization);
			if (report.realization) setRealizationDiff(!isCurrent ? realizationNew - report.realization : 0);
		}
	};

	useEffect(handleRealizationDiff, [customerShipment, deep, check, report, currentDeep, currentCheck]);
	useEffect(handleReset, [report]);

	return (
		<Modal title="Что если?" opened={isOpen} onClose={handleModalClose} size={640}>
			<div className={css.wrapper}>
				<div className={css.information}>
					<div className={css.information__actual}>
						<TextField>Актуальные цифры:</TextField>
						<TextField size="small">
							Реализация: <span>{NumberFormat(report?.realization || 0)}</span>
						</TextField>

						<TextField size="small">
							План: <span>{NumberFormat(report?.plan || 0)}</span>
						</TextField>

						<br />

						<TextField size="small">
							Организаций отгрузилось: <span>{NumberFormat(report?.customerShipment || 0)}</span>
						</TextField>

						<TextField size="small">
							Всего отгрузок: <span>{NumberFormat(report?.shipmentCount || 0)}</span>
						</TextField>

						<br />

						<TextField size="small">
							Средний чек: <span>{NumberFormat(report?.averageOrderValue)}</span>
						</TextField>

						<TextField size="small">
							Сделок на организацию: <span>{report?.depthOfSales}</span>
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
