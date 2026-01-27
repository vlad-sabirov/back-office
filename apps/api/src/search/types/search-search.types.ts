type HelperType<T> = {
	[P in keyof T]?: { value: T[P]; type: 'string' | 'number' | 'keyword' } | undefined;
};

export interface ISearch<T extends Record<string, any>> {
	index: string;
	body: HelperType<T>;
	filter?: any;
	take?: number;
	skip?: number;
}
