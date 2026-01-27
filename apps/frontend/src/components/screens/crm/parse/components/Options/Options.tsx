/* eslint-disable max-len */
import { Button, TextField } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import { OptionsProps } from '.';
import { ParseStoreAnalyzeTypeT } from '../../parse.store';
import css from './options.module.scss';

export const Options: FC<OptionsProps> = (
	{ organizations1C, organizationsBitrix, contactsBitrix, onSuccess, ...props }
) => {

	const handleClick = (type: ParseStoreAnalyzeTypeT) => { onSuccess(type); }

	return (
		<div className={css.wrapper} {...props}>

			{organizationsBitrix && (<div>
				<TextField mode={'heading'} size={'small'}>Организации</TextField>
				<Button onClick={() => handleClick('phoneOrganizations')}>Номера</Button>
				<Button onClick={() => handleClick('emailOrganizations')}>Почтовые ящики</Button>
				<Button onClick={() => handleClick('websiteOrganizations')}>Веб-сайты</Button>
				<Button onClick={() => handleClick('innOrganizations')}>ИНН</Button>
				<Button onClick={() => handleClick('innDuplicateOrganizations')}>ИНН дубликаты</Button>
				<Button onClick={() => handleClick('notFoundUserOrganizations')}>Не найден ответственный</Button>
			</div>)}

			{contactsBitrix && (<div>
				<TextField mode={'heading'} size={'small'}>Контакты</TextField>
				<Button onClick={() => handleClick('nameContacts')}>Короткие ФИО</Button>
				<Button onClick={() => handleClick('workPositionContacts')}>Должности</Button>
				<Button onClick={() => handleClick('phoneContacts')}>Телефоны</Button>
				<Button onClick={() => handleClick('emailContacts')}>Почтовые ящики</Button>
				<Button onClick={() => handleClick('notFoundUserContacts')}>Не найден ответственный</Button>
			</div>)}
			
			{organizationsBitrix && (organizations1C || contactsBitrix) && (<div>
				<TextField mode={'heading'} size={'small'}>Общее</TextField>
				{organizations1C && organizationsBitrix && (
					<Button onClick={() => handleClick('user')}>Несовпадения ответственных</Button>
				)}
				{organizationsBitrix && contactsBitrix && (
					<Button onClick={() => handleClick('phoneDuplicate')}>Дубликаты телефонов</Button>
				)}
				{organizationsBitrix && contactsBitrix && (
					<Button onClick={() => handleClick('emailDuplicate')}>Дубликаты почтовых ящиков</Button>
				)}
				{organizationsBitrix && contactsBitrix && (
					<Button onClick={() => handleClick('notFundOrganizationName')}>Не найдены организации в контактах</Button>
				)}
			</div>)}

			{organizationsBitrix && (organizations1C || contactsBitrix) && (<div>
				{organizations1C && organizationsBitrix && (
					<Button onClick={() => handleClick('oldNewOrganizations')}>Несовпадения ответственных [организации]</Button>
				)}

				{organizations1C && contactsBitrix && (
					<Button onClick={() => handleClick('oldNewContacts')}>Несовпадения ответственных [контакты]</Button>
				)}
			</div>)}

			{organizationsBitrix && contactsBitrix && (
				<div>
					<Button
						color={'error'}
						variant={'hard'}
						onClick={() => handleClick('pizdetsNahuiPblay')}
					> Загрузить. Не нажимать иначе пиздец базе! </Button>
				</div>
			)}
		</div>
	);
};
