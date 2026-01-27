/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, useState } from 'react';
import { parse } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { Button, Progress, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import {
	MutationCrmContactRequest,
	MutationCrmEmailRequest,
	MutationCrmOrganizationRequest,
	MutationCrmOrganizationRequisiteRequest,
	MutationCrmPhoneRequest,
} from '@interfaces';
import {
	CrmContactService,
	CrmEmailService,
	CrmOrganizationRequisiteService,
	CrmOrganizationService,
	CrmOrganizationTypeService,
	CrmPhoneService,
} from '@services';
import { UploadT } from '.';
import css from './upload.module.scss';

type UploadResultT = {
	count: number;
	done: number;
	percent: number;
};

export const Upload: FC<UploadT> = observer(({ organizations, contacts, ...props }) => {
	const { staffStore } = useContext(MainContext);
	const [result, setResult] = useState<UploadResultT | null>();
	const [errors, setErrors] = useState<any[]>([]);
	const [createHistory] = CrmHistoryService.create();

	const handleUpload = async () => {
		if (!contacts || !organizations) return;
		const count = organizations.length + contacts.length;

		// Добавление организаций
		for (const organization of organizations) {
			const name = organization['Название организации'].trim();
			const website = organization['Вебсайт'].trim();
			const comment = organization['Комментарий'].trim();
			const type = organization['Сфера деятельности'].trim();
			const inn = organization['ИНН'].trim();
			const code1c = organization['Код 1С'].trim();
			const phones = organization['Телефон'].trim().split('|');
			const emails = organization['Почта'].trim().split('|');

			let userId: number | undefined = undefined;
			if (organization['Ответственный'].length > 0) {
				const [lastName, firstName] = organization['Ответственный'].trim().split(' ');
				const foundUser = staffStore.userList.find(
					(user) => user.lastName === lastName && user.firstName === firstName
				);
				if (foundUser) userId = foundUser.id;
			}

			let typeId: number | undefined = undefined;
			if (type.length > 3) {
				const [foundType] = await CrmOrganizationTypeService.findOnce({
					where: { name: type },
				});
				if (foundType) typeId = foundType.id;
			}

			const createDto: MutationCrmOrganizationRequest = {
				name,
				firstDocument: new Date().getTime().toString(),
				website,
				comment,
				userId,
				typeId,
				isVerified: true,
				isReserve: false,
				isArchive: false,
			};

			const [resOrg, errOrg] = await CrmOrganizationService.create({ createDto });
			if (errOrg) {
				setErrors((old) => (old ? [...old, { errOrg, createDto }] : [{ errOrg, createDto }]));
				continue;
			}
			if (!resOrg) {
				continue;
			}

			// Добавление реквизитов
			const requisiteDto: MutationCrmOrganizationRequisiteRequest = {
				name,
				inn,
				code1c,
				organizationId: resOrg.id,
			};
			const [, errReq] = await CrmOrganizationRequisiteService.create({ createDto: requisiteDto });
			if (errReq) {
				setErrors((old) => (old ? [...old, { errReq, requisiteDto }] : [{ errReq, requisiteDto }]));
			}

			// Добавление телефонов
			for (const phone of phones) {
				if (!phone) continue;
				const phoneDto: MutationCrmPhoneRequest = {
					value: phone.trim(),
					type: 'organization',
					organizationId: resOrg.id,
				};
				const [, errPhone] = await CrmPhoneService.create({ createDto: phoneDto });
				if (errPhone) {
					setErrors((old) => (old ? [...old, { errPhone, phoneDto }] : [{ errPhone, phoneDto }]));
				}
			}

			// Добавление почтовых ящиков
			for (const email of emails) {
				if (!email) continue;
				const emailDto: MutationCrmEmailRequest = {
					value: email.trim(),
					type: 'organization',
					organizationId: resOrg.id,
				};
				const [, errEmail] = await CrmEmailService.create({ createDto: emailDto });
				if (errEmail) {
					setErrors((old) => (old ? [...old, { errEmail, emailDto }] : [{ errEmail, emailDto }]));
				}
			}

			await createHistory({
				type: 'log',
				payload: 'Добавил организацию ' + resOrg.nameEn,
				userId: 1,
				organizationId: resOrg.id,
				isSystem: true,
			});

			setResult((old) => ({
				count,
				done: old?.done ? old.done + 1 : 1,
				percent: Math.round(((old?.done ? old.done + 1 : 1) / count) * 1000) / 10,
			}));
		}

		// Добавление контактов
		for (const contact of contacts) {
			const name = contact['ФИО'].trim();
			const birthday = contact['День рождения'].trim();
			const workPosition = contact['Должность'].trim();
			const orgName = contact['Название организации'].trim();
			const user = contact['Ответственный'].trim();
			const phones = contact['Телефон'].trim().split('|');
			const emails = contact['Почта'].trim().split('|');
			const comment = contact['Комментарий'].trim();

			let userId: number | undefined = undefined;
			if (user.length > 0) {
				const [lastName, firstName] = user.split(' ');
				const foundUser = staffStore.userList.find(
					(user) => user.lastName === lastName && user.firstName === firstName
				);
				if (foundUser) userId = foundUser.id;
			}

			const createDto: MutationCrmContactRequest = {
				name,
				workPosition,
				birthday: birthday ? parse(birthday, 'yyyy-MM-dd', new Date()) : undefined,
				comment,
				userId,
				isVerified: true,
				isArchive: false,
			};

			const [resContact, errContact] = await CrmContactService.create({ createDto });
			if (errContact) {
				setErrors((old) => (old ? [...old, { errContact, createDto }] : [{ errContact, createDto }]));
				continue;
			}
			if (!resContact) {
				continue;
			}

			// Прикрепление организации
			if (orgName.length > 0) {
				const [foundOrg] = await CrmOrganizationService.findOnce({
					where: { name: orgName },
				});
				if (foundOrg) {
					const connectDto = { organizationId: foundOrg.id, contactIds: [resContact.id] };
					const [, errConnect] = await CrmOrganizationService.connectContactsById(connectDto);
					if (errConnect) {
						setErrors((old) => (old ? [...old, { errConnect, connectDto }] : [{ errConnect, connectDto }]));
					}
				}
			}

			// Добавление телефонов
			for (const phone of phones) {
				if (!phone) continue;
				const phoneDto: MutationCrmPhoneRequest = {
					value: phone.trim(),
					type: 'contact',
					contactId: resContact.id,
				};
				const [, errPhone] = await CrmPhoneService.create({ createDto: phoneDto });
				if (errPhone) {
					setErrors((old) => (old ? [...old, { errPhone, phoneDto }] : [{ errPhone, phoneDto }]));
				}
			}

			// Добавление почтовых ящиков
			for (const email of emails) {
				if (!email) continue;
				const emailDto: MutationCrmEmailRequest = {
					value: email.trim(),
					type: 'contact',
					contactId: resContact.id,
				};
				const [, errEmail] = await CrmEmailService.create({ createDto: emailDto });
				if (errEmail) {
					setErrors((old) => (old ? [...old, { errEmail, emailDto }] : [{ errEmail, emailDto }]));
				}
			}

			await createHistory({
				type: 'log',
				payload: 'Добавил контакт ' + resContact.name,
				userId: 1,
				contactId: resContact.id,
				isSystem: true,
			});

			setResult((old) => ({
				count,
				done: old?.done ? old.done + 1 : 1,
				percent: Math.round(((old?.done ? old.done + 1 : 1) / count) * 1000) / 10,
			}));
		}
	};

	if (!result) return <Button onClick={handleUpload}>Бля точно? Обратного пути не будет...</Button>;
	return (
		<div className={css.wrapper} {...props}>
			<TextField>
				Прогресс: {result.done}/{result.count} ({result.percent}%)
			</TextField>
			<Progress value={result.percent} />

			{errors.length > 0 && <pre className={css.errors}>{JSON.stringify(errors, null, 2)}</pre>}
		</div>
	);
});
