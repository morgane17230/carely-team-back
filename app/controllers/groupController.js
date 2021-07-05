const { Group, User } = require("../models");

const groupController = {
    // Display all Groups

    getAllGroups: async (_, response, next) => {
        try {
            const allGroups = await Group.findAll({
                include: [
                    "users",
                    {
                        association: "messages",
                        include: ["user"],
                    },
                ],
            });
            allGroups ? response.json(allGroups) : next();
        } catch (error) {
            console.trace(error);
            response.status(500).json(error.toString());
        }
    },

    // Display one Group

    getOneGroup: async (request, response, next) => {
        try {
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                return response.status(400).json("ID is NaN");
            }

            const group = await Group.findByPk(id, {
                include: [
                    "users",
                    {
                        association: "messages",
                        include: ["user"],
                    },
                ],
            });
            group ? response.json(group) : next();
        } catch (error) {
            console.trace(error);
            response.status(500).json(error.toString());
        }
    },

    // Create a Group

    createGroup: async (request, response) => {
        // vérification de l'existence des données entrantes du formulaire
        try {
            if (!request.body) {
                return response
                    .status(400)
                    .json("Aucune donnée d'entrée trouvée");
            }
            // définition des entrées valides à la création d'un groupe
            const { type, title, start_time, end_time, company_id } =
                request.body;
            // vérification de l'existence d'un type en donnée d'entrée
            if (!type) {
                return response
                    .status(400)
                    .json("Un type doit être sélectionné");
            }
            // vérification de l'existence d'un ordre du jour en donnée d'entrée
            if (!title) {
                return response
                    .status(400)
                    .json("Veuillez saisir un ordre du jour");
            }
            // vérification de l'existence d'une date de début en donnée d'entrée
            if (!start_time) {
                return response
                    .status(400)
                    .json("Veuillez choisir une date de début");
            }
            // vérification de l'existence d'une date de fin en donnée d'entrée
            if (!end_time) {
                return response
                    .status(400)
                    .json("Veuillez choisir une date de fin");
            }
            // vérification de l'existence d'un id d'établissement en donnée d'entrée
            if (!company_id) {
                return response
                    .status(400)
                    .json("Un id d'établissement doit être choisi");
            }
            // requête de sélection de l'utilisateur, créateur du groupe
            const user = await User.findByPk(request.user.userId);
            if (!user) {
                return response
                    .status(500)
                    .json("Cet utilisateur n'existe pas");
            }
            // requête de création du groupe avec les propriétés correspondantes
            const newGroup = await Group.create({
                type,
                title,
                start_time,
                end_time,
                company_id,
            });
            // définition de l'utilisateur comme créateur de ce groupe 
            // dans la table groupe_has_user
            await user.addGroup(newGroup, { through: { role: "author" } });
            // renvoi des données du groupe en réponse en cas de succès
            response.json(newGroup);
        } catch (err) {
            // renvoi de l'erreur en console en cas d'erreur
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Modify a Group

    updateGroup: async (request, response) => {
        try {
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                return response.status(400).json("ID is NaN");
            }

            const group = await Group.findByPk(id);

            if (!group) {
                return response.status(404).json("Aucun groupe avec cet id");
            }

            if (!request.body) {
                return response.status(400).json("Missing body from request");
            }

            const { type, title, start_time, end_time } = request.body;

            if (type) {
                group.type = type;
            }
            if (title) {
                group.title = title;
            }
            if (start_time) {
                group.start_time = start_time;
            }
            if (end_time) {
                group.end_time = end_time;
            }

            await group.save();
            response.json(group);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Delete a Group

    deleteGroup: async (request, response) => {
        try {
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                return response.status(400).json("ID is NaN");
            }

            const group = await Group.findByPk(id);

            if (group) {
                await group.destroy();
                response.json("Le groupe a été supprimé");
            } else {
                response.status(404).json("Cannot find any group with this id");
            }
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },
};

module.exports = groupController;
