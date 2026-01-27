import { ModalProps } from "@fsd/shared/ui-kit";

export interface ISearchModalProps extends IDefault {}
type IDefault = Partial<Omit<ModalProps, 'opened' | 'onClose'>>;
