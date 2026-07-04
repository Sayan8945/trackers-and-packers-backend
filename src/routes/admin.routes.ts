import { Router } from "express";
import * as admin from "../controllers/admin.controller";
import { getLeads, getLeadById, updateLeadStatus, deleteLead } from "../controllers/lead.controller";
import { createBlog, updateBlog, deleteBlog, getAllBlogsAdmin } from "../controllers/blog.controller";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "../controllers/testimonial.controller";
import { getContacts } from "../controllers/contact.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { UpdateLeadStatusSchema } from "../validators/lead.schema";

const router = Router();

// Admin login — public
router.post("/login", admin.adminLogin);

// All routes below require admin JWT
router.use(authenticateAdmin);

router.get("/dashboard", admin.getDashboard);

// Leads
router.get("/leads",             getLeads);
router.get("/leads/:id",         getLeadById);
router.put("/leads/:id",         validate(UpdateLeadStatusSchema), updateLeadStatus);
router.delete("/leads/:id",      deleteLead);

// Blogs
router.get("/blogs",             getAllBlogsAdmin);
router.post("/blogs",            createBlog);
router.put("/blogs/:id",         updateBlog);
router.delete("/blogs/:id",      deleteBlog);

// Testimonials
router.post("/testimonials",     createTestimonial);
router.put("/testimonials/:id",  updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

// Contacts
router.get("/contacts",          getContacts);

export default router;
