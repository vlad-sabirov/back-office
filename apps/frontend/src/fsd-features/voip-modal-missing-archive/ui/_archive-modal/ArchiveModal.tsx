import { FC, useCallback } from 'react';
import classNames from 'classnames';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { CallTo } from '@fsd/entities/voip';
import { IArchiveModalProps } from '@fsd/features/voip-modal-missing-archive/ui/_archive-modal/archive-modal.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Modal, TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import css from './archive-modal.module.scss';

export const ArchiveModal: FC<IArchiveModalProps> = (props) => {
	const { calls, isOpen, setIsOpen } = props;
	const staff = useStateSelector((state) => state.staff.data.voip);
	const org = useStateSelector((state) => state.crm_organization.data.voip);
	const cont = useStateSelector((state) => state.crm_contact.data.voip);
	const showOrg = useCrmCardShowOrganization();
	const showCont = useCrmCardShowContact();

	const handleModalClose = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	return (
		<Modal title={'Архив за 30 дней'} size={600} opened={isOpen} onClose={handleModalClose}>
			{calls.map((call) => {
				const date = format(parseISO(call.timestamp), 'd MMMM, HH:ii', { locale: customLocaleRu });

				const callerPhone = parsePhoneNumber(call.caller);

				let callerName = callerPhone.output;
				let callerType: 'staff' | 'organization' | 'contact' | 'other' = 'other';

				if (staff[callerPhone.clear]) {
					callerType = 'staff';
					callerName = `${staff[callerPhone.clear].name}`;
				} else if (org[callerPhone.clear]) {
					callerType = 'organization';
					callerName = `${org[callerPhone.clear].name}`;
				} else if (cont[callerPhone.clear]) {
					callerType = 'contact';
					callerName = `${cont[callerPhone.clear].name}`;
				}

				return (
					<div key={call.uuid} className={css.call}>
						<TextField className={css.date}>{date}</TextField>

						<TextField
							className={classNames(css.callerName, {
								[css.pointer]: callerType === 'contact' || callerType === 'organization',
							})}
							onClick={() => {
								if (callerType === 'organization') {
									showOrg({ id: org[callerPhone.clear].id });
									handleModalClose();
								}
								if (callerType === 'contact') {
									showCont({ id: cont[callerPhone.clear].id });
									handleModalClose();
								}
							}}
						>
							{callerName}
						</TextField>

						<CallTo callToPhone={callerPhone.clear} callToName={callerName} offset={-2}>
							<TextField className={classNames(css.callerPhone, css.pointer)}>
								{callerPhone.output}
							</TextField>
						</CallTo>
					</div>
				);
			})}
		</Modal>
	);
};
