import { useEffect } from "react";
import { useStateActions } from "@fsd/shared/lib/hooks";
import { FetchStatusConvert } from "@fsd/shared/lib/fetch-status";
import { TagService } from "../../model/service/tag.service";
import { TagActions } from "../../model/slice/tag.slice";

export const useStoreConfigure = () => {
	const stateActions = useStateActions(TagActions);
	const [ fetchAll, { data, ...fetchProps }] = TagService.getList();

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
