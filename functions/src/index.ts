// import { processReceipt } from "./receiptProcessing";

// // Test with proper error handling
// processReceipt("D:\\Egyetem\\Egyetem_3.2\\Allamvizsga\\TestKepek\\test6.jpg")
//   .then((text) => {
//     console.log("--- EXTRACTED TEXT ---");
//     console.log(text);
//   })
//   .catch((err) => {
//     console.error("!!! PROCESSING FAILED !!!");
//     console.error(err.message);
//   });

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "xpensebot-f15ac.appspot.com", // A te bucket neved
});

const client = new DocumentProcessorServiceClient({
  keyFilename: "../../firebase-service-account.json",
});
const storage = admin.storage();

export const processUploadedImage = functions.storage
  .object()
  .onFinalize(async (object) => {
    if (!object.name || !object.contentType?.startsWith("image/")) return null;

    const filePath = object.name;
    const bucket = storage.bucket(object.bucket);

    // 1. Biztonságos fájlnév és útvonal
    const safeFileName = path.basename(filePath).replace(/[^a-zA-Z0-9.]/g, "_");
    const tempFilePath = path.join(os.tmpdir(), safeFileName);

    try {
      // 2. Letöltés és ellenőrzés
      console.log(`Starting download: ${filePath} -> ${tempFilePath}`);
      await bucket.file(filePath).download({ destination: tempFilePath });

      if (!fs.existsSync(tempFilePath)) {
        throw new Error(`File not found after download: ${tempFilePath}`);
      }

      // 3. Document AI feldolgozás
      const [result] = await client.processDocument({
        // eslint-disable-next-line max-len
        name: "projects/xpensebot-f15ac/locations/us/processors/876ebbf16c3f55a8",
        rawDocument: {
          content: fs.readFileSync(tempFilePath).toString("base64"),
          mimeType: object.contentType || "application/octet-stream",
        },
      });
      const extractedText = result.document?.text || "No text found";
      const firestore = admin.firestore();
      const FieldValue = admin.firestore.FieldValue;
      // 4. Save results to Firestore
      // eslint-disable-next-line max-len
      const userId = filePath.split("/")[1]; // Assuming path: uploads/{userId}/{file}
      await admin.firestore().collection("documentResults").add({
        userId,
        originalFile: filePath,
        extractedText,
        processedAt: "1744386726",
      });

      // 4. (Optional) Move to processed folder
      await bucket
        .file(filePath)
        .move(`processed/${userId}/${path.basename(filePath)}`);

      console.log("Successfully processed:", filePath);
      return null;
    } catch (error) {
      console.error("Error processing file:", filePath, error);
      throw error;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });
