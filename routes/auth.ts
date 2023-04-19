import {
  createAdmin,
  getAdminByUsername,
  getAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from "../database/functions/admin";
import { Router } from "express";
import { checkIsSuperAdmin, checkIsAdmin } from "../middleware/auth";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomPassword,
} from "../utils/crypto";
import {
  createRefreshToken,
  deleteAllRefreshTokensForAdmin,
  getRefreshToken,
} from "../database/functions/token";
import {
  createApiKey,
  deleteApiKey,
  getAllApiKeys,
} from "../database/functions/apiKey";

const router = Router();

router.post("/admin/register", checkIsSuperAdmin, async (req, res) => {
  try {
    const { username } = req.body;

    const generatedPassword = generateRandomPassword();

    const result = await createAdmin({
      username,
      password: generatedPassword,
      role: "admin",
    });
    if (!result) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }
    res.status(200).send({
      message: "Admin created successfully.",
      data: {
        username,
        password: generatedPassword,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/admin/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await getAdminByUsername(username);
    if (!admin) {
      res.status(401).send({ message: "Invalid credentials provided." });
      return;
    }

    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      res.status(401).send({ message: "Invalid credentials provided." });
      return;
    }

    const access_token = generateAccessToken(admin.id);
    const { token: refresh_token } = await createRefreshToken(admin.id);

    res.status(200).send({
      message: "Admin signed in successfully.",
      data: {
        access_token,
        refresh_token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const token = await getRefreshToken(refresh_token);
    if (!token) {
      res.status(401).send({ message: "Invalid refresh token provided." });
      return;
    }
    const verified = await verifyRefreshToken(refresh_token);
    if (!verified) {
      res.status(401).send({ message: "Invalid refresh token provided." });
      return;
    }
    const access_token = generateAccessToken(token.admin_id);
    res.status(200).send({
      message: "Access token refreshed successfully.",
      data: {
        access_token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/admins", checkIsSuperAdmin, async (req, res) => {
  try {
    const admins = await getAdmins();
    res.status(200).send({
      message: "Admins fetched successfully.",
      data: {
        admins,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.put("/admin/:id", checkIsSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    const admin = await getAdmin(parseInt(id));
    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }
    const result = await updateAdmin(parseInt(id), {
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

router.post("/check", async (req, res) => {
  try {
    const { access_token } = req.body;

    const verified = await verifyAccessToken(access_token);

    if (!verified) {
      res.status(401).send({
        message: "Invalid access token provided.",
        data: {
          authenticated: false,
        },
      });
      return;
    }

    res.status(200).send({
      message: "Access token verified successfully.",
      data: {
        authenticated: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/is_super_admin", checkIsAdmin, async (req, res) => {
  try {
    const admin = req["admin"];

    res.status(200).send({
      message: "Access token verified successfully.",
      data: {
        is_super_admin: admin.role === "superadmin",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/me", checkIsAdmin, async (req, res) => {
  try {
    const admin = req["admin"];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = admin;

    res.status(200).send({
      message: "Access token verified successfully.",
      data: {
        admin: adminWithoutPassword,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/admin/:id", checkIsSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await getAdmin(parseInt(id));
    if (!admin) {
      res.status(404).send({ message: "Admin not found." });
      return;
    }
    res.status(200).send({
      message: "Admin fetched successfully.",
      data: {
        admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.delete("/admin/:id", checkIsSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await getAdmin(parseInt(id));
    if (!admin) {
      res.status(404).send({ message: "Admin not found.", success: true });
      return;
    }
    const result = await deleteAdmin(parseInt(id));
    if (!result) {
      res
        .status(500)
        .send({ message: "Internal server error.", success: true });
      return;
    }
    res
      .status(200)
      .send({ message: "Admin deleted successfully.", success: true });
  } catch (err) {
    console.error(err);

    res.status(500).send({ message: "Internal server error.", success: true });
  }
});

router.post("/api-key/register", checkIsAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    const created = await createApiKey(name);

    if (!created) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    const { generated_key, result } = created;

    if (!result || !generated_key) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "API key created successfully.",
      data: {
        apiKey: {
          ...result,
          key: generated_key,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.delete("/api-key/:id", checkIsAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteApiKey(parseInt(id));

    if (!result) {
      res
        .status(500)
        .send({ message: "Internal server error.", data: { success: false } });
      return;
    }

    res.status(200).send({
      message: "API key deleted successfully.",
      data: { success: true },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Internal server error.", data: { success: false } });
  }
});

router.get("/api-keys", checkIsAdmin, async (req, res) => {
  try {
    const apiKeys = await getAllApiKeys();

    res.status(200).send({
      message: "API keys fetched successfully.",
      data: { apiKeys },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/admin/:admin_id/logout", async (req, res) => {
  try {
    const { admin_id } = req.params;

    if (!admin_id) {
      res
        .status(400)
        .send({ message: "Bad request.", data: { success: false } });
      return;
    }

    const deleted = await deleteAllRefreshTokensForAdmin(parseInt(admin_id));

    if (!deleted) {
      res
        .status(500)
        .send({ message: "Internal server error.", data: { success: false } });
      return;
    }

    res.status(200).send({
      message: "Admin logged out successfully.",
      data: { success: true },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ message: "Internal server error.", data: { success: false } });
  }
});

export default router;
