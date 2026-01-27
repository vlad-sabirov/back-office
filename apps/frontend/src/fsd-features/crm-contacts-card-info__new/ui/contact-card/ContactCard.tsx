import { FC, useCallback } from 'react';
import { IContactCardProps } from './contact-card.types';
import cn from 'classnames';
import { useCrmCardShowContact } from '@fsd/entities/crm-card';
import { ICrmContactFormEntity } from '@fsd/entities/crm-contact/entity';
import { CallTo } from '@fsd/entities/voip';
import { TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { useActions } from '../../lib/use-actions';
import { DisconnectModal } from '../disconnect-modal/DisconnectModal';
import { SearchModal } from '../search-modal/SearchModal';
import { UpdateModal } from '../update-modal/UpdateModal';
import css from './contact-card.module.scss';

export const ContactCard: FC<IContactCardProps> = (props) => {
	const {
		data,
		dataPhones,
		dataEmails,
		required,
		onCreate,
		onConnect,
		onUpdate,
		onDisconnect,
		canOpenCard,
		displayPhones,
		displayWorkPosition,
	} = props;
	const actions = useActions();
	const showContact = useCrmCardShowContact();

	const handleShowModalAdd = useCallback(() => {
		actions.setModal(['search', true]);
	}, [actions]);

	const handleShowModalUpdate = useCallback(
		(contact: ICrmContactFormEntity) => {
			actions.setCurrent(contact);
			actions.setModal(['update', true]);
		},
		[actions]
	);

	const handleShowModalDisconnect = useCallback(
		(contact: ICrmContactFormEntity) => {
			actions.setCurrent(contact);
			actions.setModal(['disconnect', true]);
		},
		[actions]
	);

	const handleOpenContactCard = useCallback(
		async (id: number | string) => {
			await showContact({ id });
		},
		[showContact]
	);

	return (
		<div className={css.wrapper}>
			<TextField size={'large'} className={css.heading}>
				{' '}
				Контакты {required && <span className={css.required}>*</span>}{' '}
			</TextField>

			{!!data.length && (
				<div className={css.contacts}>
					{data.map((contact) => (
						<div className={css.contact} key={contact.id}>
							<TextField
								className={cn(css.contactName, { [css.contactName__clickable]: canOpenCard })}
								size={'small'}
								onClick={() => canOpenCard && handleOpenContactCard(contact.id)}
							>
								{' '}
								{contact.name}{' '}
							</TextField>

							{displayWorkPosition && (
								<TextField className={css.contactWorkPosition} size={'small'}>
									{' '}
									{contact.workPosition}{' '}
								</TextField>
							)}

							{displayPhones && (
								<TextField className={css.contactPhones} size={'small'}>
									{' '}
									{contact.phones.map((phone) => {
										const parsedPhone = parsePhoneNumber(phone.value);
										return (
											<div style={{ textDecoration: 'none' }} key={phone.value}>
												{/*{index !== 0*/}
												{/*	? <>, <span>{parsedPhone.output}</span></>*/}
												{/*	: <span>{parsedPhone.output}</span>}*/}
												<CallTo
													callToPhone={parsedPhone.output}
													callToName={contact.name}
													offset={-2}
												>
													<div className={css.phoneMany}>
														<span>{parsedPhone.output}</span> {phone.comment}
													</div>
												</CallTo>
											</div>
										);
									})}{' '}
								</TextField>
							)}

							<div className={css.contactLinks}>
								{contact.type === 'create' && (
									<TextField
										className={css.contactDisconnect}
										size={'small'}
										onClick={() => handleShowModalUpdate(contact)}
									>
										{' '}
										изменить{' '}
									</TextField>
								)}

								{!!onDisconnect && (
									<TextField
										className={css.contactDisconnect}
										size={'small'}
										onClick={() => handleShowModalDisconnect(contact)}
									>
										{' '}
										открепить{' '}
									</TextField>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{onCreate && onConnect && (
				<TextField className={css.add} onClick={handleShowModalAdd}>
					{' '}
					Добавить{' '}
				</TextField>
			)}

			<SearchModal
				data={data}
				dataPhones={dataPhones}
				dataEmails={dataEmails}
				onCreate={onCreate}
				onConnect={onConnect}
			/>

			<UpdateModal data={data} dataPhones={dataPhones} dataEmails={dataEmails} onUpdate={onUpdate} />

			<DisconnectModal onDisconnect={onDisconnect} />
		</div>
	);
};
