export const handleError = (res, error, message = "Server error") => {
  console.error(error);
  return res.status(500).json({ error: message });
};
