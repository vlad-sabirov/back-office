interface roleDto {
	alias: string;
	description: string;
}

interface IUpdateUserRoleDto {
	roleDto: roleDto;
}

export default IUpdateUserRoleDto;
