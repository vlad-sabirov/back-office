interface Territory {
	name: string;
	count: number;
}

interface Department {
	name: string;
	count: number;
}

export interface UserCountAllEntity {
	all: number;
	sex: {
		male: number;
		female: number;
	};
	territory: Territory[];
	department: Department[];
}
