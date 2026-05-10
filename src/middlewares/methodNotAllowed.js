export const methodNotAllowed = (req, res) => {
  res.status(405).json({
    statusCode: 405,
    success: false,
    message: `Method ${req.method} not allowed on this route`,
  });
};
