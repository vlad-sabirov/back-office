import { FC, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useCrmCardShowContact } from '@fsd/entities/crm-card';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Header } from '@fsd/shared/ui-kit';
import { CrmContactAddDrawer } from '@fsd/widgets/crm-contact-add-drawer';
import { CrmContactFilter } from '@fsd/widgets/crm-contact-filter';
import { CrmContactHeaderNavigation } from '@fsd/widgets/crm-contact-header-navigation';
import { ContactRightSide } from '@fsd/widgets/crm-contact-right-side/ui/ContactRightSide';
import { CrmContactTableList } from '@fsd/widgets/crm-contact-table-list';

const CrmContactPage: FC = () => {
	const status = useStateSelector((state) => state.crm_contact.status.list);
	const isLoading = useMemo(() => FetchStatusIsLoading([status]), [status]);

	const [fetchFindCont] = CrmContactService.getCurrentById();
	const { query } = useRouter();
	const showContact = useCrmCardShowContact();

	useEffect(() => {
		if (!query.id) return;
		(async () => {
			const response = await fetchFindCont({ id: query.id as string });
			if (!('data' in response)) return;
			showContact({ id: query.id as string });
		})();
	}, [fetchFindCont, query.id, showContact]);

	return (
		<div>
			<Header
				title={'Контакты'}
				loading={isLoading}
				contentLeft={<CrmContactFilter loading={isLoading} />}
				contentCenter={<CrmContactHeaderNavigation />}
				contentRight={<ContactRightSide loading={isLoading} />}
			/>
			<CrmContactTableList loading={isLoading} />
			<CrmContactAddDrawer loading={isLoading} />
		</div>
	);
};

export default CrmContactPage;
