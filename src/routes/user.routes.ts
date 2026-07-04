import { Router } from "express";
import * as user from "../controllers/user.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { UpdateProfileSchema, ChangePasswordSchema } from "../validators/user.schema";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.use(authenticateUser);

router.get("/profile",                                         user.getProfile);
router.put("/profile",        validate(UpdateProfileSchema),   user.updateProfile);
router.put("/change-password",validate(ChangePasswordSchema),  user.changePassword);
router.post("/upload-avatar",  upload.single("avatar"),        user.uploadAvatar);

export default router;
