import { useStateActions } from "@fsd/shared/lib/hooks";
import { ContactCardActions } from "../../model/slice/contact-card.slice";

export const useActions = () => useStateActions(ContactCardActions);
