import { FC, useCallback } from 'react';
import { ICrmContactEntity } from '@fsd/entities/crm-contact';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { useActions } from '../../lib/use-actions';
import { ISearchConnectProps } from './search-connect.props';
import css from './search-connect.module.scss';

export const SearchConnect: FC<ISearchConnectProps> = (props) => {
	const { onConnect, onClose } = props;
	const data = useStateSelector((state) => state.crm_contact_card_info.searchResult);
	const actions = useActions();

	const handleCreate = useCallback(() => {
		actions.setSearchStep('create');
	}, [actions]);

	const handleBack = useCallback(() => {
		actions.setSearchStep('search');
	}, [actions]);

	const handleContactConnect = useCallback(
		({ id, name, workPosition, birthday, comment, phones, emails }: ICrmContactEntity) => {
			onConnect?.({
				id,
				name,
				comment,
				workPosition,
				birthday,
				emails:
					emails?.map((email) => ({
						value: email.value,
						comment: email.comment ?? '',
					})) ?? [],
				phones:
					phones?.map((phone) => ({
						value: phone.value,
						comment: phone.comment ?? '',
					})) ?? [],
				type: 'connect',
			});
			onClose?.();
		},
		[onClose, onConnect]
	);

	return (
		<>
			<TextField className={css.description} size={'small'}>
				Ниже представлен список контактов, которые соответствуют Вашему запросу. Выберете нужный контакт, что-бы
				прикрепить его к организации.
			</TextField>

			<div className={css.result}>
				{data.map((contact) => {
					return (
						<div
							key={contact.id}
							className={css.contactWrapper}
							onClick={() => handleContactConnect(contact)}
						>
							<div className={css.contactInfo}>
								<TextField className={css.name}>{contact.name}</TextField>

								<TextField className={css.workPosition} size={'small'}>
									{contact.workPosition}
								</TextField>

								{!!contact?.phones?.length && (
									<TextField size={'small'} className={css.phones}>
										{contact.phones?.map((phone, index) => {
											const value = parsePhoneNumber(phone.value).output;
											return (
												<>
													{index != 0 && ', '}
													{value}
												</>
											);
										})}
									</TextField>
								)}

								{!!contact?.organizations?.length && (
									<>
										<TextField className={css.organizationsTitle} size={'small'}>
											{contact.organizations?.length > 1 ? 'Организации' : 'Организация'}:
										</TextField>

										{contact.organizations?.map((organization) => (
											<TextField
												className={css.organizationsItem}
												size={'small'}
												key={organization.id}
											>
												{' '}
												{organization.nameEn} ({organization.nameRu})
											</TextField>
										))}
									</>
								)}
							</div>
							<div className={css.contactConnect}>
								<Icon name={'link'} />
							</div>
						</div>
					);
				})}
			</div>

			<TextField className={css.description} size={'small'}>
				Если Вы не нашли то что искали, возможно нужно изменить параметры поиска или контакт еще не добавлен в
				систему.
			</TextField>

			<Modal.Buttons>
				<Button onClick={handleBack}> Назад </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					onClick={handleCreate}
					iconLeft={<Icon name={'plus-medium'} />}
				>
					{' '}
					Добавить новый{' '}
				</Button>
			</Modal.Buttons>
		</>
	);
};
