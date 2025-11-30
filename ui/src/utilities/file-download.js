export const blobToBase64 = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = (err) => reject(err);
  reader.readAsDataURL(blob); // Converts the blob to Base64 string
});