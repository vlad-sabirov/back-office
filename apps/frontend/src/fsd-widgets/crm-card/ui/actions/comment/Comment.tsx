import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CrmHistoryService, useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Tabs, Textarea } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { ICommentProps } from './comment.props';
import css from './comment.module.scss';

export const CommentPanel: FC<ICommentProps> = ({ index, disabled }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const historyConfig = useStateSelector((state) => state.crm_history.config);
	const createTarget = useMemo(() => {
		if (historyConfig.contactID.length > 0) {
			return { contactId: historyConfig.contactID[0] ?? 0 };
		}
		if (historyConfig.organizationID.length > 0) {
			return { organizationId: historyConfig.organizationID[0] ?? 0 };
		}
	}, [historyConfig]);
	const { userId } = useUserDeprecated();
	const form = useForm({ initialValues: { comment: '' } });
	const [create, { ...createProps }] = CrmHistoryService.create();
	const historyActions = useCrmHistoryActions();

	const onSubmit = useCallback(async () => {
		await create({
			type: 'comment',
			...createTarget,
			payload: form.values.comment,
			userId: userId || undefined,
			isSystem: false,
		});
		historyActions.reloadTimestamp();
	}, [create, createTarget, form.values.comment, historyActions, userId]);

	useEffect(() => {
		if (createProps.status === 'uninitialized') {
			return;
		}
		const status = FetchStatusConvert(createProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.status]);

	useEffect(() => {
		if (createProps.error) {
			showNotification({ color: 'red', message: 'Неизвестная ошибка' });
			form.setFieldError('comment', ' ');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.error, createProps.startedTimeStamp]);

	useEffect(() => {
		if (createProps.isSuccess) {
			showNotification({ color: 'green', message: 'Комментарий добавлен' });
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.fulfilledTimeStamp, createProps.isSuccess]);

	return (
		<Tabs.Panel value={index} className={css.panel}>
			<div className={css.wrapper}>
				<Textarea
					label={'Комментарий'}
					className={css.comment}
					disabled={disabled || isLoading}
					{...form.getInputProps('comment')}
				/>

				<Button
					color={'primary'}
					size={'large'}
					className={css.button}
					disabled={disabled || isLoading}
					onClick={onSubmit}
				>
					{' '}
					Добавить{' '}
				</Button>
			</div>
		</Tabs.Panel>
	);
};

export const CommentList: FC<ICommentProps> = ({ index, disabled }) => {
	return (
		<Tabs.Tab icon={<Icon name={'comment'} />} value={index} disabled={disabled}>
			{' '}
			Комментарий{' '}
		</Tabs.Tab>
	);
};
