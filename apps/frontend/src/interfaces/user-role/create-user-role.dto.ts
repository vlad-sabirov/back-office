interface roleDto {
	alias: string;
	description: string;
}

interface ICreateUserRoleDto {
	roleDto: roleDto;
}

export default ICreateUserRoleDto;
