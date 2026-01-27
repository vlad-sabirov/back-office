import { FC, memo, useMemo } from "react";
import { HelperValidate } from "@fsd/shared/lib/validate";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Button } from "@fsd/shared/ui-kit";
import { IOrgAddButtonsProps } from "./org-add-buttons.types";
import css from "./org-add-buttons.module.scss";

export const OrgAddButtons: FC<IOrgAddButtonsProps> = memo((props) => {
	const { onClose, onSave } = props;
	
	const errors = useStateSelector((state) => state.crm_organization_add_drawer.errors);
	const hasErrors = useMemo(() => !HelperValidate.isEmptyObject(errors), [errors])

	return (
		<div className={css.wrapper}>
			<Button onClick={onClose}> Отмена </Button>

			<Button
				color={'primary'}
				variant={'hard'}
				onClick={onSave}
				disabled={hasErrors}
			> Сохранить </Button>
		</div>
	);
});
OrgAddButtons.displayName = "OrgAddButtons";
