import { EdfDecoder } from "edfdecoder";

export const getInputFileBuffer = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem reading input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result as ArrayBuffer);
    };

    temporaryFileReader.readAsArrayBuffer(inputFile);
  });
};

export const decodeEdf = (buffer) => {
  const decoder = new EdfDecoder(buffer);
  decoder.setInput(buffer);
  decoder.decode();

  return decoder.getOutput();
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0"); // Ensure two digits
  const formattedSeconds = String(remainingSeconds).padStart(2, "0"); // Ensure two digits

  return `${formattedMinutes}:${formattedSeconds}`;
};

export const baseUrl = "http://localhost:3001";

export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export function convertBase64ToFiles(base64Strings, filenames, callback) {
  if (base64Strings && base64Strings.length > 0) {
    const files = [];
    let base64StringsProcessed = 0;

    base64Strings.forEach((base64, index) => {
      // Decode base64 to a Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);

      // Create a File from Blob
      const file = new File([blob], filenames[index]);
      files.push(file);

      base64StringsProcessed++;
      if (base64StringsProcessed === base64Strings.length) {
        callback(files);
      }
    });
  }
}
