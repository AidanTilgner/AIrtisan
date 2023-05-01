import { Organization } from "../models/organization";
import { entities, dataSource } from "..";
import { getAdmin } from "./admin";
import { addRunningStatusToBots, getBotsByOwner } from "./bot";
import { getRandomID } from "../../utils/crypto";

export const createOrganization = async ({
  name,
  description,
  owner_id,
}: {
  name: Organization["name"];
  description: Organization["description"];
  owner_id: number;
}) => {
  try {
    const owner = await getAdmin(owner_id);

    if (!owner) return null;

    const organization = new entities.Organization();
    organization.name = name;
    organization.description = description;
    organization.owner = owner;
    await dataSource.manager.save(organization);
    await dataSource.manager.save(owner);
    return organization;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrganization = async (id: number) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: id },
      }
    );
    return organization;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getOrganizations = async () => {
  try {
    const organizations = await dataSource.manager.find(entities.Organization);
    return organizations;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateOrganization = async (
  id: number,
  data: Partial<Organization>
) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id },
      }
    );
    if (!organization) return null;
    const result = await dataSource.manager.save(entities.Organization, {
      id,
      ...data,
    });
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteOrganization = async (id: number) => {
  try {
    const result = await dataSource.manager.delete(entities.Organization, id);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getOrganizationByName = async (name: string) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { name },
      }
    );
    return organization;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getOrganizationAdmins = async (id: number) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id },
        relations: ["admins", "owner"],
      }
    );
    if (!organization) return null;

    return [organization.owner, ...(organization.admins || [])];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const checkAdminIsInOrganization = async (
  organization_id: number,
  admin_id: number
) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
        relations: ["admins", "owner"],
      }
    );
    if (!organization) return null;

    if (organization.owner.id === admin_id) return true;

    const admin = organization.admins.find((admin) => admin.id === admin_id);
    return admin ? true : false;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const checkAdminIsOwnerOfOrganization = async (
  organization_id: number,
  admin_id: number
) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
        relations: ["owner"],
      }
    );
    if (!organization) return null;

    return organization.owner.id === admin_id;
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
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
        relations: ["admins"],
      }
    );
    if (!organization) return null;
    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id: admin_id },
    });
    if (!admin) return null;
    organization.admins.push(admin);
    await dataSource.manager.save(organization);
    return organization;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getOrganizationBotsThatAdminHasAccessTo = async (
  organization_id: number,
  admin_id: number
) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
        relations: ["owner", "admins"],
      }
    );
    if (!organization) return null;

    const isOwner = organization.owner.id === admin_id;
    const isMember = organization.admins.find((admin) => admin.id === admin_id);

    const publicBots = await getBotsByOwner(
      organization_id,
      "organization",
      "public"
    );

    if (isOwner || isMember) {
      const privateBots = await getBotsByOwner(
        organization_id,
        "organization",
        "private"
      );
      const bots = [...(privateBots || []), ...(publicBots || [])];
      const botsWithRunningStatus = await addRunningStatusToBots(bots);
      return botsWithRunningStatus;
    }

    const botsWithRunningStatus = await addRunningStatusToBots(
      publicBots || []
    );

    if (!publicBots) return null;

    return botsWithRunningStatus;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createOrganizationInvitation = async (
  organization_id: number,
  admin_id: number
) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id: organization_id },
        relations: ["owner", "admins"],
      }
    );
    if (!organization) return null;

    const admin = await dataSource.manager.findOne(entities.Admin, {
      where: { id: admin_id },
    });

    if (!admin) return null;

    const invitation = new entities.OrganizationInvitation();
    invitation.organization = organization;
    invitation.admin = admin;

    const token = getRandomID();
    invitation.token = token;

    await dataSource.manager.save(invitation);

    return invitation;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrganizationInvitations = async (organization_id: number) => {
  try {
    const invitations = await dataSource.manager.find(
      entities.OrganizationInvitation,
      {
        where: { organization: { id: organization_id } },
        relations: ["admin"],
      }
    );
    return invitations;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrganizationInvitationByToken = async (token: string) => {
  try {
    const invitation = await dataSource.manager.findOne(
      entities.OrganizationInvitation,
      {
        where: { token },
        relations: ["admin", "organization"],
      }
    );
    return invitation;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteOrganizationInvitation = async (id: number) => {
  try {
    const result = await dataSource.manager.delete(
      entities.OrganizationInvitation,
      id
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrganizationInvitationByAdmin = async (admin_id: number) => {
  try {
    const invitation = await dataSource.manager.findOne(
      entities.OrganizationInvitation,
      {
        where: { admin: { id: admin_id } },
        relations: ["admin", "organization"],
      }
    );
    return invitation;
  } catch (error) {
    console.error(error);
    return null;
  }
};
