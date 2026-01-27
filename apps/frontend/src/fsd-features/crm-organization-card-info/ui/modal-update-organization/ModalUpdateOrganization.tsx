import { FC, FormEvent, useCallback, useEffect, useMemo } from 'react';
import { useUpdate, useValidate } from './lib';
import { CrmContactFormColor, CrmContactFormComment } from '@fsd/entities/crm-contact';
import { CrmEmailsForm } from '@fsd/entities/crm-email';
import {
	CrmOrganizationFormNameEn,
	CrmOrganizationFormNameRu,
	useCrmOrganizationGetCurrent,
} from '@fsd/entities/crm-organization';
import { CrmOrganizationFormUserId } from '@fsd/entities/crm-organization';
import { CrmOrganizationFormWebsite } from '@fsd/entities/crm-organization';
import { CrmOrganizationTagsForm } from '@fsd/entities/crm-organization-tag';
import { CrmOrganizationTypeFormType } from '@fsd/entities/crm-organization-type';
import { CrmPhonesForm } from '@fsd/entities/crm-phone';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { HelperValidate } from '@fsd/shared/lib/validate';
import { Button, Modal } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/use-actions';
import { IInitErrorUpdateOrganization, IInitFormUpdateOrganization } from '../../model/slice/org-card-info.slice.types';
import css from './modal-update-organization.module.scss';

type IHandleSetForm = { [key in keyof IInitFormUpdateOrganization]?: IInitFormUpdateOrganization[key] };
type IHandleSetError = { [key in keyof IInitErrorUpdateOrganization]?: IInitErrorUpdateOrganization[key] };

export const ModalUpdateOrganization: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const isLoading = useStateSelector((state) => state.crm_organization_card_info.isLoading);
	const isShowModal = useStateSelector((state) => state.crm_organization_card_info.modals.updateOrganization);
	const errors = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization);
	const hasErrors = !HelperValidate.isEmptyObject(errors);
	const validate = useValidate();
	const update = useUpdate();
	const actions = useActions();
	const [getCurrent] = useCrmOrganizationGetCurrent();
	const { getTeam } = useUser();
	const team = useMemo(() => getTeam() ?? [], [getTeam]);

	/* Form */
	const formNameEn = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.nameEn);
	const errNameEn = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.nameEn);
	const formNameRu = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.nameRu);
	const errNameRu = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.nameRu);
	const formUserId = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.userId);
	const errUserId = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.userId);
	const formTypeId = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.typeId);
	const errTypeId = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.typeId);
	const formPhones = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.phones);
	const errPhones = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.phones);
	const formEmails = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.emails);
	const errEmails = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.emails);
	const formWebsite = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.website);
	const errWebsite = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.website);
	const formTags = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.tags);
	const errTags = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.tags);
	const formComment = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.comment);
	const errComment = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.comment);
	const formColor = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.color);

	const handleSetForm = useCallback(
		(fields: IHandleSetForm) => {
			actions.setFormUpdateOrganization(fields);
		},
		[actions]
	);

	const handleSetError = useCallback(
		(fields: IHandleSetError) => {
			actions.setErrorUpdateOrganization(fields);
		},
		[actions]
	);

	const handleModalClose = useCallback(() => {
		actions.setModal(['updateOrganization', false]);
		actions.setLoading(false);
		actions.clearErrorUpdateOrganization();
	}, [actions]);

	const handleSave = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!current) {
				return;
			}
			actions.setLoading(true);

			if (!(await validate())) {
				actions.setLoading(false);
				return;
			}
			if (!(await update())) {
				actions.setLoading(false);
				return;
			}

			await getCurrent({ id: current.id });
			handleModalClose();
			actions.setLoading(false);
		},
		[actions, current, getCurrent, handleModalClose, update, validate]
	);

	useEffect(() => {
		if (isShowModal && current) {
			actions.setFormUpdateOrganization({
				nameEn: current.nameEn,
				nameRu: current.nameRu,
				userId: String(current.userId),
				typeId: String(current.typeId),
				website: current.website,
				comment: current.comment,
				color: current.color,
				tags: current.tags?.map((tag) => String(tag.id)),
				phones: current.phones?.length
					? current.phones.map(({ value, comment }) => ({ value, comment }))
					: [{ value: '', comment: '' }],
				emails: current.emails?.length
					? current.emails.map(({ value, comment }) => ({ value, comment }))
					: [{ value: '', comment: '' }],
			});
		}
	}, [isShowModal, current, actions]);

	return (
		<Modal
			title={'Изменение организации'}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isLoading}
			size={480}
		>
			<form onSubmit={handleSave}>
				<div className={css.form}>
					<CrmOrganizationFormNameEn
						value={formNameEn}
						error={errNameEn}
						onChange={(nameEn) => handleSetForm({ nameEn })}
						onError={(nameEn) => handleSetError({ nameEn })}
						required
					/>

					<CrmOrganizationFormNameRu
						value={formNameRu}
						error={errNameRu}
						onChange={(nameRu) => handleSetForm({ nameRu })}
						onError={(nameRu) => handleSetError({ nameRu })}
						required
					/>

					<CrmOrganizationFormUserId
						value={formUserId}
						error={errUserId}
						onChange={(value) => handleSetForm({ userId: value })}
						onError={(value) => handleSetError({ userId: value })}
						required
					/>

					<CrmOrganizationTypeFormType
						value={formTypeId}
						error={errTypeId}
						onChange={(value) => handleSetForm({ typeId: value })}
						onError={(value) => handleSetError({ typeId: value })}
						required
					/>

					<CrmPhonesForm
						value={formPhones}
						error={errPhones}
						onChange={(value) => handleSetForm({ phones: value })}
						onError={(value) => handleSetError({ phones: value })}
						ignorePhones={current?.phones?.map(({ value }) => value) || []}
					/>

					<CrmEmailsForm
						value={formEmails}
						error={errEmails}
						onChange={(value) => handleSetForm({ emails: value })}
						onError={(value) => handleSetError({ emails: value })}
						ignoreEmails={current?.emails?.map(({ value }) => value) || []}
					/>

					<CrmOrganizationFormWebsite
						value={formWebsite}
						error={errWebsite}
						onChange={(value) => handleSetForm({ website: value })}
						onError={(value) => handleSetError({ website: value })}
					/>

					<CrmOrganizationTagsForm
						value={formTags}
						error={errTags}
						onChange={(value) => handleSetForm({ tags: value })}
						onError={(value) => handleSetError({ tags: value })}
					/>

					{team.includes(current?.userId ?? 0) && (
						<CrmContactFormColor
							value={formColor as 'red'}
							error={errComment}
							onChange={(value) => handleSetForm({ color: value })}
							onError={(value) => handleSetError({ color: value })}
						/>
					)}

					<CrmContactFormComment
						value={formComment}
						error={errComment}
						onChange={(value) => handleSetForm({ comment: value })}
						onError={(value) => handleSetError({ comment: value })}
					/>
				</div>

				<Modal.Buttons>
					<Button onClick={handleModalClose}> Отмена </Button>

					<Button color={'primary'} variant={'hard'} type={'submit'} disabled={hasErrors}>
						{' '}
						Сохранить{' '}
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
