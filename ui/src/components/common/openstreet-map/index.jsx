import {useEffect, useState} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import iconUrl from "../../../assets/marker-icon.png";
import { useInView } from "react-intersection-observer";

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

export const OpenStreetMap = ({ latitude, longitude, style = {}, zoom = 12, scrollWheelZoom = false, marker, children = null }) => {
  const { inView, ref } = useInView();

  return (
    <div ref={ref}>
      <MapContainer center={[latitude, longitude]} zoom={zoom} scrollWheelZoom={scrollWheelZoom} style={style}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customIcon}>
          <Popup>{marker}</Popup>
        </Marker>
        <MapUpdater latitude={latitude} longitude={longitude} isVisible={inView} />
        {children}
      </MapContainer>
    </div>
  );
};
