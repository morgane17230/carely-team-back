// importation des dépendances nécessaires au model

const bcrypt = require('bcrypt-promise');
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// déclaration de l'entité User

class User extends Model {};

User.init(
    {
    // Propriétés qui définissent l'entité user : prénom, nom, 
    // fonction, email, mot de passe, role, id de l'établissement
    // d'appartenance
    lastname: DataTypes.TEXT,
    firstname: DataTypes.TEXT,
    func: DataTypes.TEXT,
    email: DataTypes.TEXT,
    password: DataTypes.TEXT,
    role: DataTypes.TEXT,
    company_id: DataTypes.INTEGER,
  },
    {
      // définition de la portée des requêtes concernant la propriété mot de passe
        
    defaultScope: {
      attributes: { exclude: ["password", "updated_at"] },
    },
    scopes: {
      pass: {
        attributes: { include: ["password", "updated_at"] },
      },
      nopass: {
        attributes: { exclude: ["password", "updated_at"] },
      },
        },
    
        // inclusion de bcrypt pour les méthodes de création et 
        // de mise à jour de user

    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.password)
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
    sequelize,
    tableName: "user",
  }
);

//configuration de bcrypt pour la récupértion du mot de passe
// en bas de données lors de la connexion

User.prototype.validPassword = function(password) {
  return bcrypt.compare(password, this.password);
}

module.exports = User;