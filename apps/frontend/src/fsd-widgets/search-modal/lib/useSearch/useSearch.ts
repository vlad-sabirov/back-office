import { useStateSelector } from "@fsd/shared/lib/hooks";
import { useEffect, useState } from "react";
import { useSearchContacts } from "./target/contacts";
import { useSearchOrganizations } from "./target/organizations";
import { IUseSearchGroupedResponse } from "./use-search.types";

export const useSearch = (): IUseSearchGroupedResponse => {
	const value = useStateSelector((state) => state.search.value);
	const resultOrganizations = useSearchOrganizations(value);
	const resultContacts = useSearchContacts(value);
	
	const [results, setResults] = useState<IUseSearchGroupedResponse>({ organizations: [], contacts: [] });

	useEffect(() => {
		const result: IUseSearchGroupedResponse = {
			organizations: [],
			contacts: [],
		};

		if (!value.length) {
			setResults(result);
			return;
		}

		if (resultOrganizations?.length) {
			result.organizations.push(...resultOrganizations);
		}

		if (resultContacts?.length) {
			result.contacts.push(...resultContacts);
		}
		
		setResults(result);
	}, [resultContacts, resultOrganizations, value]);

	return results;
}
