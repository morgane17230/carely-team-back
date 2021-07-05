const { User } = require("./models");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

let transporter = nodemailer.createTransport({
    name: localhost,
    host: process.env.smtpHost,
    port: 587,
    secure: false,
    auth: {
        user: process.env.smtpUser,
        pass: process.env.smtpPass,
    },
});

const handlebarOptions = {
    viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve(__dirname, "../views"),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, "../views"),
    extName: ".hbs",
};

transporter.use("compile", hbs(handlebarOptions));

const sendMail = async (request, response) => {
    if (!request.body) {
        return response.status(400).json("Missing body from request");
    }

    const { email, message, lastname, firstname, type, emails, company } =
        request.body;
    
    let options = {};
    if (type === "invite" && emails && company) {
        if (emails.length > 0) {
            options = {
                from: company.name,
                bcc: emails,
                subject: `Invitation de l'établissement ${company.name} sur CarelyTeam`,
                template: "invite",
                context: {
                    company: company.name,
                    finess: company.finess,
                },
            };
        } else {
            return response
                .status(409)
                .json("Veuillez entrer au moins une adresse email");
        }
        
    } else if (
        type === "contact" &&
        lastname &&
        firstname &&
        email &&
        message
    ) {
        options = {
            to: process.env.recipientEmail,
            subject: `Contact de ${email}`,
            template: "contact",
            context: {
                firstname: firstname,
                lastname: lastname,
                email: message,
                message: message,
            },
        };
    } else if (type === "forgotPassword" && email) {
        user = await User.findOne({
            where: {
                email: email,
            },
        });
        if (user) {
            options = {
                to: user.email,
                subject: `Mot de passe oublié`,
                template: "forgotPassword",
                context: {
                    user: user,
                },
            };
        } else {
            return response
                .status(409)
                .json("Aucun utilisateur avec cet email");
        }
    } else if (type === "resetPassword" && email) {
        options = {
            to: email,
            subject: `Mot de passe modifié`,
            template: "resetPassword",
        };
    } else {
        console.log("Nodemailer wrong parameters");
        return;
    }

    let mailOptions = {
        from: process.env.smtpUser,
        ...options,
    };

    transporter.sendMail(mailOptions, (error, _) => {
        
        if (error) {
            return response.status(409).json(error.message);
        } else {
            return response.json("Email(s) envoyé(s)");
        }
    });
};

module.exports = sendMail;
