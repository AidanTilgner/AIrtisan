import { Router } from "express";
import {
  getAdmin,
  getAdminByUsername,
  getAdmins,
  updateAdmin,
} from "../database/functions/admin";
import { checkIsAdmin, checkIsSuperAdmin } from "../middleware/auth";
import { getBotsByOwner } from "../database/functions/bot";
import {
  getAdminOrganizations,
  searchAdmins,
} from "../database/functions/admin";
import { Admin } from "../database/models/admin";

const router = Router();

router.get("/search", checkIsAdmin, async (req, res) => {
  try {
    const { query } = req.query as { query: string };

    if (!query) {
      res.status(400).send({ message: "Query not provided." });
      return;
    }

    const admins = await searchAdmins(query);

    res.status(200).send({
      message: "Admins fetched successfully.",
      data: admins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/", checkIsSuperAdmin, async (req, res) => {
  try {
    const admins = await getAdmins();
    res.status(200).send({
      message: "Admins fetched successfully.",
      data: admins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.put("/:admin_id", checkIsSuperAdmin, async (req, res) => {
  try {
    const { admin_id } = req.params;
    const { username, password, role } = req.body;
    const admin = await getAdmin(parseInt(admin_id));
    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }
    const result = await updateAdmin(parseInt(admin_id), {
      username,
      password,
      role,
    });
    if (!result) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }
    res.status(200).send({ message: "Admin updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/:admin_id", checkIsAdmin, async (req, res) => {
  try {
    const { admin_id } = req.params;

    const currentAdmin = req["admin"] as Admin;

    if (!admin_id) {
      res.status(400).send({ message: "Admin ID not provided." });
      return;
    }

    const formattedAdminId = parseInt(admin_id);

    const admin = await getAdmin(
      formattedAdminId,
      currentAdmin.id === Number(admin_id)
    );

    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }

    res.status(200).send({
      message: "Admin fetched successfully.",
      data: admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/:admin_id/bots", checkIsAdmin, async (req, res) => {
  try {
    const { admin_id } = req.params;

    if (!admin_id) {
      res.status(400).send({ message: "Admin ID not provided." });
      return;
    }

    const formattedAdminId = parseInt(admin_id);

    const admin = await getAdmin(formattedAdminId);

    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }

    const bots = await getBotsByOwner(formattedAdminId, "admin");

    res.status(200).send({
      message: "Admin bots fetched successfully.",
      data: bots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/:admin_id/organizations", checkIsAdmin, async (req, res) => {
  try {
    const { admin_id } = req.params;

    if (!admin_id) {
      res.status(400).send({ message: "Admin ID not provided." });
      return;
    }

    const formattedAdminId = parseInt(admin_id);

    const admin = await getAdmin(formattedAdminId);

    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }

    const organizations = await getAdminOrganizations(formattedAdminId);

    res.status(200).send({
      message: "Admin organizations fetched successfully.",
      data: organizations,
    });
  } catch (err) {
    console.error(err);

    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/by_name/:username", checkIsAdmin, async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).send({ message: "Username not provided." });
      return;
    }

    const admin = await getAdminByUsername(username);

    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }

    res.status(200).send({
      message: "Admin fetched successfully.",
      data: admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

export default router;
