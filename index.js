import express from "express";
import dotenv from "dotenv";
import util from "util";
import { exec } from "child_process";
import multer from "multer";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

app.post("/new", upload.single("excelFile"), async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "uploads", uploadedFile.filename);
  const command = `./parser.bin parse oca -p ${filePath}`;

  try {
    const { stdout } = await execPromise(command);
    const parsedData = JSON.parse(stdout);
    fs.unlinkSync(filePath);
    res.json({ schema: parsedData });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
