const { Company } = require("../models");

const companyController = {
  
  // Display all Companies

  getAllCompanies: async (_, response, next) => {
    try {
      const allCompanies = await Company.findAll({
        include: [
          "users",
          {
            association: "groups",
            include: ["users", {
              association: "messages",
              include: ["user"]
            }]
          }
        ]
      });
      allCompanies ? response.json(allCompanies) : next();
    } catch (error) {
      console.trace(error);
      response.status(500).json(error.toString());
    }
  },

  // Display one Company

  getOneCompany: async (request, response) => {
    try {
      const finess = request.params.finess;

      const company = await Company.findOne({
        where: {
          finess: finess,
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
        console.log(!company)
        if (!company) {
            return response
                .status(404)
                .json("Ce numéro n'est rattaché à aucun établissement");
        } else {
           return response.json(company)
        }
    } catch (error) {
      console.trace(error);
      response.status(500).json(error.toString());
    }
  },
};

module.exports = companyController;