import {
  createAdmin,
  getAdminByUsername,
  updateAdmin,
  getAdminOrganizations,
  checkUsernameTaken,
  getAdminNotifications,
  getAdminOrganizationInvitations,
  getAdminRecentBots,
} from "../database/functions/admin";
import { Router } from "express";
import { checkIsAdmin, hasAccessToBot } from "../middleware/auth";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/crypto";
import {
  createRefreshToken,
  deleteAllRefreshTokensForAdmin,
  getRefreshToken,
} from "../database/functions/token";
import {
  createApiKey,
  deleteApiKey,
  getApiKeysForBot,
} from "../database/functions/apiKey";
import { Admin } from "../database/models/admin";
import { config } from "dotenv";
import { getOrganizationInvitationByAdmin } from "../database/functions/organization";
import {
  getBotsAdminHasAccessTo,
  getBotsByOwner,
} from "../database/functions/bot";
import { checkAdminIsAdmin } from "../middleware/admin";
import { Logger } from "../utils/logger";
import multer from "multer";
import { deleteFile } from "../utils/files";

config();

const authLogger = new Logger({
  name: "Auth Router",
});

const router = Router();

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
    authLogger.error("Error signing in admin: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/admin/signup", async (req, res) => {
  try {
    const { ALLOW_NEW_USERS } = process.env;

    if (ALLOW_NEW_USERS !== "TRUE") {
      res.status(403).send({ message: "New users are not allowed." });
      return;
    }

    const { username, password } = req.body;
    const admin = await getAdminByUsername(username);

    if (admin) {
      res.status(409).send({ message: "Admin already exists." });
      return;
    }

    const result = await createAdmin({
      username,
      password,
      role: "admin",
    });

    if (!result) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    const access_token = generateAccessToken(result.id);
    const { token: refresh_token } = await createRefreshToken(result.id);

    res.status(200).send({
      message: "Admin signed up successfully.",
      data: {
        access_token,
        refresh_token,
      },
    });
  } catch (err) {
    authLogger.error("Error signing up admin: ", err);
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
    authLogger.error("Error refreshing access token: ", err);
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
        data: false,
      });
      return;
    }

    res.status(200).send({
      message: "Access token verified successfully.",
      data: true,
    });
  } catch (err) {
    authLogger.error("Error verifying access token: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/is_super_admin", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    res.status(200).send({
      message: "Access token verified successfully.",
      data: admin.role === "superadmin",
    });
  } catch (err) {
    authLogger.error("Error verifying access token: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/me", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = admin;

    res.status(200).send({
      message: "Got admin from session.",
      data: adminWithoutPassword,
    });
  } catch (err) {
    authLogger.error("Error getting admin from session: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.put("/me", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    if (!admin) {
      res
        .status(500)
        .send({ message: "There was an error updating your profile." });
      return;
    }

    const { username, display_name, email } = req.body;

    const usernameTaken = username
      ? await checkUsernameTaken(username, admin.id)
      : false;

    if (usernameTaken) {
      res.status(409).send({ message: "Username already taken." });
      return;
    }

    const result = await updateAdmin(admin.id, {
      username,
      display_name,
      email,
    });

    if (!result) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Admin updated successfully.",
      data: result,
    });
  } catch (err) {
    authLogger.error("Error updating admin: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/me/organizations", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    const organizations = await getAdminOrganizations(admin.id);

    if (!organizations) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Got admin organizations from session.",
      data: organizations,
    });
  } catch (err) {
    authLogger.error("Error getting admin organizations from session: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/me/bots", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    const bots = await getBotsByOwner(admin.id, "admin", "private", false);

    if (!bots) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Got admin bots from session.",
      data: bots,
    });
  } catch (err) {
    authLogger.error("Error getting admin bots from session: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/me/bots/all", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    if (!admin) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    const bots = await getBotsAdminHasAccessTo(admin.id);

    if (!bots) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Got all bots admin has access to.",
      data: bots,
    });
  } catch (error) {
    authLogger.error("Error getting admin bots from session: ", error);
    return null;
  }
});

router.get("/me/bots/recent", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    if (!admin) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    const bots = await getAdminRecentBots(admin.id);

    if (!bots) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Got admin bots from session.",
      data: bots,
    });
  } catch (error) {
    authLogger.error("Error getting admin bots from session: ", error);
    return null;
  }
});

router.get("/me/notifications", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    const notifications = await getAdminNotifications(admin.id);

    if (!notifications) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Got admin notifications from session.",
      data: notifications,
    });
  } catch (err) {
    authLogger.error("Error getting admin notifications from session: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/me/organization_invitations", checkIsAdmin, async (req, res) => {
  try {
    const admin = (req as unknown as Record<"admin", Admin>)["admin"];

    const invitations = await getAdminOrganizationInvitations(admin.id);

    if (!invitations) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Got admin organization invitations from session.",
      data: invitations,
    });
  } catch (err) {
    authLogger.error(
      "Error getting admin organization invitations from session: ",
      err
    );
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get(
  "/me/organization_invitation/:organization_id",
  checkIsAdmin,
  async (req, res) => {
    try {
      const admin = (req as unknown as Record<"admin", Admin>)["admin"];
      const { organization_id } = req.params;
      if (!organization_id) {
        res.status(400).send({ message: "Missing organization id." });
        return;
      }

      const invitation = await getOrganizationInvitationByAdmin(
        Number(organization_id),
        admin.id
      );

      if (!invitation) {
        res.status(200).send({
          message:
            "No organization invitation exists for this admin and this organization.",
          data: null,
        });
        return;
      }

      res.status(200).send({
        message: "Got admin organization invitation from session.",
        data: invitation,
      });
    } catch (err) {
      authLogger.error(
        "Error getting admin organization invitation from session: ",
        err
      );
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

const upload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/data/user-data/profiles/profile_pictures");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

router.put(
  "/me/profile_picture",
  checkIsAdmin,
  multer({ storage: upload }).single("profile_picture"),
  async (req, res) => {
    try {
      const admin = (req as unknown as Record<"admin", Admin>)["admin"];
      const { file } = req;

      if (!file) {
        res.status(400).send({ message: "Profile picture not provided." });
        return;
      }

      if (!admin) {
        res.status(404).send({ message: "Admin not found." });
        return;
      }

      if (admin.profile_picture_path) {
        deleteFile(
          `public/data/user-data/profiles/profile_pictures/${admin.profile_picture_path}`
        );
      }

      const result = await updateAdmin(admin.id, {
        profile_picture_path: file.filename,
      });

      if (!result) {
        res.status(500).send({ message: "Internal server error." });
        return;
      }

      res.status(200).send({
        message: "Admin profile picture updated successfully.",
        data: file.filename,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.post(
  "/api-key/register",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const { name } = req.body;
      const bot_id = req.body.bot_id || req.query.bot_id;

      if (!name) {
        res.status(400).send({ message: "Missing name." });
        return;
      }

      if (!bot_id) {
        res.status(400).send({ message: "Missing bot id." });
        return;
      }

      const created = await createApiKey(name, bot_id);

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
          ...result,
          key: generated_key,
        },
      });
    } catch (err) {
      authLogger.error("Error creating API key: ", err);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.delete(
  "/api-key/:id",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await deleteApiKey(parseInt(id));

      if (!result) {
        res.status(500).send({
          message: "Internal server error.",
          data: { success: false },
        });
        return;
      }

      res.status(200).send({
        message: "API key deleted successfully.",
        data: { success: true },
      });
    } catch (err) {
      authLogger.error("Error deleting API key: ", err);
      res
        .status(500)
        .send({ message: "Internal server error.", data: { success: false } });
    }
  }
);

router.get("/api-keys", checkIsAdmin, hasAccessToBot, async (req, res) => {
  try {
    const bot_id = req.body.bot_id || req.query.bot_id;

    if (!bot_id) {
      res.status(400).send({ message: "Missing bot id." });
      return;
    }

    const apiKeys = await getApiKeysForBot(Number(bot_id));

    res.status(200).send({
      message: "API keys fetched successfully.",
      data: apiKeys,
    });
  } catch (err) {
    authLogger.error("Error fetching API keys: ", err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/admin/:admin_id/logout", checkAdminIsAdmin, async (req, res) => {
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
    authLogger.error("Error logging out admin: ", err);
    res
      .status(500)
      .send({ message: "Internal server error.", data: { success: false } });
  }
});

export default router;
