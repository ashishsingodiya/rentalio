import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImages = upload.array("images");
export const uploadFile = upload.single("file");
