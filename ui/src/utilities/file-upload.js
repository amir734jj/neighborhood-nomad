import _ from "lodash";
import mimeDb from "mime-db";

export const categorizeMimeTypes = _.memoize(() => _.reduce(mimeDb, (categories, details, mimeType) => {
  const [category] = mimeType.split('/'); // Get the top-level category

  // Initialize the category if it doesn't exist
  if (!categories[category]) {
    categories[category] = {
      wildCardMimeType: `${category}/*`,
      extensions: []
    };
  }

  categories[category].extensions = categories[category].extensions.concat((details.extensions || []).map(x => `.${x}`));
  return categories;
}, {}));

export const collectMimeTypeByCategory = _.memoize((selectedCategories) =>
  Object.values(_.pick(categorizeMimeTypes(), selectedCategories)).reduce((acc, x) => ({
    ...acc,
    [x.wildCardMimeType]: x.extensions
  }), {}));

export const shortenFileName = _.memoize((fileName, maxLength = 50) => {
  if (fileName.length <= maxLength) return fileName;

  const parts = fileName.split('.');
  const extension = parts.pop(); // Extract the extension
  const baseName = parts.join('.'); // Join the remaining parts to form the base name

  const prefixLength = Math.floor((maxLength - extension.length - 4) / 2);
  const suffixLength = maxLength - prefixLength - extension.length - 4;

  const starting = baseName.slice(0, prefixLength);
  const ending = baseName.slice(-suffixLength);

  return `${starting}...${ending}.${extension}`;
});

export const createFileList = (fileList, filesToRemove = []) => {
  const dataTransfer = new DataTransfer();

  Array.from(fileList).forEach((file) => {
    if (!_.find(filesToRemove, x => x.path === file.path)) {
      dataTransfer.items.add(file);
    }
  });

  return dataTransfer.files;
};

export const normalizeFileObjectBeforeUpload = source => {
  if (source instanceof File) {
    return source;
  }

  if (source.blob instanceof File) {
    return source.blob;
  }

  if (source.blob instanceof Blob) {
    return new File([source.blob], source.name, { type: source.type });
  }

  return null;
};