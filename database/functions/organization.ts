import { Organization } from "../models/organization";
import { entities, dataSource } from "..";

export const createOrganization = async ({
  name,
  description,
}: {
  name: Organization["name"];
  description: Organization["description"];
}) => {
  try {
    const organization = new entities.Organization();
    organization.name = name;
    organization.description = description;
    await dataSource.manager.save(organization);
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
        relations: ["admins"],
      }
    );
    if (!organization) return null;

    return organization.admins;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getOrganizationBots = async (id: number) => {
  try {
    const organization = await dataSource.manager.findOne(
      entities.Organization,
      {
        where: { id },
        relations: ["bots"],
      }
    );
    if (!organization) return null;

    return organization.bots;
  } catch (err) {
    console.error(err);
    return null;
  }
};
