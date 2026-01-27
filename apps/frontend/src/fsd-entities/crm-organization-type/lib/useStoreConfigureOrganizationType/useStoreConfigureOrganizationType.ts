import { useEffect } from "react";
import { CrmOrganizationTypeService, CrmOrganizationTypeActions} from "@fsd/entities/crm-organization-type";
import { useStateActions } from "@fsd/shared/lib/hooks";
import { FetchStatusConvert } from "@fsd/shared/lib/fetch-status";

export const useStoreConfigureOrganizationType = () => {
	const stateActions = useStateActions(CrmOrganizationTypeActions);
	const [ fetchAll, { data, ...fetchProps }] = CrmOrganizationTypeService.getList();

	useEffect(() => {
		if (fetchAll) { fetchAll(); }
	}, [fetchAll]);

	useEffect(() => {
		if (data) { stateActions.setDataList(data); }
	}, [data, stateActions]);

	useEffect(() => {
		stateActions.setStatusList(FetchStatusConvert(fetchProps));
	}, [fetchProps, stateActions]);
}
