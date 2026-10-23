import fs from "fs";
import path from "path";
import winston from "winston";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

const logDir = path.resolve(process.cwd(), "logs");
try {
  fs.mkdirSync(logDir, { recursive: true });
  const errorFile = new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
  });
  const combinedFile = new winston.transports.File({
    filename: path.join(logDir, "combined.log"),
  });
  errorFile.on("error", () => undefined);
  combinedFile.on("error", () => undefined);
  transports.push(errorFile, combinedFile);
} catch {
  // Console logging still works when the log directory cannot be created.
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});
