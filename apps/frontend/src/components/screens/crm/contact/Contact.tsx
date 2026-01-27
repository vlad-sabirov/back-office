import { FC, createContext } from 'react';
import { LeftSection, RightSection } from './components';
import ContactStore from './contact.store';
import Head from 'next/head';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { ContactProps } from '.';
import css from './contact.module.scss';

const contactStore = new ContactStore();
export const ContactContext = createContext({ contactStore });

const Component: FC<ContactProps> = ({ ...props }) => {
	return (
		<>
			<Head><title>Контакты</title></Head>

			<HeaderContent
				title={'Контакты'}
				leftSection={<LeftSection />}
				rightSection={<RightSection />}
			/>

			<div className={css.root} {...props}>
				Contact is mounted!
			</div>
		</>
	);
};

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<ContactContext.Provider value={{ contactStore }}>
				<Component {...props} />
			</ContactContext.Provider>
		);
	};
};

export const ContactScreen = withHOC(Component);
