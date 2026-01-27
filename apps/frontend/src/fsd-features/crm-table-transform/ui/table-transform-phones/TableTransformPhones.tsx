import { ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { ICrmPhoneEntity, ICrmPhoneFormEntity } from '@fsd/entities/crm-phone';
import { CallTo } from '@fsd/entities/voip';
import { TextField, TextFiendPropsSize } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { Popover } from '@mantine/core';
import css from './table-transform-phones.module.scss';

interface IExec {
	size?: (typeof TextFiendPropsSize)[number];
	phones: (ICrmPhoneEntity | ICrmPhoneFormEntity)[] | null;
	name: string;
}
// eslint-disable-next-line no-unused-vars
type IResponse = (props: IExec) => { output: ReactNode; index: string };

export const useTableTransformPhones = (): IResponse => {
	return ({ phones, size, name }: IExec) => {
		if (!phones || !phones.length) {
			return { output: null, index: '' };
		}
		const firstPhone = phones?.[0]?.value ? parsePhoneNumber(phones[0].value).output : '';

		let output = (
			<Popover radius={'md'} offset={-4} shadow={'xl'} position={'top'} withArrow>
				<Popover.Target>
					<TextField size={size} className={css.many}>
						{firstPhone}...
					</TextField>
				</Popover.Target>
				<Popover.Dropdown>
					{phones?.map((phone) => (
						<CallTo
							key={'id' in phone ? phone.id : uuid()}
							offset={-2}
							callToPhone={parsePhoneNumber(phone.value).output}
							callToName={name}
						>
							<TextField className={css.manyItem}>
								<span>{parsePhoneNumber(phone.value).output}</span>
								{phone.comment && ` ${phone.comment}`}
							</TextField>
						</CallTo>
					))}
				</Popover.Dropdown>
			</Popover>
		);

		if (phones?.length === 1) {
			output = (
				<CallTo offset={-2} callToPhone={firstPhone} callToName={name}>
					<TextField className={css.once} size={size}>
						{firstPhone}
					</TextField>
				</CallTo>
			);
		}

		return { output, index: firstPhone };
	};
};
