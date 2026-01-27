import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { WebsiteProps, FIELD_NAME_WEBSITE } from '.';

export const Website: FC<WebsiteProps> = ({ form, className }) => {
	return (
		<Input
			label={'Вебсайт'}
			{...form.getInputProps(FIELD_NAME_WEBSITE)}
			// onBlur={() => websiteValidate({ form })}
			className={className}
		/>
	);
};
