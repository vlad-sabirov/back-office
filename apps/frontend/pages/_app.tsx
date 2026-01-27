import { createContext } from 'react';
import { AppProps } from 'next/dist/shared/lib/router/router';
import Head from 'next/head';
import { wrapper } from '@fsd/shared/store';
import AuthSpotlight from '@layouts/AdminSpotlight/AuthSpotlight';
import { MainLayout } from '@layouts/Main.layout';
import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import AdminStore from '../src/stores/Admin.store';
import LogisticStore from '../src/stores/Logistic.store';
import ModalStore from '../src/stores/Modal.store';
import StaffStore from '../src/stores/Staff.store';
import TemplateStore from '../src/stores/Template.store';
import '../styles/globals.scss';

const templateStore = new TemplateStore();
const adminStore = new AdminStore();
const modalStore = new ModalStore();
const staffStore = new StaffStore();
const logisticStore = new LogisticStore();

export const MainContext = createContext({
	templateStore,
	adminStore,
	modalStore,
	staffStore,
	logisticStore,
});

const mantineTheme: MantineThemeOverride = {
	fontFamily: 'Fira Sans, sans-serif',
	fontFamilyMonospace: 'Fira Mono, sans-serif',
	focusRing: 'never',
};

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
	return (
		<>
			<Head>
				<title>Back Office</title>
				<link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
				<link rel="icon" href="/img/favicon/favicon.svg" sizes="any" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
				<MainContext.Provider
					value={{
						templateStore,
						modalStore,
						staffStore,
						adminStore,
						logisticStore,
					}}
				>
					<NotificationsProvider position="top-center" autoClose={10000} transitionDuration={1000}>
						<AuthSpotlight />
						<MainLayout>
							<Component {...pageProps} />
						</MainLayout>
					</NotificationsProvider>
				</MainContext.Provider>
			</MantineProvider>
		</>
	);
};

export default wrapper.withRedux(MyApp);
