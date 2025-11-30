import {AdvancedMarker, APIProvider, Map, Pin} from '@vis.gl/react-google-maps';
import { useGlobalConfig } from "../../../state";
import React, {useState, useEffect, Fragment} from "react";
import {Spinner} from "../spinner";
import {calculateGeographicCenter} from "../../../utilities";
import chroma from "chroma-js";

export const GoogleMapsMultiple = ({ companyLocationData = {}, locationData = [], style = {}, zoom: defaultZoom = 12 }) => {
  const { publicGlobalConfig: { googleMapsAutoComplete = '' } } = useGlobalConfig();
  const getCenteredPosition = () => calculateGeographicCenter(locationData) || companyLocationData.position;
  const [center, setCenter] = useState(getCenteredPosition());
  const colors = chroma.scale(['crimson', 'darkblue']).mode('lch').colors(locationData.length);

  useEffect(() => {
    setCenter(getCenteredPosition());
  }, [locationData, companyLocationData]);

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
        <AdvancedMarker position={companyLocationData.position}>
          <Pin>
          </Pin>
        </AdvancedMarker>
        {locationData.map((pin, index) => (
          <Fragment key={index}>
            <AdvancedMarker position={pin.position}>
              <Pin
                background={chroma(colors[index]).darken().hex()}
                borderColor="#000000"
                glyphColor="#FFFFFF">
              </Pin>
            </AdvancedMarker>
          </Fragment>
        ))}
      </Map>
    </APIProvider>
  );
};
