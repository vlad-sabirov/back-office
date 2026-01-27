import { makeAutoObservable } from 'mobx';
import { StepperStoreConfigT } from '.';

export class StepperStore {
	constructor() { makeAutoObservable(this); }

	loading = false;
	setLoading = (val: boolean) => {
		this.loading = val;
	}

	disabled = false;
	setDisabled = (val: boolean) => {
		this.disabled = val;
	}

	activeStep = 0;
	setActiveStep = (val: number) => {
		this.activeStep = val;
	}

	countSteps = 0;
	setCountSteps = (val: number) => {
		this.countSteps = val;
	}

	config: StepperStoreConfigT = {};
	setConfig = (val: StepperStoreConfigT) => {
		this.config = val;
	}
}
