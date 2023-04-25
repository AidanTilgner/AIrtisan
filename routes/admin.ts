import { Router } from "express";
import { getAdmin } from "../database/functions/admin";
import { checkIsAdmin } from "../middleware/auth";

const router = Router();

router.get("/:admin_id", checkIsAdmin, async (req, res) => {
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

export default router;
