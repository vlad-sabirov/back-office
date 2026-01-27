import { FC, useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { Button, Modal, Textarea } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { LatenessContext } from '@screens/staff/lateness';
import { LatenessCommentService } from '@services';
import { CommentEditModalForm, CommentEditModalProps } from '.';

const COMMIT_LENGTH = 5;

export const SubCommentEditModal: FC<CommentEditModalProps> = ({
	data,
	commentID,
	isOpen,
	setOpen,
	onSuccess,
	className,
	...props
}) => {
	const latenessStore = useContext(LatenessContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { userId } = useUserDeprecated();

	const form = useForm({
		initialValues: {
			comment: '',
		} as CommentEditModalForm,
	});

	useEffect(() => {
		if (!latenessStore) return;
		const comment = data?.data?.[0].comments?.find((item) => item.id === commentID);
		if (comment) form.setFieldValue('comment', comment.comment);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, commentID, latenessStore]);

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	const handleSubmit = async (): Promise<void> => {
		if (!data || !data.data?.length) return;
		setIsLoading(true);
		const latenessId: number = data.data[0].id;
		const { comment } = form.values;

		if (comment.length < COMMIT_LENGTH) {
			setIsLoading(false);
			form.setFieldError('comment', 'Минимум 10 символов');
			return;
		}

		const [findComment] = await LatenessCommentService.findMany({
			where: { latenessId: latenessId, userId: userId || 0 },
		});

		if (!findComment?.length) {
			setIsLoading(false);
			showNotification({
				color: 'red',
				message: 'Вы пытаетесь изменить несуществующий комментарий',
			});
			handleClose();
			form.reset();
			return;
		}

		const [, updateCommentError] = await LatenessCommentService.updateById({
			id: commentID,
			updateDto: { comment },
		});

		if (updateCommentError) {
			showNotification({ color: 'red', message: updateCommentError.message });
			return;
		}

		onSuccess?.();
		showNotification({ color: 'green', message: 'Комментарий изменен' });
		handleClose();
		setIsLoading(false);
		form.reset();
	};

	return (
		<Modal title="Изменение комментария" opened={isOpen} onClose={handleClose} size={480} loading={isLoading}>
			<Head>
				<title>Изменение комментария</title>
			</Head>
			<form className={className} onSubmit={form.onSubmit(handleSubmit)} {...props}>
				<Textarea label={'Комментарий'} {...form.getInputProps('comment')} required />

				<Modal.Buttons>
					<Button onClick={handleClose}>Отмена</Button>
					<Button
						color={'primary'}
						variant={'hard'}
						type={'submit'}
						disabled={form.values.comment.length < COMMIT_LENGTH}
					>
						Изменить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
