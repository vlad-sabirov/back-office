import { makeAutoObservable } from 'mobx';

import {
	CsvContactBitrix,
	CsvOrganization1C,
	CsvOrganizationBitrix
} from './interfaces';

export type ParseStoreAnalyzeTypeT =
	| 'phoneOrganizations'
	| 'emailOrganizations'
	| 'websiteOrganizations'
	| 'innOrganizations'
	| 'innDuplicateOrganizations'
	| 'nameOrganizations'
	| 'notFoundUserOrganizations'

	| 'nameContacts'
	| 'phoneContacts'
	| 'workPositionContacts'
	| 'emailContacts'
	| 'notFoundUserContacts'

	| 'user'
	| 'phoneDuplicate'
	| 'emailDuplicate'
	| 'notFundOrganizationName'

	| 'pizdetsNahuiPblay'

	| 'oldNewOrganizations'
	| 'oldNewContacts'
	| null;

export default class ParseStore {
	constructor() {
		makeAutoObservable(this);
	}

	analyzeType: ParseStoreAnalyzeTypeT = null;
	setAnalyzeType(value: typeof this.analyzeType) {
		this.analyzeType = value;
	}

	organizationsBitrix: CsvOrganizationBitrix[] | null = null;
	setOrganizationsBitrix(value: typeof this.organizationsBitrix) {
		this.organizationsBitrix = value;
	}

	contactsBitrix: CsvContactBitrix[] | null = null;
	setContactsBitrix(value: typeof this.contactsBitrix) {
		this.contactsBitrix = value;
	}

	organizations1C: CsvOrganization1C[] | null = null;
	setOrganizations1C(value: typeof this.organizations1C) {
		this.organizations1C = value;
	}
}
