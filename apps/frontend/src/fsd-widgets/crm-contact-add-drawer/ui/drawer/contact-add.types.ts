export interface IContactAddProps {
	loading?: boolean;
}

export interface IContactAddClearData {
	contact: number | string | null;
	phones: (number | string)[];
	emails: (number | string)[];
	organizations: [number, 'create' | 'connect'][];
}
