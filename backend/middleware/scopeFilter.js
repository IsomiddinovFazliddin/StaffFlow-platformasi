const getScopedEmployeeIds = require('../helpers/getScopedEmployeeIds');

module.exports = async (req, res, next) => {
  try {
    req.scopedIds = await getScopedEmployeeIds(
      req.user.id,
      req.user.role,
      req.user.department_id
    );
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
