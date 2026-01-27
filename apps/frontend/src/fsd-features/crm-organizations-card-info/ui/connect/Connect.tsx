import { FC, useCallback } from 'react';
import { capitalize } from 'lodash';
import { ICrmOrganizationEntity, ICrmOrganizationFormEntity } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/useActions/useActions';
import { ICardInfo } from '../card-info/card-info.types';
import css from './connect.module.scss';

export const Connect: FC<ICardInfo> = ({ changeField, onChange, value: values }) => {
	const actions = useActions();
	const findData = useStateSelector((state) => state.crm_organizations_card_info.find.data);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleClose = useCallback(() => {
		actions.setShowModal(['add', false]);
	}, [actions]);

	const handleChangeFindInput = useCallback(() => {
		actions.setFindStatus('form');
		actions.setFindData([]);
	}, [actions]);

	const handleConnect = useCallback(
		(valueItem: ICrmOrganizationEntity) => {
			const value: ICrmOrganizationFormEntity[] = values ? values : [];

			value.push({
				type: 'connected',
				id: String(valueItem.id),
				nameEn: valueItem.nameEn,
				nameRu: valueItem.nameRu,
				website: valueItem.website,
				comment: valueItem.comment,
				userId: String(valueItem.userId),
				typeId: String(valueItem.typeId),
				phones: valueItem.phones?.map((item) => ({
					value: parsePhoneNumber(item.value).output,
					comment: item.comment || '',
				})),
				emails: valueItem.emails?.map((item) => ({
					value: item.value,
					comment: item.comment || '',
				})),
				requisites: valueItem.requisites?.map((item) => ({
					id: String(item.id),
					name: item.name,
					inn: String(item.inn),
					code1c: String(item.code1c),
					type: 'created',
				})),
			});

			onChange({ field: changeField, error: '', value });
			actions.setShowModal(['add', false]);
		},
		[values, onChange, changeField, actions]
	);

	return (
		<>
			<TextField className={css.topDescription} size={'small'}>
				Ниже представлен список организаций, которые соответствуют Вашему запросу. Выберете нужную организацию,
				что-бы прикрепить к контакту.
			</TextField>

			<div className={css.wrapper}>
				{findData.map((item) => {
					return (
						<div
							key={item.id}
							className={css.item}
							onClick={() => {
								handleConnect(item);
							}}
						>
							<div className={css.item__left}>
								<TextField className={css.name}>
									{item.nameEn} ({item.nameRu})
								</TextField>

								{item.type && (
									<TextField className={css.type} size={'small'}>
										{capitalize(item.type.name)}
									</TextField>
								)}

								{item.requisites && item.requisites.length > 0 && (
									<TextField className={css.inn} size={'small'}>
										ИНН:
										{item.requisites.map((requisite, index) => (
											<span key={requisite.inn}>
												{index > 0 && ' ,'}
												{' ' + requisite.inn}
											</span>
										))}
									</TextField>
								)}

								{item.phones && item.phones.length > 1 && (
									<TextField className={css.phone} size={'small'}>
										{item.phones.map((phone, index) => (
											<span key={phone.value}>
												{index > 0 && ' ,'}
												{' ' + parsePhoneNumber(phone.value).output}
											</span>
										))}
									</TextField>
								)}
							</div>
							<div className={css.item__right}>
								<Icon name={'link'} />
							</div>
						</div>
					);
				})}
			</div>

			<TextField className={css.footerDescription} size={'small'}>
				Если Вы не нашли то что искали, возможно нужно изменить параметры поиска или организация еще не
				добавлена в систему.
			</TextField>

			<Modal.Buttons>
				<Button onClick={handleClose}> Отмена </Button>

				<Button
					color={'info'}
					variant={'hard'}
					iconLeft={<Icon name={'edit'} />}
					onClick={handleChangeFindInput}
				>
					{' '}
					Изменить параметры поиска{' '}
				</Button>
			</Modal.Buttons>
		</>
	);
};
