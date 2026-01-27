import { makeAutoObservable } from 'mobx';
import { ServiceResponse } from '@interfaces/service-fetch.response';
import { ILogisticVedCommentResponse } from '@screens/logistic';
import { LogisticVedFindStageWithOrderOptionDto } from '@screens/logistic/ved/interfaces';
import { ILogisticVedOrderResponse } from '@screens/logistic/ved/interfaces';
import { ILogisticVedStageResponse } from '@screens/logistic/ved/interfaces';
import LogisticService from '../services/Logistic.service';

type IFileType = 'order' | 'calculating';
type IStaffType = 'author' | 'performer';
interface IModalOrderStage {
	toRework: boolean;
	fromReworkToComplete: boolean;
	toClose: boolean;
	toDone: boolean;
	uploadFile: boolean;
	fileHistory: boolean;
	setPerformer: boolean;
	inWork: boolean;
	calculate: boolean;
	contracting: boolean;
	delivery: boolean;
}

export default class LogisticStore {
	logisticVedStageList: ILogisticVedStageResponse[] | null = null;
	logisticVedStageCurrent: ILogisticVedStageResponse | null = null;
	logisticVedOrderList: ILogisticVedOrderResponse[] | null = null;
	logisticVedOrderCurrent: ILogisticVedOrderResponse | null = null;
	logisticVedCommentCurrent: ILogisticVedCommentResponse | null = null;
	displayOrdersAuthor: number | number[] | string | string[] = 0;
	displayOrdersClosed = false;
	displayOrdersDone = false;
	fileType: IFileType = 'order';
	staffType: IStaffType = 'author';
	accessAuthorId: number[] = [];

	modalOrderStage: IModalOrderStage = {
		toRework: false,
		fromReworkToComplete: false,
		toClose: false,
		toDone: false,
		uploadFile: false,
		fileHistory: false,

		// Стадии
		setPerformer: false,
		inWork: false,
		calculate: false,
		contracting: false,
		delivery: false,
	};

	constructor() {
		makeAutoObservable(this);
	}

	setLogisticVedStageList(value: ILogisticVedStageResponse[] | null): void {
		this.logisticVedStageList = value;
	}

	setLogisticVedStageCurrent(value: ILogisticVedStageResponse | null): void {
		this.logisticVedStageCurrent = value;
	}

	setLogisticVedOrderList(value: ILogisticVedOrderResponse[] | null): void {
		this.logisticVedOrderList = value;
	}

	setLogisticVedOrderCurrent(value: ILogisticVedOrderResponse | null): void {
		this.logisticVedOrderCurrent = value;
	}

	setLogisticVedCommentCurrent(value: ILogisticVedCommentResponse | null): void {
		this.logisticVedCommentCurrent = value;
	}

	setModalOrderStage(modalState: keyof IModalOrderStage, value?: boolean): void {
		this.modalOrderStage[modalState] = typeof value !== 'undefined' ? value : !this.modalOrderStage[modalState];
	}

	setDisplayOrdersAuthor(value: number | number[] | string | string[]) {
		this.displayOrdersAuthor = value;
	}

	setDisplayOrdersDone(value: boolean) {
		this.displayOrdersDone = value;
	}

	setDisplayOrdersClosed(value: boolean) {
		this.displayOrdersClosed = value;
	}

	setFileType(value: IFileType) {
		this.fileType = value;
	}

	setAccessAuthorId(value: number[]) {
		this.accessAuthorId = value;
	}

	isLoadingStage = false;
	setIsLoadingStage(value: boolean) {
		this.isLoadingStage = value;
	}

	async getLogisticVedStageList() {
		this.setIsLoadingCurrent(true);
		const { data: response } = await LogisticService.findStageAll();
		if (response) this.setLogisticVedStageList(response);
		this.setIsLoadingCurrent(false);
	}

	isLoadingList = false;
	setIsLoadingList(value: boolean) {
		this.isLoadingList = value;
	}

	async getLogisticVedStageListWithOrderOptions(options: LogisticVedFindStageWithOrderOptionDto) {
		this.setIsLoadingList(true);
		const { data: response } = await LogisticService.findStageWithOrderOptions(options);
		if (response) this.setLogisticVedStageList(response);
		this.setIsLoadingList(false);
	}

	isLoadingCurrent = false;
	setIsLoadingCurrent(value: boolean) {
		this.isLoadingCurrent = value;
	}

	async getLogisticVedOrderByID(id: number): Promise<ServiceResponse<ILogisticVedOrderResponse>> {
		let response, error;
		this.setIsLoadingCurrent(true);

		await LogisticService.findOrderById(id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		if (response) this.setLogisticVedOrderCurrent(response);

		this.setIsLoadingCurrent(false);
		return [response, error];
	}
}
