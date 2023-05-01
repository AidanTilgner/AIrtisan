import { dataSource, entities } from "..";
import { Notification } from "../../types/lib";
import { hashPassword } from "../../utils/crypto";
import { Admin } from "../models/admin";
import { getOrganizationInvitationsByAdmin } from "./organization";

export const createAdmin = async ({
  username,
  password,
  role,
  display_name,
}: {
  username: Admin["username"];
  password: Admin["password"];
  role: Admin["role"];
  display_name?: Admin["display_name"];
}) => {
  try {
    const usernameTaken = await checkUsernameTaken(username);
    if (usernameTaken) return null;
    const admin = new entities.Admin();
    admin.username = username;
    admin.password = hashPassword(password);
    admin.role = role;
    if (display_name) admin.display_name = display_name;
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

export const checkUsernameTaken = async (
  username: string,
  currentId?: number
) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { username },
    });

    if (currentId) {
      return !!admin && admin.id !== currentId;
    }

    return !!admin;
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
    if (data.username) {
      const usernameTaken = await checkUsernameTaken(data.username, id);
      if (usernameTaken) return null;
    }

    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id },
    });
    if (!admin) return null;

    const { role, password, ...editableData } = data;
    const result = await dataSource.manager.save(entities.Admin, {
      id,
      ...editableData,
    });
    const { password: _, ...rest } = result;

    return rest;
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

export const getAdminOrganizations = async (id: number) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id },
      relations: ["organizations", "owned_organizations"],
    });
    if (!admin) return null;

    return [...admin.organizations, ...admin.owned_organizations];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const searchAdmins = async (query: string) => {
  try {
    const repo = dataSource.manager.getRepository(entities.Admin);
    const results = await repo
      .createQueryBuilder("admin")
      .where("admin.username LIKE :query", { query: `%${query}%` })
      .orWhere("admin.display_name LIKE :query", { query: `%${query}%` })
      .orWhere("admin.email LIKE :query", { query: `%${query}%` })
      .limit(10)
      .getMany();

    const filteredResults = results.map((result) => {
      const { password, ...rest } = result;
      return rest;
    });

    return filteredResults;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAdminNotifications = async (admin_id: number) => {
  try {
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id: admin_id },
    });
    if (!admin) return null;

    const adminOrgInvites = await getOrganizationInvitationsByAdmin(admin_id);

    const notifications: Notification[] = [];

    adminOrgInvites?.forEach((invite) => {
      notifications.push({
        title: "Organization Invitation",
        body: `You have been invited to join ${invite.organization.name}`,
        priority: "medium",
        actions: [
          {
            title: "Accept",
            type: "accept_organization_invite",
          },
          {
            title: "Decline",
            type: "decline_organization_invite",
          },
        ],
        metadata: {
          organization: invite.organization,
          admin: invite.admin,
          invitation: invite,
        },
        type: "organization_invite",
      });
    });

    return notifications;
  } catch (err) {
    console.error(err);
    return null;
  }
};
