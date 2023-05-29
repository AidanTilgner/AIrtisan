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
  createOrganizationInvitation,
  getOrganizationInvitations,
  getOrganizationInvitationByToken,
  markOrganizationInviteAsAcceptedOrRejectedByToken,
} from "../database/functions/organization";
import {
  checkIsAdmin,
  checkIsSuperAdmin,
  isOwnerOfOrganization,
} from "../middleware/auth";
import { Admin } from "../database/models/admin";

const router = Router();

router.get("/all", checkIsSuperAdmin, async (req, res) => {
  try {
    const organizations = await getOrganizations();

    res.send({
      message: "success",
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error(error);
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
    const admin = (req as unknown as Record<string, Admin>).admin;
    if (!admin) return res.status(401).send({ error: "Unauthorized" });

    const { name, description } = req.body;

    if (!name) {
      res.status(400).send({
        message: "Name is required",
      });
    }

    if (!description) {
      res.status(400).send({
        message: "Description is required",
      });
    }

    const organization = await createOrganization({
      name,
      description,
      owner_id: admin.id,
    });
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

router.delete("/:id", checkIsAdmin, isOwnerOfOrganization, async (req, res) => {
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

router.post(
  "/:id/invite",
  checkIsAdmin,
  isOwnerOfOrganization,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const admin_id = Number(req.body.admin_id);

      if (!id)
        return res.status(400).send({ error: "Invalid organization id" });

      if (!admin_id) return res.status(400).send({ error: "Invalid admin id" });

      const invite = await createOrganizationInvitation(id, admin_id);

      if (!invite)
        return res.status(500).send({ error: "Internal server error" });

      res.send({
        message: "success",
        success: true,
        data: invite,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

router.get(
  "/:id/invitations",
  checkIsAdmin,
  isOwnerOfOrganization,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!id)
        return res.status(400).send({ error: "Invalid organization id" });

      const organization = await getOrganization(id);

      if (!organization)
        return res.status(404).send({ error: "Organization not found" });

      const invites = await getOrganizationInvitations(id);

      res.send({
        message: "success",
        success: true,
        data: invites,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

router.get("/invitation/by_token/:token", checkIsAdmin, async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) return res.status(400).send({ error: "Invalid token" });

    const invite = await getOrganizationInvitationByToken(token);

    if (!invite) return res.status(404).send({ error: "Invitation not found" });

    res.send({
      message: "success",
      success: true,
      data: invite,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/invitation/complete", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<string, Admin>).admin;
    const token = req.body.token || req.query.token;
    const accept = req.body.accept || req.query.accept;

    if (!admin) return res.status(401).send({ error: "Unauthorized" });
    if (!token) return res.status(400).send({ error: "Invalid token" });

    const invitation = await getOrganizationInvitationByToken(token);

    if (!invitation)
      return res.status(404).send({ error: "Invitation not found" });

    if (!(invitation.admin.id === admin.id))
      return res.status(401).send({ error: "Unauthorized" });

    const invite = await markOrganizationInviteAsAcceptedOrRejectedByToken(
      token,
      accept
    );

    if (!invite) return res.status(404).send({ error: "Invitation not found" });

    res.send({
      message: "success",
      success: true,
      data: invite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

export default router;
