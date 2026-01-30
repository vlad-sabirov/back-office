import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed скрипт для установки базовых данных
 * Выполняется командой: npx prisma db seed
 */
async function main() {
	console.log('🌱 Starting seed...');

	// =====================================================
	// АДМИНИСТРАТОРЫ С ПОЛНЫМ ДОСТУПОМ
	// Добавьте сюда пользователей, которые должны иметь все роли
	// =====================================================
	const adminUsers = [
		{ lastName: 'Сабиров', firstName: 'Влад' },
		// Добавьте других администраторов при необходимости:
		// { lastName: 'Иванов', firstName: 'Иван' },
	];

	// Получить все роли
	const allRoles = await prisma.userRole.findMany();
	console.log(`📋 Found ${allRoles.length} roles`);

	for (const adminUser of adminUsers) {
		// Найти пользователя
		const user = await prisma.user.findFirst({
			where: {
				lastName: adminUser.lastName,
				firstName: adminUser.firstName,
			},
			include: { roles: true },
		});

		if (!user) {
			console.log(`⚠️  User ${adminUser.lastName} ${adminUser.firstName} not found, skipping...`);
			continue;
		}

		// Назначить все роли
		await prisma.user.update({
			where: { id: user.id },
			data: {
				roles: {
					set: allRoles.map((role) => ({ id: role.id })),
				},
			},
		});

		console.log(`✅ ${user.lastName} ${user.firstName} (ID: ${user.id}) - assigned ${allRoles.length} roles`);
	}

	console.log('🌱 Seed completed!');
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
