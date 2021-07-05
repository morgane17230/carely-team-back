const { User } = require("../models");

const userMiddleware = async (request, response, next) => {
  const requestId = parseInt(request.params.id, 10);
  if (isNaN(requestId)) {
    return next();
  }

  if (request.user) {
    const user = await User.findByPk(request.user.userId);
    if (user) {
      return next(); // admin is allowed to do anything
    }
  }

  if (request.user.userId !== requestId) {
    
    return response.status(401).json("No authorization on this user ID");
  }

  next();
};

const companyMiddleware = {
  admin: async (request, response, next) => {
    if (request.company_role !== "admin") {
      return response.status(401).json("No authorization on this user ID");
    }

    next();
  },

  author: async (request, response, next) => {
    if (request.user.role !== "admin" && request.user.role !== "author") {
      return response.status(401).json("No authorization on this user ID");
    }
    
    next();
  },
};

module.exports = { companyMiddleware, userMiddleware };
