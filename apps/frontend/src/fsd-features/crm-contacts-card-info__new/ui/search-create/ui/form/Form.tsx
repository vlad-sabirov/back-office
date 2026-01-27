import { FC } from 'react';
import { IForm } from './form.types';
import { CrmContactFormName, CrmContactFormUserId, CrmContactFormWorkPosition } from '@fsd/entities/crm-contact';
import { CrmContactFormBirthday, CrmContactFormComment } from '@fsd/entities/crm-contact';
import { CrmEmailsForm } from '@fsd/entities/crm-email';
import { CrmPhonesForm } from '@fsd/entities/crm-phone';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useActions } from '../../../../lib/use-actions';
import css from './form.module.scss';

export const Form: FC<IForm> = (props) => {
	const { data, dataPhones, dataEmails } = props;
	const actions = useActions();
	const users = useStateSelector((state) => state.staff.data.sales);

	const name = useStateSelector((state) => state.crm_contact_card_info.forms.create.name);
	const nameErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.name);
	const workPosition = useStateSelector((state) => state.crm_contact_card_info.forms.create.workPosition);
	const workPositionErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.workPosition);
	const phones = useStateSelector((state) => state.crm_contact_card_info.forms.create.phones);
	const phonesErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.phones);
	const emails = useStateSelector((state) => state.crm_contact_card_info.forms.create.emails);
	const emailsErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.emails);
	const birthday = useStateSelector((state) => state.crm_contact_card_info.forms.create.birthday);
	const birthdayErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.birthday);
	const userId = useStateSelector((state) => state.crm_contact_card_info.forms.create.userId);
	const userIdErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.userId);
	const comment = useStateSelector((state) => state.crm_contact_card_info.forms.create.comment);
	const commentErr = useStateSelector((state) => state.crm_contact_card_info.errors.create.comment);

	return (
		<div className={css.wrapper}>
			<CrmContactFormName
				value={name}
				error={nameErr}
				onChange={(name) => actions.setCreateForm({ name })}
				onError={(name) => actions.setCreateError({ name })}
				className={css.name}
				required
			/>

			<CrmContactFormWorkPosition
				value={workPosition}
				error={workPositionErr}
				onChange={(workPosition) => actions.setCreateForm({ workPosition })}
				onError={(workPosition) => actions.setCreateError({ workPosition })}
				className={css.workPosition}
				required
			/>

			<CrmPhonesForm
				value={phones}
				error={phonesErr}
				data={[...data.flatMap((item) => item.phones), ...(dataPhones ?? [])]}
				onChange={(phones) => actions.setCreateForm({ phones })}
				onError={(phones) => actions.setCreateError({ phones })}
				className={css.phones}
				required
			/>

			<CrmEmailsForm
				value={emails}
				error={emailsErr}
				data={[...data.flatMap((item) => item.emails), ...(dataEmails ?? [])]}
				onChange={(emails) => actions.setCreateForm({ emails })}
				onError={(emails) => actions.setCreateError({ emails })}
				className={css.emails}
			/>

			<CrmContactFormBirthday
				value={birthday}
				error={birthdayErr}
				onChange={(birthday) => actions.setCreateForm({ birthday })}
				onError={(birthday) => actions.setCreateError({ birthday })}
				className={css.birthday}
			/>

			<CrmContactFormUserId
				value={userId}
				error={userIdErr}
				onChange={(userId) => actions.setCreateForm({ userId })}
				onError={(userId) => actions.setCreateError({ userId })}
				users={users}
				className={css.userId}
				required
			/>

			<CrmContactFormComment
				value={comment}
				error={commentErr}
				onChange={(comment) => actions.setCreateForm({ comment })}
				onError={(comment) => actions.setCreateError({ comment })}
				className={css.comment}
			/>
		</div>
	);
};
