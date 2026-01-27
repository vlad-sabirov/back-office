import { makeAutoObservable } from 'mobx';
import { LatenessDataResponse } from '@interfaces';

export default class LatenessPerDayStore {
	constructor() {
		makeAutoObservable(this);
	}

	currentLateness: LatenessDataResponse | null = null;
	setCurrentLateness = (value: LatenessDataResponse) => {
		this.currentLateness = value;
	};

	modalArrivedIsOpen = false;
	setModalArrivedIsOpen = (value: boolean) => {
		this.modalArrivedIsOpen = value;
	};

	modalLateIsOpen = false;
	setModalLateIsOpen = (value: boolean) => {
		this.modalLateIsOpen = value;
	};

	modalDidComeIsOpen = false;
	setModalDidComeIsOpen = (value: boolean) => {
		this.modalDidComeIsOpen = value;
	};

	modalCommentEditIsOpen = false;
	setModalCommentEditIsOpen = (value: boolean) => {
		this.modalCommentEditIsOpen = value;
	};

	modalSetSkippedIsOpen = false;
	setModalSetSkippedIsOpen = (value: boolean) => {
		this.modalSetSkippedIsOpen = value;
	};

	modalSubCommentAddIsOpen = false;
	setModalSubCommentAddIsOpen = (value: boolean) => {
		this.modalSubCommentAddIsOpen = value;
	};

	modalSubCommentID = 0;
	setModalSubCommentID = (value: number) => {
		this.modalSubCommentID = value;
	};

	modalSubCommentEditIsOpen = false;
	setModalSubCommentEditIsOpen = (value: boolean) => {
		this.modalSubCommentEditIsOpen = value;
	};

	modalSubCommentDeleteIsOpen = false;
	setModalSubCommentDeleteIsOpen = (value: boolean) => {
		this.modalSubCommentDeleteIsOpen = value;
	};
}
