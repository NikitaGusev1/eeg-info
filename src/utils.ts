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

export function convertFileToBase64(file, callback) {
  if (file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const base64String = event.target?.result?.split(",")[1];
      callback(base64String);
    };

    reader.readAsDataURL(file);
  }
}
