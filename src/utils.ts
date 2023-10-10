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
