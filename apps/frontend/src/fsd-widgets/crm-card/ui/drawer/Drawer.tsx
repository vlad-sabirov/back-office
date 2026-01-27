import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { AccessDenied } from './AccessDenied';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { CrmCardActions } from '@fsd/entities/crm-card';
import { CrmContactConst } from '@fsd/entities/crm-contact';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';
import { Drawer as UIDrawer } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Actions } from '../actions/Actions';
import { Header } from '../header/Header';
import { History } from '../history/History';
import { LeftSide } from '../left-side/LeftSide';
import css from './drawer.module.scss';

const Drawer: FC = () => {
	const cardActions = useStateActions(CrmCardActions);
	const title = useStateSelector((state) => state.crm_card.title);
	const isShow = useStateSelector((state) => state.crm_card.isShow);
	const isLoading = useStateSelector((state) => state.crm_card.isLoading);
	const isFetching = useStateSelector((state) => state.crm_card.isFetching);
	const isUpdate = useStateSelector((state) => state.crm_card.isUpdate);
	const dataCont = useStateSelector((state) => state.crm_contact.data.current);
	const dataOrg = useStateSelector((state) => state.crm_organization.data.current);
	const type = useStateSelector((state) => state.crm_card.type);
	const { team, rolesAlias } = useUserDeprecated();
	const [isAccessDenied, setIsAccessDenied] = useState<boolean>(false);
	const historyActions = useCrmHistoryActions();
	const { push, pathname, query } = useRouter();

	const orgHref = useMemo<string>(() => {
		return `${window.location.protocol}//${window.location.host}/crm/organization/${dataOrg?.id}`;
	}, [dataOrg]);

	const contHref = useMemo<string>(() => {
		return `${window.location.protocol}//${window.location.host}/crm/contacts/${dataCont?.id}`;
	}, [dataCont]);

	const displayTitle = useMemo(() => {
		if (isLoading) {
			return 'Загрузка...';
		}
		if (title) {
			return title;
		}
		return '';
	}, [title, isLoading]);

	const handleClone = useCallback(() => {
		cardActions.setIsShow(false);
		cardActions.setIsLoading(false);
		cardActions.setType(null);
		cardActions.setTitle(null);
		historyActions.setConfigOrganizationIDs([]);
		historyActions.setConfigContactIDs([]);
		if (query.id && (pathname.includes('organization') || pathname.includes('contact'))) {
			push(pathname.split('[id]')[0]).then();
		}
	}, [cardActions, historyActions, pathname, push, query.id]);

	useEffect(() => {
		setIsAccessDenied(false);
		if (type === 'contact' && dataCont && team) {
			cardActions.setTitle(dataCont.name);
			const isAdmin = rolesAlias?.some((role) => CrmContactConst.Access.Admin.includes(role));
			const isNotMy = dataCont.userId && !team.includes(dataCont.userId);

			if (!isAdmin && isNotMy) {
				setIsAccessDenied(true);
			}
		}

		if (type === 'organization' && dataOrg && team) {
			cardActions.setTitle(`${dataOrg.nameEn} (${dataOrg.nameRu})`);
			const isAdmin = rolesAlias?.some((role) => CrmOrganizationConst.Access.Admin.includes(role));
			const isNotMy = dataOrg.userId && !team.includes(dataOrg.userId);

			if (!isAdmin && isNotMy) {
				setIsAccessDenied(true);
			}
		}
	}, [type, dataCont, dataOrg, cardActions, team, rolesAlias]);

	return (
		<UIDrawer
			opened={isShow}
			onClose={handleClone}
			width={1200}
			position={'right'}
			loading={isLoading || isUpdate}
			title={displayTitle}
			className={css.drawer}
			sharedLink={type === 'organization' ? orgHref : type === 'contact' ? contHref : undefined}
		>
			{isAccessDenied ? (
				<AccessDenied />
			) : (
				<div className={cn(css.wrapper, { [css.wrapper__disabled]: isFetching })}>
					<div className={css.leftSide}>
						<LeftSide />
					</div>
					<div className={css.rightSide}>
						<Header />
						<History />
						<Actions />
					</div>
				</div>
			)}
		</UIDrawer>
	);
};

export default Drawer;
