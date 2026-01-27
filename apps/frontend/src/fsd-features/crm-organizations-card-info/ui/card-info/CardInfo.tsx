import { FC, useCallback } from 'react';
import { ICardInfo } from './card-info.types';
import cn from 'classnames';
import { useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { CallTo } from '@fsd/entities/voip';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { TextField } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/useActions/useActions';
import { AddModal } from '../add-modal/AddModal';
import { DisconnectModal } from '../disconnect-modal/Disconnect';
import css from './card-info.module.scss';

export const CardInfo: FC<ICardInfo> = (props) => {
	const { value: values, required, error } = props;
	const { isAdd, isConnect, isActions } = props;
	const { isDisplayInn, isDisplayEmails, isDisplayPhones } = props;
	const actions = useActions();
	const showOrg = useCrmCardShowOrganization();

	const handleShowModalAdd = useCallback(() => {
		actions.setShowModal(['add', true]);
		actions.setFindForm(['name', '']);
		actions.setFindForm(['phone', '']);
		actions.setFindForm(['inn', '']);
		actions.setFindStatus('form');
	}, [actions]);

	const handleShowModalDisconnect = useCallback(
		(id: number | string) => {
			actions.setShowModal(['disconnect', true]);
			actions.setDisconnectCurrentId(id);
		},
		[actions]
	);

	const handleShowOrganizationCard = useCallback(
		(id: number | string) => {
			showOrg({ id });
		},
		[showOrg]
	);

	return (
		<div className={css.wrapper}>
			<TextField className={css.title} size={'large'}>
				Организаци{values && values.length > 1 ? 'и' : 'я'}
				{required && <span> *</span>}
			</TextField>

			{!!error?.length && <TextField className={css.error}>{error}</TextField>}

			<div className={css.list}>
				{values?.map((item) => {
					return (
						<div key={item.id} className={css.item}>
							<TextField
								size={'small'}
								className={cn(css.name, { [css.isAction]: isActions })}
								onClick={() => (isActions ? handleShowOrganizationCard(item.id) : null)}
							>
								{' '}
								{item.nameEn} ({item.nameRu})
							</TextField>

							{isDisplayInn && !!item.requisites?.length && (
								<TextField className={css.inn} size={'small'}>
									ИНН:
									<span>
										{' '}
										{item.requisites.map((requisite, index) => {
											if (index !== 0) return ', ' + requisite.inn;
											return requisite.inn;
										})}
									</span>
								</TextField>
							)}

							{isDisplayPhones && !!item.phones?.length && item.phones?.length === 1 && (
								<TextField className={css.phone} size={'small'}>
									{'Телефон: '}
									<span className={cn({ [css.isAction]: isActions })}>
										{parsePhoneNumber(item.phones?.[0].value).output}
									</span>
									{' ' + item.phones?.[0].comment}
								</TextField>
							)}

							{isDisplayPhones && !!item.phones?.length && item.phones?.length > 1 && (
								<>
									<TextField className={css.phone} size={'small'}>
										Телефоны:
									</TextField>

									{item.phones?.map((phone) => (
										<TextField
											key={phone.value}
											className={cn(css.phone, css.phoneMany)}
											size={'small'}
										>
											<p>
												<CallTo
													callToPhone={phone.value}
													callToName={`${item.nameEn} (${item.nameRu})`}
													offset={-2}
												>
													<span className={cn({ [css.isAction]: isActions })}>
														{parsePhoneNumber(phone.value).output}
													</span>
												</CallTo>
												{' ' + phone.comment}
											</p>
										</TextField>
									))}
								</>
							)}

							{isDisplayEmails && !!item.emails?.length && item.emails?.length === 1 && (
								<TextField className={css.email} size={'small'}>
									{'Почтовый ящик: '}
									<span className={cn({ [css.isAction]: isActions })}>{item.emails?.[0].value}</span>
									{' ' + item.emails?.[0].comment}
								</TextField>
							)}

							{isDisplayEmails && !!item.emails?.length && item.emails?.length > 1 && (
								<>
									<TextField className={css.email} size={'small'}>
										Почтовые ящики:
									</TextField>

									{item.emails?.map((email) => (
										<TextField
											key={email.value}
											className={cn(css.email, css.emailMany)}
											size={'small'}
										>
											<span className={cn({ [css.isAction]: isActions })}>{email.value}</span>
											{' ' + email.comment}
										</TextField>
									))}
								</>
							)}

							{isConnect && (
								<div className={css.actions}>
									{isConnect &&
										item.type === 'connected' &&
										(!required || (required && values.length > 1)) && (
											<TextField
												size={'small'}
												onClick={() => handleShowModalDisconnect(item.id)}
											>
												{' '}
												открепить{' '}
											</TextField>
										)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{isAdd && (
				<TextField className={css.add} size={'small'} onClick={handleShowModalAdd}>
					{' '}
					Добавить{' '}
				</TextField>
			)}

			<AddModal {...props} />
			<DisconnectModal {...props} />
		</div>
	);
};
