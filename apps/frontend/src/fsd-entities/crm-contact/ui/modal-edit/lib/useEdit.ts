import { format, parse, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { filterByArray } from '@dsbasko/filter-by-array';
import { CrmContactService } from '@fsd/entities/crm-contact/model/service';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@helpers';
import { useUserDeprecated } from '@hooks';

export const useEdit = () => {
	const [editContact] = CrmContactService.edit();
	const [createHistory] = CrmHistoryService.create();
	const contactCurrent = useStateSelector((state) => state.crm_contact.data.current);
	const contactForm = useStateSelector((state) => state.crm_contact.forms.update.values);
	const staffSales = useStateSelector((state) => state.staff.data.sales);
	const { user } = useUserDeprecated();

	const exec = async (): Promise<boolean> => {
		try {
			await updateName();
			await updateUserId();
			await updateWorkPosition();
			await updateBirthday();
			await updateComment();
			await updatePhones();
			await updateEmails();
			return true;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
			return false;
		}
	};

	const updateName = async () => {
		if (contactCurrent?.name === contactForm.name) {
			return;
		}

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: { name: contactForm.name },
		});

		let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''} имя контакта`;
		valueString += ` с ${contactCurrent?.name} на ${contactForm.name}.`;
		createHistory({
			userId: String(user?.id ?? 0),
			contactId: contactCurrent?.id || 0,
			payload: valueString,
			type: 'log',
			isSystem: true,
		});
	};

	const updateUserId = async () => {
		if (String(contactCurrent?.userId) === contactForm.userId) {
			return;
		}

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: { userId: contactForm.userId },
		});

		const newUser = staffSales.find((user) => user.id === Number(contactForm.userId));
		let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''} ответственного`;
		valueString += ` с ${contactCurrent?.user?.lastName} ${contactCurrent?.user?.firstName}`;
		valueString += ` на ${newUser?.lastName} ${newUser?.firstName},`;
		valueString += ` для контакта ${contactCurrent?.name}.`;

		createHistory({
			userId: String(user?.id ?? 0),
			contactId: contactCurrent?.id || 0,
			payload: valueString,
			type: 'log',
			isSystem: true,
		});
	};

	const updateWorkPosition = async () => {
		if (contactCurrent?.workPosition === contactForm.workPosition) {
			return;
		}

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: { workPosition: contactForm.workPosition },
		});

		let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''} должность`;
		valueString += ` контакта ${contactCurrent?.name}`;
		valueString += ` с ${contactCurrent?.workPosition} на ${contactForm.workPosition}.`;
		createHistory({
			userId: String(user?.id ?? 0),
			contactId: contactCurrent?.id || 0,
			payload: valueString,
			type: 'log',
			isSystem: true,
		});
	};

	const updateBirthday = async () => {
		if (!contactCurrent || !contactCurrent.birthday) {
			return;
		}
		const oldBirthdayDate = parseISO(contactCurrent.birthday);
		const newBirthdayDate = parse(contactForm.birthday, 'yyyy-MM-dd', new Date());
		if (format(oldBirthdayDate, 'yyy-MM-dd') === format(newBirthdayDate, 'yyy-MM-dd')) {
			return;
		}

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: { birthday: format(newBirthdayDate, 'yyyy-MM-dd') },
		});

		let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''} дату рождения`;
		valueString += ` контакта ${contactCurrent?.name}`;
		valueString += ` с ${format(oldBirthdayDate, 'd LLLL yyyy', { locale: customLocaleRu })}г.`;
		valueString += ` на ${format(newBirthdayDate, 'd LLLL yyyy', { locale: customLocaleRu })}г.`;
		createHistory({
			userId: String(user?.id ?? 0),
			contactId: contactCurrent?.id || 0,
			payload: valueString,
			type: 'log',
			isSystem: true,
		});
	};

	const updateComment = async () => {
		if (contactCurrent?.comment === contactForm.comment) {
			return;
		}

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: { comment: contactForm.comment },
		});

		let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''} комментарий`;
		valueString += ` контакта ${contactCurrent?.name}`;
		valueString += ` с ${contactCurrent?.comment} на ${contactForm.comment}.`;
		createHistory({
			userId: String(user?.id ?? 0),
			contactId: contactCurrent?.id || 0,
			payload: valueString,
			type: 'log',
			isSystem: true,
		});
	};

	const updatePhones = async () => {
		if (JSON.stringify(contactCurrent?.phones) === JSON.stringify(contactForm.phones)) {
			return;
		}
		const newPhones = contactForm.phones.map((phone) => ({ value: phone.value, comment: phone.comment }));
		const oldPhones = contactCurrent?.phones?.map((phone) => ({ value: phone.value, comment: phone.comment }));

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: {},
			phonesDto: contactForm.phones.map((phone) => ({
				contactId: contactCurrent?.id || 0,
				type: 'contact',
				value: phone.value,
				comment: phone.comment,
			})),
		});

		const toAdd = filterByArray(newPhones, oldPhones, (one, two) => one.value !== two.value);
		if (toAdd.length) {
			for (const phone of toAdd) {
				if (!phone.value) {
					continue;
				}
				let valueString = `Добавил${user?.sex === 'female' ? 'а' : ''}`;
				valueString += ` телефон ${parsePhoneNumber(phone.value).output}`;
				valueString += ` для контакта ${contactCurrent?.name}`;

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: contactCurrent?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}
		}

		const toDelete = filterByArray(oldPhones, newPhones, (one, two) => one.value !== two.value);
		if (toDelete.length) {
			for (const phone of toDelete) {
				if (!phone.value) {
					continue;
				}
				let valueString = `Удалил${user?.sex === 'female' ? 'а' : ''}`;
				valueString += ` телефон ${parsePhoneNumber(phone.value).output}`;
				valueString += ` у контакта ${contactCurrent?.name}`;

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: contactCurrent?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}
		}

		const toEdit = filterByArray(
			newPhones,
			oldPhones,
			(first, second) => first.value === second.value && first.comment !== second.comment
		);
		if (toEdit.length) {
			for (const phone of toEdit) {
				if (!phone.value) {
					continue;
				}
				let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''}`;
				valueString += ` комментарий для телефона ${parsePhoneNumber(phone.value).output}`;
				valueString += ` с "${oldPhones?.find((item) => item.value === phone.value)?.comment}"`;
				valueString += ` на "${phone.comment}"`;
				valueString += ` у контакта ${contactCurrent?.name}`;

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: contactCurrent?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}
		}
	};

	const updateEmails = async () => {
		if (JSON.stringify(contactCurrent?.emails) === JSON.stringify(contactForm.emails)) {
			return;
		}
		const newEmails = contactForm.emails.map((email) => ({ value: email.value, comment: email.comment }));
		const oldEmails = contactCurrent?.emails?.map((email) => ({ value: email.value, comment: email.comment }));

		await editContact({
			id: contactCurrent?.id || 0,
			updateDto: {},
			emailsDto: contactForm.emails.map((email) => ({
				contactId: contactCurrent?.id || 0,
				type: 'contact',
				value: email.value,
				comment: email.comment,
			})),
		});

		const toAdd = filterByArray(newEmails, oldEmails, (one, two) => one.value !== two.value);
		if (toAdd.length) {
			for (const email of toAdd) {
				if (!email.value) {
					continue;
				}
				let valueString = `Добавил${user?.sex === 'female' ? 'а' : ''}`;
				valueString += ` почтовый ящик ${email.value}`;
				valueString += ` для контакта ${contactCurrent?.name}`;

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: contactCurrent?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}
		}

		const toDelete = filterByArray(oldEmails, newEmails, (one, two) => one.value !== two.value);
		if (toDelete.length) {
			for (const email of toDelete) {
				if (!email.value) {
					continue;
				}
				let valueString = `Удалил${user?.sex === 'female' ? 'а' : ''}`;
				valueString += ` почтовый ящик ${email.value}`;
				valueString += ` у контакта ${contactCurrent?.name}`;

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: contactCurrent?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}
		}

		const toEdit = filterByArray(
			newEmails,
			oldEmails,
			(first, second) => first.value === second.value && first.comment !== second.comment
		);
		if (toEdit.length) {
			for (const email of toEdit) {
				if (!email.value) {
					continue;
				}
				let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''}`;
				valueString += ` комментарий для почтового ящика ${email.value}`;
				valueString += ` с "${oldEmails?.find((item) => item.value === email.value)?.comment}"`;
				valueString += ` на "${email.comment}"`;
				valueString += ` у контакта ${contactCurrent?.name}`;

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: contactCurrent?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}
		}
	};

	return exec;
};
