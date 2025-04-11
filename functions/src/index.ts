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
// eslint-disable-next-line max-len
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { mockDocumentAI } from "./mocks/documentAI";


let client: DocumentProcessorServiceClient;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../../firebase-service-account.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "xpensebot-f15ac.appspot.com",
});
if (process.env.FUNCTIONS_EMULATOR === "true") {
  console.log("Using mocked Document AI client (emulator mode)");
  client = mockDocumentAI as unknown as DocumentProcessorServiceClient;
} else {
  client = new DocumentProcessorServiceClient({
    keyFilename: "../../firebase-service-account.json",
  });
}

const storage = getStorage();

export const processUploadedImage = functions.storage
  .object()
  .onFinalize(async (object) => {
    if (!object.name || !object.contentType?.startsWith("image/")) return null;
    // Checking if the file is already in the processed folder
    if (object.name.startsWith("processed/")) {
      console.log(
        "File is already in processed folder, skipping:",
        object.name
      );
      return null;
    }

    const filePath = object.name;
    const bucket = storage.bucket(object.bucket);

    // 1. Create a temporary file path
    // Generate a safe file name by replacing invalid characters
    const safeFileName = path.basename(filePath).replace(/[^a-zA-Z0-9.]/g, "_");
    const tempFilePath = path.join(os.tmpdir(), safeFileName);

    try {
      // 2. Download the file to a temporary location
      console.log(`Starting download: ${filePath} -> ${tempFilePath}`);
      await bucket.file(filePath).download({ destination: tempFilePath });

      if (!fs.existsSync(tempFilePath)) {
        throw new Error(`File not found after download: ${tempFilePath}`);
      }

      // 3. Document AI api call
      const [result] = await client.processDocument({
        // eslint-disable-next-line max-len
        name: "projects/xpensebot-f15ac/locations/us/processors/876ebbf16c3f55a8",
        rawDocument: {
          content: fs.readFileSync(tempFilePath).toString("base64"),
          mimeType: object.contentType || "application/octet-stream",
        },
      });
      const extractedText = result.document?.text || "No text found";
      const firestore = getFirestore();
      // 4. Save results to Firestore
      // path: uploads/{userId}/{file}
      const userId = filePath.split("/")[1];
      await firestore.collection("documentResults").add({
        userId,
        originalFile: filePath,
        extractedText,
        processedAt: Timestamp.now(),
      });

      // 4. Moving to processed folder
      await bucket
        .file(filePath)
        .move(`processed/${userId}/${path.basename(filePath)}`);

      console.log("Successfully processed:", filePath);
      return null;
    } catch (error) {
      console.error("Error processing file:", filePath, error);
      throw error;
    } finally {
      // Deleting the temporary file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log("Temporary file deleted:", tempFilePath);
      }
    }
  });
