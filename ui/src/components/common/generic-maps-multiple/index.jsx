import {GoogleMapsMultiple} from "../google-maps-multiple";
import {DEFAULT_MAP_TYPE, GOOGLE_MAP_TYPE, OPEN_STREET_MAP_TYPE} from "../../../constants";
import {OpenStreetMapMultiple} from "../openstreet-map-multiple";

export const MapMultiple = ({ ...props }) => {
  if (DEFAULT_MAP_TYPE === GOOGLE_MAP_TYPE) {
    return <GoogleMapsMultiple {...props} />;
  } else if (DEFAULT_MAP_TYPE === OPEN_STREET_MAP_TYPE) {
    return <OpenStreetMapMultiple {...props} />;
  } else {
    return <h1>Unknown map type {DEFAULT_MAP_TYPE}</h1>;
  }
};