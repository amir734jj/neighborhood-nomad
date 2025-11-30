import React, {useState} from "react";
import _ from "lodash";
import {LoadingSimpleButton} from "../loading-simple-button";
import {GoogleIcon} from "../google-icon";

export const DownloadingLoadingSimpleButton = ({onClick = _.noop, style = {}, children, ...props}) => {
  const [downloading, setDownloading] = useState(false);

  return (
    <LoadingSimpleButton
      onClick={async () => {
        try {
          setDownloading(true);
          await onClick();
        } finally {
          setDownloading(false);
        }
      }}
      {...props}
    >
      { !downloading ? <GoogleIcon icon="download" className='me-1' style={{fontSize: "24px"}} /> : null}
      { children }
    </LoadingSimpleButton>
  );
};
