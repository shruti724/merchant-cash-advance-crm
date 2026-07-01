/**
 * Seeds two isolated tenants with users/roles so multi-tenancy and RBAC
 * can be demonstrated immediately after `docker compose up`.
 */
import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTenant(name: string, slug: string) {
  const tenant = await prisma.tenant.create({ data: { name, slug } });

  const roleDefs: { name: RoleName; permissions: string[] }[] = [
    { name: 'TENANT_ADMIN', permissions: ['*'] },
    { name: 'ISO', permissions: ['lead:create', 'lead:read', 'lead:update'] },
    {
      name: 'UNDERWRITER',
      permissions: ['application:read', 'application:decide'],
    },
  ];

  const roles = await Promise.all(
    roleDefs.map((r) =>
      prisma.role.create({
        data: { tenantId: tenant.id, name: r.name, permissions: r.permissions },
      }),
    ),
  );

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: `admin@${slug}.com`,
      passwordHash,
      firstName: 'Tenant',
      lastName: 'Admin',
      roles: { create: { roleId: roles[0].id } },
    },
  });

  const iso = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: `iso@${slug}.com`,
      passwordHash,
      firstName: 'ISO',
      lastName: 'User',
      roles: { create: { roleId: roles[1].id } },
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: `underwriter@${slug}.com`,
      passwordHash,
      firstName: 'Under',
      lastName: 'Writer',
      roles: { create: { roleId: roles[2].id } },
    },
  });

  console.log(`Seeded tenant "${name}" (admin@${slug}.com / iso@${slug}.com — Password123!)`);
  return { tenant, admin, iso };
}

async function main() {
  await createTenant('Capital Partners LLC', 'capital-partners');
  await createTenant('Fundwise Group', 'fundwise');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
