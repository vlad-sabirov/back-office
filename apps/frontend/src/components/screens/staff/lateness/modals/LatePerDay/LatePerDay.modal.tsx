import { FC, useState } from 'react';
import { Item } from './Item';
import cn from 'classnames';
import Head from 'next/head';
import { Modal } from '@fsd/shared/ui-kit';
import { LatePerDayModalProps } from '.';
import css from './late-per-day.module.scss';

export const LatePerDayModal: FC<LatePerDayModalProps> = ({ data, isOpen, setOpen, className, ...props }) => {
	const [isLoading] = useState<boolean>(false);
	const handleClose = (): void => setOpen(false);

	return (
		<Modal title="Опоздавшие" opened={isOpen} onClose={handleClose} size={520} loading={isLoading}>
			<Head>
				<title>Опоздавшие</title>
			</Head>
			<div className={cn(css.wrapper, className)} {...props}>
				{data.map((item) => (
					<Item key={item.user.id} data={item} />
				))}
			</div>
		</Modal>
	);
};
