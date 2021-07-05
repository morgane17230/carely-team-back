const { User } = require('../models');

const roleMiddleware = async (request, response, next) => {
    // passage au middleware suivant si aucune donnée utilisateur n'est trouvée
  if (!request.user) {
    next();
    return;
  }

    const user = await User.findByPk(request.user.userId);
    // requête de recherche de l'utilisateur concerné
  if (!user) {
      return response.status(500).json("Cet utilisateur n'existe pas");
      // si aucun utilisateur trouvé, message d'erreur retourné en console
  }
  
  if (request.user.companyId && request.user.companyId !== null && request.user.companyId !== 0) {
      const company = await user.getCompanies({
          where: { id: request.user.companyId },
      });
      // requête de recherche de l'établissement de rattachement d'un utilisateur
      if (!company || company.length === 0) {
          return response.status(404).json("Etablissement non trouvé");
      }
      // si aucun établissement ne corresponspond à l'id ou si aucun id n'est 
     // déterminé on renvoie un message d'erreur

      request.company_role = user.role;
  }
      
 if (request.user.groupId && request.user.groupId !== null && request.user.groupId !== 0) {
    const group = await user.getGroups({ where: { id: request.user.groupId } });
    // requête de recherche des groupes appartenant à un utilisateur
    if (!group || group.length === 0) {
      return response.status(404).json("Aucun groupe trouvé");
      }
      // si aucun groupe ne correspond à l'id ou si aucun id n'est déterminé
      // on renvoie un message d'erreur

   
    const relationTable = group[0].group_has_user;
    request.group_role = relationTable.role;
    }
    // Si un groupe est trouvé et que la requête en front correspond à une réattribution de role
    // de user
  
  next();
}

module.exports = roleMiddleware;