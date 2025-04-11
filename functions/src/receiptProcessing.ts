// /* eslint-disable max-len */
// /* eslint-disable require-jsdoc */
// import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
// import { promises as fs } from "fs";
// import path from "path";

// const client = new DocumentProcessorServiceClient();

// async function processReceipt(this: any, filePath: string) {
//   const PROJECT_ID = "xpensebot-456207";
//   const LOCATION = "us";
//   const PROCESSOR_ID = "a24d215f86a3a789";

//   try {
//     // 1. Verify file exists and is readable
//     await fs.access(filePath);
//     const fileBuffer = await fs.readFile(filePath);

//     // 2. Validate image content
//     if (fileBuffer.length === 0) {
//       throw new Error("Empty file provided");
//     }

//     // 3. Prepare request with proper formatting
//     const request = {
//       name: `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`,
//       rawDocument: {
//         content: fileBuffer.toString("base64"),
//         mimeType: getMimeType(filePath), // Auto-detect mime type
//       },
//     };

//     // 4. Process document with error handling
//     const [result] = await client.processDocument(request);

//     if (!result.document?.text) {
//       console.warn("Document processed but no text found");
//     }

//     return result.document?.text || "No text found";
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Detailed error:", {
//         message: error.message,
//         details: (error as any).details, // Cast to 'any' if 'details' is not standard
//         code: (error as any).code, // Cast to 'any' if 'code' is not standard
//       });
//     } else {
//       console.error("Unknown error:", error);
//     }
//     throw new Error(
//       `Document processing failed: ${
//         error instanceof Error ? error.message : String(error)
//       }`
//     );
//   }
// }

// // Helper to determine MIME type
// function getMimeType(filePath: string): string {
//   const ext = path.extname(filePath).toLowerCase();
//   switch (ext) {
//   case ".jpg":
//   case ".jpeg":
//     return "image/jpeg";
//   case ".png":
//     return "image/png";
//   case ".pdf":
//     return "application/pdf";
//   case ".tiff":
//     return "image/tiff";
//   default:
//     throw new Error(`Unsupported file type: ${ext}`);
//   }
// }
