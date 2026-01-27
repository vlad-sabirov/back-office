import { FC, FormEvent, useEffect, useState } from 'react';
import * as Form from './forms';
import * as lodash from 'lodash';
import { trim } from 'lodash';
import Head from 'next/head';
import { Button, Modal } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import * as Types from '.';
import css from './requisite-edit-modal.module.scss';

export const RequisiteEditModal: FC<Types.RequisiteEditModalT> = ({
	current,
	opened,
	setOpened,
	onSuccess,
	hasData,
	...props
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm<Types.RequisiteEditFormT>({
		initialValues: {
			index: '',
			name: '',
			inn: '',
			code1c: '',
		},
	});

	const handleModalClose = () => {
		setOpened(false);
		if (!opened) form.reset();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsLoading(true);
		const { name, inn, index, code1c } = form.values;

		const isValidate = await Form.validateAll({ form, hasData });
		if (!isValidate) {
			setIsLoading(false);
			return;
		}

		onSuccess({
			index,
			name: trim(name),
			inn: inn.replace(/\D/g, ''),
			code1c: trim(code1c),
		});
		setIsLoading(false);
		handleModalClose();
	};

	useEffect(() => {
		if (!current) return;
		form.setValues(current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current, opened]);

	return (
		<>
			{opened && (
				<Head>
					<title>Изменение реквизита</title>
				</Head>
			)}
			<Modal
				title={'Изменение реквизита'}
				size={420}
				opened={opened}
				onClose={handleModalClose}
				loading={isLoading}
			>
				<form className={css.wrapper} onSubmit={handleSubmit} {...props}>
					<div className={css.form}>
						<Form.Name form={form} hasData={hasData} />
						<Form.Inn form={form} hasData={hasData} />
					</div>
					<Modal.Buttons>
						<Button onClick={handleModalClose}> Отмена </Button>

						<Button
							color={'primary'}
							variant={'hard'}
							type={'submit'}
							disabled={!lodash.isEmpty(form.errors)}
						>
							{' '}
							Сохранить{' '}
						</Button>
					</Modal.Buttons>
				</form>
			</Modal>
		</>
	);
};
