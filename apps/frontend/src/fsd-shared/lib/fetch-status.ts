import { isArray } from "lodash";

export const FetchStatus = ['uninitialized', 'loading', 'fetching', 'error', 'success'] as const;

export const FetchStatusConvert = (
	status: IFetchStatusConvertProps
): typeof FetchStatus[number] => {
	if (status.isUninitialized) { return 'uninitialized'; }
	if (status.isLoading) { return 'loading'; }
	if (status.isFetching) { return 'fetching'; }
	if (status.isError) { return 'error'; }
	if (status.isSuccess) { return 'success'; }
	return 'uninitialized';
}
interface IFetchStatusConvertProps {
	isUninitialized?: boolean;
	isLoading?: boolean;
	isFetching?: boolean;
	isError?:	boolean;
	isSuccess?: boolean;
}

const FetchStatusCheckIsOnline = (
	{ status, type }: { status: typeof FetchStatus[number], type: 'loading' | 'update',}
): boolean => {
	if (status === 'uninitialized' && type === 'loading') { return true; }
	if (status === 'loading' && type === 'loading') { return true; }
	if (status === 'fetching') { return true; }
	return false;
}

export const FetchStatusIsLoading = (
	status: typeof FetchStatus[number] | undefined | (typeof FetchStatus[number] | undefined)[]
): boolean => {
	if (!status) { return true; }

	if (isArray(status)) {
		for (const statusItem of status) {
			if (!statusItem) { return true; }
			if (FetchStatusCheckIsOnline({ status: statusItem, type: 'loading' })) { return true; }
		}
		return false;
	}

	if (FetchStatusCheckIsOnline({ status: status, type: 'loading' })) { return true; }
	return false;
}

export const FetchStatusIsUpdate = (
	status: typeof FetchStatus[number] | undefined | (typeof FetchStatus[number] | undefined)[]
): boolean => {	
	if (!status) { return false; }

	if (isArray(status)) {
		for (const statusItem of status) {
			if (!statusItem) { return false; }
			if (FetchStatusCheckIsOnline({ status: statusItem, type: 'update' })) { return true; }
		}
		return false;
	}

	if (FetchStatusCheckIsOnline({ status: status, type: 'update' })) { return true; }
	return false;
}
