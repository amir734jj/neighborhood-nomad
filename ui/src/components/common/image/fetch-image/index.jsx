import {downloadFile} from "../../../../api";
import {FetchImageGeneric} from "../fetch-image-generic";

export const FetchImage = ({ fileKey, ...props }) => {
  return <FetchImageGeneric
    download={() => downloadFile(fileKey)}
    identifier={fileKey}
    {...props}
  />;
};