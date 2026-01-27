import { FC, createContext, useContext } from 'react';
import { Form, LeftSection, Options, RightSection } from './components';
import ParseStore from './parse.store';
import Head from 'next/head';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { ParseProps } from '.';
import css from './parse.module.scss';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { observer } from 'mobx-react-lite';

import {
	AnalysisEmailContacts,
	AnalysisEmailDuplicate,
	AnalysisEmailOrganizations,
	AnalysisInnDuplicateOrganizations,
	AnalysisInnOrganizations,
	AnalysisNameContacts,
	AnalysisPhoneContacts,
	AnalysisPhoneDuplicate,
	AnalysisPhoneOrganizations,
	AnalysisUser,
	AnalysisWebsiteOrganizations,
	AnalysisWorkPositionContacts
} from './analysis';
import { AnalysisNotFoundUserOrganizations } from './analysis/AnalysisNotFoundUserOrganizations';
import { AnalysisNotFoundUserContacts } from './analysis/AnalysisNotFoundUserContacts';
import { AnalysisNotFoundOrganizationName } from './analysis/AnalysisNotFoundOrganizationName';
import { Upload } from './analysis/Upload';
import { OldNewOrganizations } from './analysis/OldNewOrganizations';
import { CsvOrganizationBitrix } from './interfaces';

const parseStore = new ParseStore();
export const ParseContext = createContext(parseStore);

const Component: FC<ParseProps> = observer(({ ...props }) => {
	const Store = useContext(ParseContext);

	return (
		<>
			<Head><title>Парсинг данных</title></Head>

			<HeaderContent
				title={'Парсинг данных'}
				leftSection={<LeftSection />}
				rightSection={<RightSection />}
			/>

			<div className={css.root} {...props}>
				<ContentBlock>
					<Form />
				</ContentBlock>

				<ContentBlock>
					<Options
						organizationsBitrix={Store.organizationsBitrix}
						organizations1C={Store.organizations1C}
						contactsBitrix={Store.contactsBitrix}
						onSuccess={(res) => { Store.setAnalyzeType(res); }}
					/>
				</ContentBlock>

				<ContentBlock>
					{Store.analyzeType === 'phoneOrganizations' && (
						<AnalysisPhoneOrganizations
							organizations={Store.organizationsBitrix}
						/>
					)}
					{Store.analyzeType === 'emailOrganizations' && (
						<AnalysisEmailOrganizations
							organizations={Store.organizationsBitrix}
						/>
					)}
					{Store.analyzeType === 'websiteOrganizations' && (
						<AnalysisWebsiteOrganizations
							organizations={Store.organizationsBitrix}
						/>
					)}
					{Store.analyzeType === 'innOrganizations' && (
						<AnalysisInnOrganizations
							organizations={Store.organizationsBitrix}
						/>
					)}
					{Store.analyzeType === 'innDuplicateOrganizations' && (
						<AnalysisInnDuplicateOrganizations
							organizations={Store.organizationsBitrix}
						/>
					)}
					{Store.analyzeType === 'notFoundUserOrganizations' && (
						<AnalysisNotFoundUserOrganizations
							organizations={Store.organizationsBitrix}
						/>
					)}



					{Store.analyzeType === 'nameContacts' && (
						<AnalysisNameContacts
							contacts={Store.contactsBitrix}
						/>
					)}
					{Store.analyzeType === 'workPositionContacts' && (
						<AnalysisWorkPositionContacts
							contacts={Store.contactsBitrix}
						/>
					)}
					{Store.analyzeType === 'phoneContacts' && (
						<AnalysisPhoneContacts
							contacts={Store.contactsBitrix}
						/>
					)}
					{Store.analyzeType === 'emailContacts' && (
						<AnalysisEmailContacts
							contacts={Store.contactsBitrix}
						/>
					)}
					{Store.analyzeType === 'notFoundUserContacts' && (
						<AnalysisNotFoundUserContacts
							contacts={Store.contactsBitrix}
						/>
					)}



					{Store.analyzeType === 'user' && (
						<AnalysisUser
							organizationsBitrix={Store.organizationsBitrix}
							organizations1C={Store.organizations1C}
						/>
					)}
					{Store.analyzeType === 'phoneDuplicate' && (
						<AnalysisPhoneDuplicate
							organizations={Store.organizationsBitrix}
							contacts={Store.contactsBitrix}
						/>
					)}
					{Store.analyzeType === 'emailDuplicate' && (
						<AnalysisEmailDuplicate
							organizations={Store.organizationsBitrix}
							contacts={Store.contactsBitrix}
						/>
					)}
					{Store.analyzeType === 'notFundOrganizationName' && (
						<AnalysisNotFoundOrganizationName
							organizations={Store.organizationsBitrix}
							contacts={Store.contactsBitrix}
						/>
					)}

					{Store.analyzeType === 'oldNewOrganizations' && (
						<OldNewOrganizations
							oldOrgs={Store.organizationsBitrix}
							newOrgs={Store.organizations1C as CsvOrganizationBitrix[]}
						/>
					)}



					{Store.analyzeType === 'pizdetsNahuiPblay' && (
						<Upload
							organizations={Store.organizationsBitrix}
							contacts={Store.contactsBitrix}
						/>
					)}
				</ContentBlock>
			</div>
		</>
	);
});

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<ParseContext.Provider value={parseStore}>
				<Component {...props} />
			</ParseContext.Provider>
		);
	};
};

export const ParseScreen = withHOC(Component);
