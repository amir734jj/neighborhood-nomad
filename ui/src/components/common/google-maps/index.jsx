import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { useGlobalConfig } from "../../../state";
import { useState, useEffect } from "react";
import _ from "lodash";
import {Spinner} from "../spinner";

export const GoogleMaps = ({ latitude, longitude, style = {}, zoom: defaultZoom = 14, marker, children = null, id = null }) => {
  const { publicGlobalConfig: { googleMapsAutoComplete = '' } } = useGlobalConfig();
  const position = { lat: _.toNumber(latitude), lng: _.toNumber(longitude) };
  const [center, setCenter] = useState(position);

  useEffect(() => {
    setCenter(position);
  }, [latitude, longitude]);

  if (!googleMapsAutoComplete) {
    return <Spinner />;
  }

  return (
    <APIProvider apiKey={googleMapsAutoComplete}>
      <Map
        id={id}
        center={center}
        defaultZoom={defaultZoom}
        mapId="roadmap"
        style={style}
        zoomControl={true}
        onCenterChanged={({ map }) => {
          setCenter({lat: map.getCenter().lat(), lng: map.getCenter().lng()});
        }}
      >
        <AdvancedMarker position={position} />
        {marker ? (
          <AdvancedMarker position={position}>
            <div style={{ position: "relative", top: "10px", textAlign: "center", fontWeight: "bold", color: "red" }}>
              {marker}
            </div>
          </AdvancedMarker>
        ) : null}
        {children}
      </Map>
    </APIProvider>
  );
};
