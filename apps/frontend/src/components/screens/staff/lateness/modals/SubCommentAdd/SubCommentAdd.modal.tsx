import { FC, useEffect, useState } from 'react';
import { parseISO, set } from 'date-fns';
import Head from 'next/head';
import { Button, JsonPre, Modal, Textarea } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { LatenessCommentService, LatenessService } from '@services';
import { CommentAddModalForm, CommentAddModalProps } from '.';

const COMMIT_LENGTH = 5;

export const SubCommentAddModal: FC<CommentAddModalProps> = ({
	data,
	isOpen,
	setOpen,
	onSuccess,
	className,
	...props
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { userId } = useUserDeprecated();

	const form = useForm({
		initialValues: {
			comment: '',
			isSkipped: false,
		} as CommentAddModalForm,
	});

	useEffect(() => {
		if (data?.data?.length) form.setFieldValue('isSkipped', data.data[0].isSkipped);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	const handleClose = (): void => {
		setOpen(false);
		form.reset();
	};

	const handleForm = async (): Promise<void> => {
		if (!data || !data.data[0]) return;
		setIsLoading(true);
		let latenessId: number = data.data[0].id;
		const { comment } = form.values;

		if (comment.length < COMMIT_LENGTH) {
			setIsLoading(false);
			form.setFieldError('comment', 'Минимум 10 символов');
			return;
		}

		const [findComment] = await LatenessCommentService.findMany({
			where: { latenessId: latenessId, userId: userId || 0 },
		});

		if (findComment?.length) {
			setIsLoading(false);
			showNotification({
				color: 'red',
				message: 'Вы уже оставляли комментарий к этому опозданию',
			});
			handleClose();
			form.reset();
			return;
		}

		if (latenessId == 0) {
			// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
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

		const [, createCommentError] = await LatenessCommentService.create({
			createDto: {
				type: '',
				comment,
				userId: userId || 0,
				latenessId: latenessId,
			},
		});

		if (createCommentError) {
			showNotification({ color: 'red', message: createCommentError.message });
			return;
		}

		onSuccess?.();
		showNotification({ color: 'green', message: 'Комментарий добавлен' });
		handleClose();
		setIsLoading(false);
		form.reset();
	};

	return (
		<Modal title="Добавление комментария" opened={isOpen} onClose={handleClose} size={480} loading={isLoading}>
			<Head>
				<title>Добавление комментария</title>
			</Head>
			<form className={className} onSubmit={form.onSubmit(handleForm)} {...props}>
				<Textarea label={'Комментарий'} {...form.getInputProps('comment')} required />

				{/*<JsonPre data={{ lateness: data?.data, form: form.values }} />*/}
				<JsonPre data={{ data: data?.data }} />

				<Modal.Buttons>
					<Button onClick={handleClose}>Отмена</Button>
					<Button
						color={'primary'}
						variant={'hard'}
						type={'submit'}
						disabled={form.values.comment.length < COMMIT_LENGTH}
					>
						Добавить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
