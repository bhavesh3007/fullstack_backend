import { Router } from "express";
import { loginuser, logoutuser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([]),
    registerUser
)

router.route("/login").post(
    upload.fields([]),
    loginuser
)
router.route("/logout").post(
    upload.fields([]),
    verifyJWT, 
    logoutuser
)

export default router
