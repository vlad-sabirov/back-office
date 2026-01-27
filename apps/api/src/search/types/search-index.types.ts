type ToArray<T> = {
	[P in keyof T]: T[P][] | T[P];
};

export interface ISearchIndex<T> {
	index: string;
	id: string;
	body: ToArray<T>;
}
