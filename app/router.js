const express = require("express");
const router = express.Router();
const sendMail = require("./nodemailer");
const {
    authorizationMiddleware,
    tokenMiddleware,
} = require("./middlewares/jwt");

const {
    userMiddleware,
} = require("./middlewares/controllersMiddleware");
const roleMiddleware = require("./middlewares/roleMiddleware");
const companyController = require("./controllers/companyController");
const groupController = require("./controllers/groupController");
const userController = require("./controllers/userController");
const messageController = require("./controllers/messageController");

// HomePage

router.get("/", (_, res) => {
    console.log(">> GET /");
    res.sendFile(__dirname + "/index.html");
});

// Company Routes

router.get("/companies", companyController.getAllCompanies);
router.get("/company/:finess", companyController.getOneCompany);

// Group Routes

router.get("/groups", authorizationMiddleware, groupController.getAllGroups);
router.get(
    "/group/:id",
    authorizationMiddleware,
    roleMiddleware,
    groupController.getOneGroup
);
router.post("/groups", authorizationMiddleware, groupController.createGroup);
router.put(
    "/group/:id",
    authorizationMiddleware,
    roleMiddleware,
    groupController.updateGroup
);
router.delete(
    "/group/:id",
    authorizationMiddleware,
    roleMiddleware,
    groupController.deleteGroup
);

// Routes User

router.get(
    "/users",
    authorizationMiddleware,
    roleMiddleware,
    userController.getAllUsers
);
router.get(
    "/user/:id",
    authorizationMiddleware,
    userMiddleware,
    userController.getOneUser
);
router.post("/users", tokenMiddleware, userController.createUser);
router.put("/user/:id", authorizationMiddleware, roleMiddleware, userController.updateUser);
router.delete("/user/:id", userController.deleteUser);
router.post("/user", userController.verifyLogin);
router.post(
    "/user/refresh",
    authorizationMiddleware,
    userController.tokenRefresh
);
router.post("/user/forgot", userController.getOneUserForgotPassword);

// Routes Message

router.get(
    "/messages",
    authorizationMiddleware,
    roleMiddleware,
    messageController.getAllMessages
);
router.get(
    "/message/:id",
    authorizationMiddleware,
    roleMiddleware,
    messageController.getOneMessage
);
router.post(
    "/messages",
    authorizationMiddleware,
    roleMiddleware,
    messageController.createMessage
);
router.put(
    "/message/:id",
    authorizationMiddleware,
    roleMiddleware,
    messageController.updateMessage
);
router.delete(
    "/message/:id",
    authorizationMiddleware,
    roleMiddleware,
    messageController.deleteMessage
);

// contact form nodemailer
router.post("/contact", sendMail);

// forgot password nodemailer
router.post("/forgot", sendMail);

//reset password nodemailer
router.post("/reset", sendMail);

//reset password nodemailer
router.post("/invite", sendMail);

module.exports = router;
