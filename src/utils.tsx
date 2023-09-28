export const handleFileRead = async (file) => {
  // const reader = new FileReader();
  // reader.onload = () => {
  //   console.log(reader.result);
  // };
  // reader.readAsArrayBuffer(file);
  // reader.readAsText(file);
  // console.log(Bun.version);

  const read = Bun.file(file);
  const text = await read.text();
  console.log(text);
};
