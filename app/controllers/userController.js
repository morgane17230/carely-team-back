const { User, Company, Group } = require("../models");
const { jsonwebtoken } = require("../middlewares/jwt");
const emailValidator = require("email-validator");

const userController = {
    // Display all users

    getAllUsers: async (_, response) => {
        try {
            const users = await User.findAll();

            if (Object.keys(users).length === 0) {
                return response.status(404).json("No users found");
            }

            response.json(users);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Display one user

    getOneUser: async (request, response) => {
        try {
            let user = null;

            const numberId = parseInt(request.params.id, 10);
            if (isNaN(numberId)) {
                const userEmail = request.params.id;
                if (!emailValidator.validate(userEmail)) {
                    return response
                        .status(400)
                        .json("request.params.id is not an email");
                }

                // Find an user by his email

                user = await User.findOne({
                    where: {
                        email: userEmail,
                    },
                    include: [
                        "company",
                        {
                            association: "groups",
                            include: [
                                "users",
                                {
                                    association: "messages",
                                    include: ["user"],
                                },
                            ],
                        },
                    ],
                });
            } else {
                // Find an user by his id
                user = await User.findByPk(numberId, {
                    include: [
                        "company",
                        {
                            association: "groups",
                            include: [
                                "users",
                                {
                                    association: "messages",
                                    include: ["user"],
                                },
                            ],
                        },
                    ],
                });
            }

            const company = await Company.findOne({
                where: {
                    finess: user.company.finess,
                },
                include: [
                    "users",
                    {
                        association: "groups",
                        include: [
                            "users",
                            {
                                association: "messages",
                                include: ["user"],
                            },
                        ],
                    },
                ],
            });

            if (!user) {
                return response.status(404).json("User does not exist");
            }

            response.json({
                ...user.get({ plain: true }),
                company: company,
                logged: true,
            });
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Create an user

    createUser: async (request, response) => {
        try {
            if (!request.body) {
                return response.status(400).json("Missing body from request");
            }

            const {
                lastname,
                firstname,
                email,
                password,
                func,
                company_id,
                role,
            } = request.body;

            let missingParams = [];
            if (!lastname) {
                missingParams.push("lastname");
            }

            if (!firstname) {
                missingParams.push("firstname");
            }

            if (!email) {
                missingParams.push("email");
            }

            if (!password) {
                missingParams.push("password");
            }

            if (!func) {
                missingParams.push("func");
            }

            if (missingParams.length > 0) {
                return response
                    .status(400)
                    .json(
                        `Missing body parameter(s): ${missingParams.join(", ")}`
                    );
            }

            const validParams = [
                "lastname",
                "firstname",
                "func",
                "email",
                "password",
                "role",
                "company_id",
            ];
            let uselessParams = [];

            for (const [key] of Object.entries(request.body)) {
                if (!validParams.find((param) => param === key)) {
                    uselessParams.push(key);
                }
            }

            if (uselessParams.length > 0) {
                return response
                    .status(400)
                    .json(
                        `Useless body parameter(s): ${uselessParams.join(", ")}`
                    );
            }

            if (password === "") {
                return response
                    .status(400)
                    .json("Password does not meet requirements");
            }

            if (!emailValidator.validate(email)) {
                return response.status(400).json("Email invalide");
            }

            if (!company_id === 0) {
                return response
                    .status(400)
                    .json("Un établissement doit être choisi");
            }

            const existingCompanyWithUser = await User.findOne({
                where: {
                    company_id: company_id,
                    role: "admin",
                },
            });

            if (existingCompanyWithUser && role === "admin") {
                return response
                    .status(400)
                    .json("Cet établissement a déjà un compte");
            }

            const existingUser = await User.findOne({
                where: {
                    email: email,
                },
            });

            if (existingUser) {
                return response
                    .status(409)
                    .json("Email already exists, wrong password");
            }

            const user = await User.create(request.body);
            const company = await Company.findOne({
                where: {
                    id: user.company_id,
                },
                include: [
                    "users",
                    {
                        association: "groups",
                        include: [
                            "users",
                            {
                                association: "messages",
                                include: ["user"],
                            },
                        ],
                    },
                ],
            });
            const jwtContent = { userId: user.id, group_id: 0, logged: true };
            const jwtOptions = {
                algorithm: "HS256",
                expiresIn: "2h",
            };

            response.json({
                ...user.get({ plain: true }),
                company: company,
                logged: true,
                token: jsonwebtoken.sign(
                    jwtContent,
                    process.env.jwtSecret,
                    jwtOptions
                ),
            });
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Modify an user

    updateUser: async (request, response) => {
        try {
            if (!request.body) {
                return response.status(400).json("Missing body from request");
            }

            const {
                email,
                group_role,
                role,
            } = request.body;

            const validParams = [
                "lastname",
                "firstname",
                "func",
                "email",
                "password",
                "role",
                "group_role",
                "group_id",
            ];
            let uselessParams = [];

            for (const [key] of Object.entries(request.body)) {
                if (!validParams.find((param) => param === key)) {
                    uselessParams.push(key);
                }
            }

            if (uselessParams.length > 0) {
                return response
                    .status(400)
                    .json(
                        `Useless body parameter(s): ${uselessParams.join(", ")}`
                    );
            }

            if (email && !emailValidator.validate(email)) {
                return response.status(400).json("Invalid email");
            }

            const userId = parseInt(request.params.id, 10);
            if (isNaN(userId)) {
                return response.status(400).json("ID is NaN");
            }

            const user = await User.findByPk(userId, {
                include: [
                    "company",
                    {
                        association: "groups",
                        include: [
                            "users",
                            {
                                association: "messages",
                                include: ["user"],
                            },
                        ],
                    },
                ],
            });

            if (!user) {
                return response.status(404).json("User not found");
            }

            // request.company_role and request.group_role comes from roleMiddleware.js
            const allowedToPromoteInCompany =
                request.user.companyId &&
                request.user.companyId !== 0 &&
                user.role &&
                request.user.role &&
                request.user.role === "admin";
            const allowedToPromoteInGroup =
                request.user.groupId &&
                request.user.groupId !== 0 &&
                group_role &&
                request.group_role &&
                request.group_role === "author";

            if (allowedToPromoteInCompany) {
                // attaching user to a company
                if (request.user.companyId === companyId) {
                    return response
                        .status(400)
                        .json("Not authorized to self edit role");
                }

                const company = await Company.findByPk(request.user.companyId);
                if (!company) {
                    return response.status(404).json("Company does not exist");
                }

                const relation = user.role;

                if (role === "remove") {
                    // remove from company
                    user.removeCompany(company);
                } else if (!relation) {
                    // relation does not exist, create it
                    await user.addCompany(company, {
                        through: { role: user.role },
                    });
                } else {
                    // set our role and save it
                    relation.role = user.role;

                    await relation.save();
                }
            } else if (allowedToPromoteInGroup) {
                // attaching user to a group
                if (request.user.userId === userId) {
                    return response
                        .status(400)
                        .json("Not authorized to self edit role");
                }
                const group = await Group.findByPk(request.user.groupId);
                if (!group) {
                    return response.status(404).json("Group does not exist");
                }

                const relation = group.group_has_user;
                if (group_role === "remove") {
                    // remove from group
                    user.removeGroup(group);
                } else if (!relation) {
                    // relation does not exist, create it
                    await user.addGroup(group, {
                        through: { role: group_role },
                    });
                } else {
                    // set our role and save it
                    relation.role = group_role;

                    await relation.save();
                }
            } else {
                user.set(request.body);

                await user.save();
            }

            response.json(user.get({ plain: true }));
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Delete an user

    deleteUser: async (request, response) => {
        try {
            const userId = parseInt(request.params.id, 10);
            if (isNaN(userId)) {
                return response.status(400).json("ID is NaN");
            }

            const user = await User.findByPk(userId);

            if (!user) {
                return response.status(404).json("User does not exist");
            }

            await user.destroy();
            response.json("Successfully deleted user");
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Login an user

    verifyLogin: async (request, response) => {
        try {
            if (!request.body) {
                return response.status(400).json("Missing body from request");
            }

            const { email, password } = request.body;

            let missingParams = [];
            if (!email) {
                missingParams.push("email");
            }

            if (!password) {
                missingParams.push("password");
            }

            if (missingParams.length > 0) {
                return response
                    .status(400)
                    .json(
                        `Missing body parameter(s): ${missingParams.join(", ")}`
                    );
            }

            if (!emailValidator.validate(email)) {
                return response.status(400).json("Email invalide");
            }

            const user = await User.scope("pass").findOne({
                where: {
                    email: email,
                },
                include: [
                    "company",
                    {
                        association: "groups",
                        include: [
                            "users",
                            {
                                association: "messages",
                                include: ["user"],
                            },
                        ],
                    },
                ],
            });

            if (!user) {
                return response
                    .status(404)
                    .json("Cet utilisateur n'existe pas");
            }

            const passwordMatches = await user.validPassword(password);

            if (!passwordMatches) {
                return response.status(404).json("Mot de passe invalide");
            }
            console.log(passwordMatches);
            const company = await Company.findOne({
                where: {
                    id: user.company_id,
                },
                include: [
                    "users",
                    {
                        association: "groups",
                        include: [
                            "users",
                            {
                                association: "messages",
                                include: ["user"],
                            },
                        ],
                    },
                ],
            });

            const jwtContent = { userId: user.id, logged: true, groupId: 0 };
            const jwtOptions = {
                algorithm: "HS256",
                expiresIn: "2h",
            };

            response.json({
                ...user.get({ plain: true }),
                company: company,
                logged: true,
                token: jsonwebtoken.sign(
                    jwtContent,
                    process.env.jwtSecret,
                    jwtOptions
                ),
            });
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Refresh token informations (group_id)

    tokenRefresh: async (request, response) => {
        if (!request.user) {
            return response.status(404).json("No token found");
        }

        const { group_id } = request.body;
        console.log(group_id);
        const user = await User.findByPk(request.user.userId, {
            include: [
                "company",
                {
                    association: "groups",
                    include: [
                        "users",
                        {
                            association: "messages",
                            include: ["user"],
                        },
                    ],
                },
            ],
        });

        if (!user) {
            return response.status(404).json("User not found");
        }

        const company = await Company.findOne({
            where: {
                finess: user.company.finess,
            },
            include: [
                "users",
                {
                    association: "groups",
                    include: [
                        "users",
                        {
                            association: "messages",
                            include: ["user"],
                        },
                    ],
                },
            ],
        });

        let finalGroupId = 0;

        if (group_id !== undefined) {
            finalGroupId = group_id;
            console.log(finalGroupId);
        } else if (request.user.groupId !== undefined) {
            finalGroupId = request.user.groupId;
        }

        const jwtContent = {
            userId: user.id,
            logged: true,
            groupId: finalGroupId,
        };
        const jwtOptions = {
            algorithm: "HS256",
            expiresIn: "2h",
        };

        response.json({
            ...user.get({ plain: true }),
            company: company,
            logged: true,
            token: jsonwebtoken.sign(
                jwtContent,
                process.env.jwtSecret,
                jwtOptions
            ),
        });
    },

    // Find user who has forgot his password

    getOneUserForgotPassword: async (request, response) => {
        try {
            let user = null;
            user = await User.findOne({
                where: {
                    email: request.body.email,
                },
            });

            if (!user) {
                return response.status(404).json("User does not exist");
            }

            const jwtContent = { userId: user.id, userEmail: user.email };
            const jwtOptions = {
                algorithm: "HS256",
                expiresIn: 15 * 60,
            };
            response.json({
                logged: false,
                token: jsonwebtoken.sign(
                    jwtContent,
                    process.env.jwtSecret,
                    jwtOptions
                ),
            });
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },
};

module.exports = userController;
