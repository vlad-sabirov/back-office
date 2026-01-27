import Document, { Head, Html, Main, NextScript } from 'next/document';
import { createGetInitialProps } from '@mantine/next';

class MyDocument extends Document {
	static getInitialProps = createGetInitialProps();

	render(): JSX.Element {
		return (
			<Html lang="ru">
				<Head>
					<link
						// eslint-disable-next-line max-len
						href="https://fonts.googleapis.com/css2?family=Fira+Mono&family=Fira+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
						rel="stylesheet"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
