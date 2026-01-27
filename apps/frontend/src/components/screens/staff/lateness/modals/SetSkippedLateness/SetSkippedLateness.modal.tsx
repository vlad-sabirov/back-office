import { FC, useState } from 'react';
import { parseISO, set } from 'date-fns';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { LatenessService } from '@services';
import { SetSkippedLatenessModalProps } from '.';
import css from './set-skipped-lateness.module.scss';

export const SetSkippedLatenessModal: FC<SetSkippedLatenessModalProps> = ({
	data,
	isOpen,
	setOpen,
	onSuccess,
	className,
	...props
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleClose = (): void => {
		setIsLoading(false);
		setOpen(false);
	};

	const handleSubmit = async (value: boolean) => {
		if (!data?.data?.length) return;
		setIsLoading(true);
		let latenessId: number = data.data[0].id;

		if (latenessId === 0) {
			const [createdLateness] = await LatenessService.create({
				createDto: {
					userId: data.user.id || 0,
					type: 'in',
					comment: '',
					isSkipped: false,
					metaInfo: '',
					createdAt: set(parseISO(data.data[0].dateISO), {
						hours: 12,
						minutes: 0,
						seconds: 0,
						milliseconds: 0,
					}),
				},
			});
			if (createdLateness?.id) latenessId = createdLateness.id;
		}

		const [, errorUpdate] = await LatenessService.updateById({ id: latenessId, updateDto: { isSkipped: value } });
		if (errorUpdate) {
			showNotification({ color: 'red', message: errorUpdate.message });
			setIsLoading(false);
			return;
		}

		onSuccess?.();
		showNotification({ color: 'green', message: 'Изменения сохранены' });
		handleClose();
	};

	return (
		<Modal title="Не учитывать?" opened={isOpen} onClose={handleClose} size={400} loading={isLoading}>
			<Head>
				<title>Не учитывать?</title>
			</Head>
			<div className={className} {...props}>
				<TextField>
					Если вы укажите что этот отчет о посещаемости не нужно учитывать, то он не будет учитываться в
					итоговом подсчете часов опоздания.
				</TextField>

				<div className={css.buttons}>
					<Button
						color="error"
						iconLeft={<Icon name={'time-clean'} />}
						onClick={() => {
							handleSubmit(true);
						}}
					>
						Не учитывать
					</Button>

					<Button
						color="success"
						iconLeft={<Icon name={'time'} />}
						onClick={() => {
							handleSubmit(false);
						}}
					>
						Учитывать
					</Button>
				</div>
			</div>
		</Modal>
	);
};
