import { Spinner } from "../../spinner";
import { useEffect, useState } from "react";
import { blobToBase64 } from "../../../../utilities";
import notfound from "../../../../assets/not-found.png";
import styles from "./FetchImage.module.scss";

export const FetchImageGeneric = ({ download, identifier, alt, ...props }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (identifier) {
      setLoading(true);
      download(identifier)
        .then(res => blobToBase64(res.data))
        .then(blob => setSrc(blob))
        .catch(() => setSrc(false))
        .finally(() => setLoading(false));
    }
  }, [identifier]);

  if (loading && src === null) {
    return <Spinner />;
  }

  const imageSrc = !src ? notfound : src;
  const showOverlay = !src;
  const imageAlt = showOverlay ? (alt || "⚠️ Not Found") : (alt || identifier);

  if (src) {
    return <img src={imageSrc} alt={imageAlt} {...props} />;
  } else {
    return (
      <div className={styles.fetchImageContainer}>
        <img src={imageSrc} alt={imageAlt} {...props} />
        {showOverlay && <div className={styles.altTextOverlay}>{imageAlt}</div>}
      </div>
    );
  }
};
