export interface PrismaFilter<T> {
	orderBy?: { [key in keyof Partial<T>]: 'asc' | 'desc' };
	take?: number;
	skip?: number;
}
