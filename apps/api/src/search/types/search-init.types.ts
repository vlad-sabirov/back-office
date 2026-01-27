export interface ISearchInit<T> {
	index: string;
	fields: Record<keyof T, 'string' | 'number' | 'keyword'>;
}
