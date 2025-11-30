import {axios, normalizeFileObjectBeforeUpload} from "../utilities";

export const uploadFile = async (file, description = null) => {
  const formData = new FormData();

  formData.append("file", normalizeFileObjectBeforeUpload(file));
  formData.append("description", description);

  return await axios.post('file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: "text"
  });
};

export const downloadFile = (id) => axios.get(`file/${id}`, {
  responseType: 'blob'
});

export const deleteFile = (id) => axios.delete(`file/${id}`, {
  responseType: 'text'
});
