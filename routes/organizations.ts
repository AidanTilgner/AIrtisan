import { Router } from "express";
import {
  createOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  getOrganizationAdmins,
  checkAdminIsInOrganization,
  checkAdminIsOwnerOfOrganization,
  getOrganizationBotsThatAdminHasAccessTo,
} from "../database/functions/organization";
import { checkIsAdmin, isOwnerOfOrganization } from "../middleware/auth";
import { Admin } from "../database/models/admin";

const router = Router();

router.get("/", checkIsAdmin, async (req, res) => {
  try {
    const organizations = await getOrganizations();
    res.send({
      message: "success",
      success: true,
      data: organizations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:id", checkIsAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const organization = await getOrganization(id);
    res.send({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/", checkIsAdmin, async (req, res) => {
  try {
    const organization = await createOrganization(req.body);
    res.send({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.put("/:id", checkIsAdmin, isOwnerOfOrganization, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const organization = await updateOrganization(id, req.body);
    res.send({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.delete("/:id", checkIsAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const organization = await deleteOrganization(id);
    res.send({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:id/bots", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<string, Admin>).admin;
    if (!admin) return res.status(401).send({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (!id) return res.status(400).send({ error: "Invalid organization id" });
    const bots = await getOrganizationBotsThatAdminHasAccessTo(id, admin.id);

    if (!bots) return res.status(404).send({ error: "Organization not found" });

    res.send({
      message: "success",
      success: true,
      data: bots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:id/admins", checkIsAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) return res.status(400).send({ error: "Invalid organization id" });

    const organization = await getOrganization(id);

    if (!organization)
      return res.status(404).send({ error: "Organization not found" });

    const admins = await getOrganizationAdmins(id);

    res.send({
      message: "success",
      success: true,
      data: admins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:id/is_member/:admin_id", checkIsAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const admin_id = Number(req.params.admin_id);

    if (!id) return res.status(400).send({ error: "Invalid organization id" });

    if (!admin_id) return res.status(400).send({ error: "Invalid admin id" });

    const belongs = await checkAdminIsInOrganization(id, admin_id);

    res.send({
      message: "success",
      success: true,
      data: belongs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/:id/is_owner/:admin_id", checkIsAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const admin_id = Number(req.params.admin_id);

    if (!id) return res.status(400).send({ error: "Invalid organization id" });

    if (!admin_id) return res.status(400).send({ error: "Invalid admin id" });

    const organization = await getOrganization(id);

    if (!organization)
      return res.status(404).send({ error: "Organization not found" });

    const isOwner = await checkAdminIsOwnerOfOrganization(id, admin_id);

    res.send({
      message: "success",
      success: true,
      data: isOwner,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

export default router;
