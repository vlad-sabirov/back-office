import { IFetchError } from './fetch-error.interface';

export type ServiceResponse<T> = [T | undefined, IFetchError | undefined];
