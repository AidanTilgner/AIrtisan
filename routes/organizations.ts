import { Router } from "express";
import {
  createOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
} from "../database/functions/organization";
import { getOrganizationBotsWithRunningStatus } from "../database/functions/bot";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const organizations = await getOrganizations();
    res.json({
      message: "success",
      success: true,
      data: organizations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const organization = await getOrganization(id);
    res.json({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const organization = await createOrganization(req.body);
    res.json({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const organization = await updateOrganization(id, req.body);
    res.json({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const organization = await deleteOrganization(id);
    res.json({
      message: "success",
      success: true,
      data: organization,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/bots", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid organization id" });
    const bots = await getOrganizationBotsWithRunningStatus(id);

    if (!bots) return res.status(404).json({ error: "Organization not found" });

    res.json({
      message: "success",
      success: true,
      data: bots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
