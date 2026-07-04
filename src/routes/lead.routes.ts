import { Router } from "express";
import { createLead } from "../controllers/lead.controller";
import { validate } from "../middleware/validate.middleware";
import { CreateLeadSchema } from "../validators/lead.schema";

const router = Router();

router.post("/", validate(CreateLeadSchema), createLead);

export default router;
