import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import { Button, Modal, Textarea } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { LatenessService } from '@services';
import { CommentEditProps } from '.';
import css from './comment-edit.module.scss';

const COMMENT_LENGTH = 4;

export const CommentEditModal: FC<CommentEditProps> = ({ data, isOpen, setOpen, className, onSuccess, ...props }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const form = useForm({
		initialValues: {
			comment: '' as string,
		},
	});

	useEffect(() => {
		if (data && data.data && data.data.length) form.setFieldValue('comment', data.data[0].comment);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isOpen]);

	const handleClose = (): void => {
		setOpen(false);
		form.reset();
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		if (!data.data[0]) return;
		const { comment } = form.values;
		const { id } = data.data[0];

		if (comment.length < COMMENT_LENGTH) {
			showNotification({ message: 'Минимум 4 символа', color: 'red' });
			form.setFieldError('comment', 'Минимум 4 символа');
			setIsLoading(false);
			return;
		}

		const [findLatenessResponse, findLatenessError] = await LatenessService.findById(id);
		if (findLatenessError) {
			showNotification({ message: findLatenessError.message, color: 'red' });
			setIsLoading(false);
			return;
		}
		if (!findLatenessResponse) {
			showNotification({ message: 'Вы пытаетесь изменить несуществующий комментарий', color: 'red' });
			setIsLoading(false);
			return;
		}

		const [, updateError] = await LatenessService.updateById({ id, updateDto: { comment } });
		if (updateError) {
			showNotification({ message: updateError.message, color: 'red' });
			setIsLoading(false);
			return;
		}

		onSuccess?.();
		showNotification({ message: 'Изменения сохранены', color: 'green' });
		setIsLoading(false);
		handleClose();
	};

	return (
		<Modal title="Изменение комментария" opened={isOpen} onClose={handleClose} size={480} loading={isLoading}>
			<Head>
				<title>Изменение комментария</title>
			</Head>

			<form className={className} onSubmit={form.onSubmit(handleSubmit)} {...props}>
				<div className={css.wrapper}>
					<Textarea label={'Комментарий'} required {...form.getInputProps('comment')} />
				</div>

				<Modal.Buttons>
					<Button onClick={handleClose}>Отмена</Button>
					<Button color={'primary'} variant={'hard'} type={'submit'}>
						Сохранить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
