import {Fragment, useEffect, useState} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import iconUrl from "../../../assets/marker-icon.png";
import { useInView } from "react-intersection-observer";
import {calculateGeographicCenter} from "../../../utilities";

const customIcon = new L.Icon({
  iconUrl,
  iconSize: [24, 41], // Adjust size as needed
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const MapUpdater = ({ latitude, longitude, isVisible }) => {
  const map = useMap();
  const [ currentVisible, setCurrentVisible ] = useState(false);

  useEffect(() => {
    map.setView([latitude, longitude]);
  }, [latitude, longitude, map]);

  useEffect(() => {
    if (currentVisible !== isVisible) {
      setCurrentVisible(isVisible);
      map.invalidateSize();
    }
  }, [isVisible]);

  return null;
};

export const OpenStreetMapMultiple = ({ defaultCenter = null, locationData = [], style = {}, zoom = 12, scrollWheelZoom = false }) => {
  const centeredPosition = calculateGeographicCenter(locationData);
  const [center, setCenter] = useState(centeredPosition);
  useEffect(() => {
    if (!locationData.length && defaultCenter) {
      setCenter(defaultCenter);
    } else {
      setCenter(calculateGeographicCenter(locationData));
    }
  }, [locationData, defaultCenter]);

  const { inView, ref } = useInView();

  return (
    <div ref={ref}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={scrollWheelZoom} style={style}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationData.map((pin, index) => (
          <Fragment key={index}>
            <Marker position={[pin.position.lat, pin.position.lng]} icon={customIcon}>
              <Popup>{pin.marker}</Popup>
            </Marker>
            <MapUpdater latitude={pin.position.lat} longitude={pin.position.lng} isVisible={inView} />
          </Fragment>
        ))}
      </MapContainer>
    </div>
  );
};
