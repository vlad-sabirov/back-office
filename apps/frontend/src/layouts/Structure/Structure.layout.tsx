import { Suspense, useEffect } from 'react';
import { AsideLayout } from './Aside/Aside.layout';
import { BodyLayout } from './Body/Body.layout';
import { HeaderLayout } from './Header/Header.layout';
import { ModalsLayout } from './Modals/Modals';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { BasicStoreConfigure } from '@fsd/app/config/BasicStoreConfigure';
import { useCrmRealizationStateConfigure } from '@fsd/entities/crm-realization';
import { useVoipCheckMyCall, useVoipWsClient } from '@fsd/entities/voip';
import { CrmCard } from '@fsd/widgets/crm-card';
import { SearchModal } from '@fsd/widgets/search-modal';
import { useCheckAuth } from '../lib/use-check-auth';
import { StructureLayoutProps } from './Structure.layout.props';
import css from './Structure.layout.module.scss';

export const StructureLayout = observer(({ children }: StructureLayoutProps): JSX.Element => {
	const router = useRouter();
	const checkAuth = useCheckAuth();
	const stateInit = useCrmRealizationStateConfigure();
	useVoipWsClient();
	useVoipCheckMyCall();

	useEffect(() => {
		stateInit();
	}, [stateInit]);

	useEffect(() => {
		checkAuth().then();
	}, [checkAuth, router.route]);

	return (
		<div className={css.wrapper}>
			<BasicStoreConfigure />
			<HeaderLayout className={css.header} />
			<AsideLayout className={css.aside} />
			<BodyLayout className={css.body}>{children}</BodyLayout>
			<ModalsLayout />
			<Suspense>
				<CrmCard />
			</Suspense>
			<SearchModal />
		</div>
	);
});
