export const asyncHandler = (fun) => async (req, res, next) => {
  try {
    await fun(req, res, next);
  } catch (error) {
    res.status(error.code || 500).send({
      success: false,
      message: error.message,
    });
  }
};
