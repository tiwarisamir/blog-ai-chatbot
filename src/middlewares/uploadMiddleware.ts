import multer from "multer";
import ErrorHandler from "../utils/errorHandler.js";

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Only PDFs are allowed", 400), false);
  }
};

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({ storage, fileFilter });
