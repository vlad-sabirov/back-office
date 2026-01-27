import { makeAutoObservable } from 'mobx';
import { getSalesListData, getTagListData, getTypeListData } from '@screens/crm/organization/data';
import { IUserResponse } from '@interfaces/user/UserList.response';

import {
	getOrganizationListData,
	OrganizationListDataType
} from '@screens/crm/organization/data';

import {
	CrmOrganizationResponse,
	CrmOrganizationTagResponse,
	CrmOrganizationTypeResponse
} from '@interfaces';

export default class OrganizationStore {
	constructor() {
		makeAutoObservable(this);
	}

	drawerOrganizationAdd = false;
	setDrawerOrganizationAdd = (value: typeof this.drawerOrganizationAdd): void => {
		this.drawerOrganizationAdd = value;
	};

	dataOrganizationList: CrmOrganizationResponse[] = [];
	dataOrganizationListPage = 1;
	dataOrganizationListCount = 0;
	dataOrganizationListTimeStamp = 0;
	dataOrganizationListLimit = 0;
	setDataOrganizationList = (value: typeof this.dataOrganizationList): void => {
		this.dataOrganizationList = value;
	};
	setDataOrganizationListLimit = (value: number): void => {
		this.dataOrganizationListLimit = value;
	};
	setDataOrganizationListPage = (value: number): void => {
		this.dataOrganizationListPage = value;
	};
	setDataOrganizationListCount = (value: number): void => {
		this.dataOrganizationListCount = value;
	};
	setDataOrganizationListTimeStamp = (value: number): void => {
		this.dataOrganizationListTimeStamp = value;
	};
	getDataOrganizationListTimeStamp = (): void => {
		this.dataOrganizationListTimeStamp = new Date().getTime();
	};
	getDataOrganizationList = async (props: OrganizationListDataType): Promise<void> => {
		const response = await getOrganizationListData(props);
		if (!response) { return; }
		
		this.setDataOrganizationList(response.data);
		this.setDataOrganizationListCount(response.count);
	};

	dataTypeList: CrmOrganizationTypeResponse[] = [];
	setDataTypeList = (value: typeof this.dataTypeList): void => {
		this.dataTypeList = value;
	};
	getDataTypeList = async (): Promise<void> => {
		this.setDataTypeList(await getTypeListData());
	};

	dataTagList: CrmOrganizationTagResponse[] = [];
	setDataTagList = (value: typeof this.dataTagList): void => {
		this.dataTagList = value;
	};
	getDataTagList = async (): Promise<void> => {
		this.setDataTagList(await getTagListData());
	};

	dataSalesList: IUserResponse[] = [];
	setDataSalesList = (value: typeof this.dataSalesList): void => {
		this.dataSalesList = value;
	};
	getDataSalesList = async (): Promise<void> => {
		this.setDataSalesList(await getSalesListData());
	};
}
