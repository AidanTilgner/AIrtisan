import {
  createAdmin,
  getAdminByUsername,
  getAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from "../database/functions/admin";
import { Router } from "express";
import { checkIsSuperAdmin } from "../middleware/auth";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/crypto";
import {
  createRefreshToken,
  getRefreshToken,
} from "../database/functions/token";

const router = Router();

router.post("/register", checkIsSuperAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await createAdmin({
      username,
      password,
      role: "admin",
    });
    if (!result) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }
    res.status(200).send({ message: "Admin created successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/signin", async (req, res) => {
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
    const verified = verifyRefreshToken(refresh_token);
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

router.get("/", checkIsSuperAdmin, async (req, res) => {
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

router.get("/:id", checkIsSuperAdmin, async (req, res) => {
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

router.put("/:id", checkIsSuperAdmin, async (req, res) => {
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

    const verified = verifyAccessToken(access_token);
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

export default router;
