import { de } from "zod/v4/locales";

export const handleError = (res, error, message = "Server error") => {
  console.error("Error :", error);
  res.status(500).json({
    error: message,
    details: error.message,
  });
};
