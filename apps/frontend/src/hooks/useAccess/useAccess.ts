import { useStateSelector } from "@fsd/shared/lib/hooks";
import { useCallback } from "react";

export const useAccess = () => {
	const roles = useStateSelector((state) => state.app.auth.roles);

	return useCallback((accessSting: string | string[]) => {
		if (roles?.includes('admin')) return true;
		if (!accessSting) return false;
		if (typeof accessSting === 'string') if (roles?.includes(accessSting)) return true;
		if (Array.isArray(accessSting)) if (accessSting.some((item) => roles?.includes(item))) return true;
		return false;
	}, [roles]);
};
