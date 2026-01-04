import {AdvancedMarker, APIProvider, Map, Pin} from '@vis.gl/react-google-maps';
import { useGlobalConfig } from "../../../state";
import React, {useState, useEffect, Fragment} from "react";
import {Spinner} from "../spinner";
import {calculateGeographicCenter} from "../../../utilities";
import chroma from "chroma-js";
import {MarkerWithInfoWindow} from "../marker-with-info-window";

export const GoogleMapsMultiple = ({ defaultCenter = null, locationData = [], style = {}, zoom: defaultZoom = 10 }) => {
  const { publicGlobalConfig: { googleMapsAutoComplete = '' } } = useGlobalConfig();
  const getCenteredPosition = () => calculateGeographicCenter(locationData);
  const [center, setCenter] = useState(getCenteredPosition());
  const colors = chroma.scale(['crimson', 'darkblue']).mode('lch').colors(locationData.length);

  useEffect(() => {
    if (!locationData.length && defaultCenter) {
      setCenter(defaultCenter);
    } else {
      setCenter(getCenteredPosition());
    }
  }, [locationData, defaultCenter]);

  if (!googleMapsAutoComplete) {
    return <Spinner />;
  }

  return (
    <APIProvider apiKey={googleMapsAutoComplete}>
      <Map
        center={center}
        defaultZoom={defaultZoom}
        mapId="roadmap"
        style={style}
        zoomControl={true}
        onCenterChanged={({ map }) => {
          setCenter({lat: map.getCenter().lat(), lng: map.getCenter().lng()});
        }}
      >
        {locationData.map((pin, index) => (
          <Fragment key={index}>
            <AdvancedMarker position={pin.position}>
              <Pin
                background={chroma(colors[index]).darken().hex()}
                borderColor="#000000"
                glyphColor="#FFFFFF">
              </Pin>
            </AdvancedMarker>
            <MarkerWithInfoWindow
              position={pin.position}
              infoWindowContent={pin.infoWindowContent}>
              <div style={{
                fontWeight: "bold",
                fontSize: "0.8rem",
                color: colors[index],
              }}>
                {pin.marker}
              </div>
            </MarkerWithInfoWindow>
          </Fragment>
        ))}
      </Map>
    </APIProvider>
  );
};
