import {useGlobalConfig} from "../../../state";
import {Fragment, useEffect, useState} from "react";
import {Loader} from "@googlemaps/js-api-loader";
import {Spinner} from "../spinner";

export const GoogleMapApiLoader = ({ children }) => {
  const { publicGlobalConfig: { googleMapsAutoComplete = '' } } = useGlobalConfig();
  const [ loaded, setLoaded ] = useState(false);

  useEffect(() => {
    if (googleMapsAutoComplete) {
      const loader = new Loader({
        apiKey: googleMapsAutoComplete,
        libraries: ["places", "maps"]
      });

      loader
        .importLibrary('maps')
        .then(() => {
          setLoaded(true);
        });

      return () => () => {
        setLoaded(false);
        loader.deleteScript();
      };
    }
  }, [googleMapsAutoComplete]);

  if (!googleMapsAutoComplete) {
    return null;
  }

  return <Fragment>
    { loaded ? children : <Spinner /> }
  </Fragment>;
};
