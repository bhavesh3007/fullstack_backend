import { Router } from "express";
import { loginuser, logoutuser, refreshAccessToken, registerUser, changeCurrentPassword, getCurrentUser, updateAccountDetails } from "../controllers/user.controller.js";
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
    verifyJWT, 
    logoutuser
)

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/change-password").post(
    upload.fields([]),
    verifyJWT,
    changeCurrentPassword
)

router.route("/getuser").get(
    verifyJWT,
    getCurrentUser
)

router.route("/update-user").patch(
    verifyJWT,
    updateAccountDetails
)


export default router
