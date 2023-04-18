import { dataSource, entities } from "..";
import { hashPassword } from "../../utils/crypto";
import { Admin } from "../models/admin";

export const createAdmin = async ({
  username,
  password,
  role,
}: {
  username: string;
  password: string;
  role: "admin" | "superadmin";
}) => {
  try {
    const admin = new entities.Admin();
    admin.username = username;
    admin.password = hashPassword(password);
    admin.role = role;
    const result = await dataSource.manager.save(admin);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAdmin = async (id: number) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id: id },
    });
    return admin;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAdminByUsername = async (username: string) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { username },
    });
    return admin;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAdmins = async () => {
  try {
    const admins = await dataSource.manager.find(entities.Admin);
    return admins.map((admin) => {
      const { password, ...rest } = admin;

      return {
        ...rest,
      };
    });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateAdmin = async (id: number, data: Partial<Admin>) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id },
    });
    if (!admin) return null;
    const result = await dataSource.manager.update(entities.Admin, id, data);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteAdmin = async (id: number) => {
  try {
    const result = await dataSource.manager.delete(entities.Admin, { id });
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addAdminToOrganization = async (
  admin_id: number,
  organization_id: number
) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id: admin_id },
    });
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
      }
    );
    if (!admin || !organization) return null;
    admin.organizations = [...(admin.organizations || []), organization];
    const result = await dataSource.manager.save(admin);
    await dataSource.manager.save(organization);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createAdminInOrganization = async ({
  username,
  password,
  role,
  organization_id,
}: {
  username: string;
  password: string;
  role: "admin" | "superadmin";
  organization_id: number;
}) => {
  try {
    const createdAdmin = await createAdmin({
      username,
      password,
      role,
    });
    if (!createdAdmin) return null;
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
      }
    );
    if (!organization) return null;
    createdAdmin.organizations = [organization];
    const result = await dataSource.manager.save(createdAdmin);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};
