import { Organization } from "../models/organization";
import { entities, dataSource } from "..";
import { getAdmin } from "./admin";

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
    const result = await dataSource.manager.update(
      entities.Organization,
      id,
      data
    );
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

    return [...(organization.admins || []), organization.owner];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const checkAdminIsInOrganization = async (
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
    const admin = organization.admins.find((admin) => admin.id === admin_id);
    return admin ? true : false;
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
