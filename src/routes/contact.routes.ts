import { Router } from "express";
import { submitContact } from "../controllers/contact.controller";
import { validate } from "../middleware/validate.middleware";
import { ContactSchema } from "../validators/user.schema";

const router = Router();

router.post("/", validate(ContactSchema), submitContact);

export default router;
