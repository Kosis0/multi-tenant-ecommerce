const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  CUSTOMER: 'customer'
};

const VALID_USER_ROLES = [ROLES.OWNER, ROLES.ADMIN];
const VALID_ALL_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.CUSTOMER];

module.exports = {
  ROLES,
  VALID_USER_ROLES,
  VALID_ALL_ROLES
};
