import { FC, useEffect, useState } from 'react';
import { Item } from './Item';
import cn from 'classnames';
import Head from 'next/head';
import { Alert, Icon, Modal } from '@fsd/shared/ui-kit';
import { VacationService } from '@screens/staff/vacation';
import { DidComePerDayModalProps } from '.';
import css from './did-come-per-day.module.scss';

export const DidComePerDayModal: FC<DidComePerDayModalProps> = ({
	date,
	data,
	isOpen,
	setOpen,
	className,
	...props
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [vacationUsers, setVacationUsers] = useState<number[]>([]);

	const handleClose = (): void => setOpen(false);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		(async () => {
			const [vacations] = await VacationService.findBetweenDateRange({ start: date, end: date });
			if (isMounted && vacations?.length) setVacationUsers(vacations?.map((vacation) => vacation.userId));
			if (isMounted) setIsLoading(false);
		})();

		return () => {
			isMounted = false;
		};
	}, [date]);

	return (
		<Modal title="Не пришли на работу" opened={isOpen} onClose={handleClose} size={480} loading={isLoading}>
			<Head>
				<title>Не пришли на работу</title>
			</Head>
			<div className={cn(css.wrapper, className)} {...props}>
				<Alert
					title="Важно!"
					body="Данные о последнем входе актуальны только относительно текущей даты."
					variant="outline"
					color="warning"
					size="medium"
					icon={<Icon name="alert" />}
					className={css.alert}
				/>

				{data.length
					? data.map((data) => <Item data={data} vacationUsers={vacationUsers} key={data.user.id} />)
					: undefined}
			</div>
		</Modal>
	);
};
