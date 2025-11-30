import {GoogleMaps} from "../google-maps";
import {DEFAULT_MAP_TYPE, GOOGLE_MAP_TYPE, OPEN_STREET_MAP_TYPE} from "../../../constants";
import {OpenStreetMap} from "../openstreet-map";
import {useGlobalConfig} from "../../../state";
import {MapDraw} from "../generic-map-draw";

export const Map = ({ ...props }) => {
  const { publicGlobalConfig: { mapDrawFeature = false } } = useGlobalConfig();

  if (mapDrawFeature) {
    return <MapDraw {...props} />;
  } else {
    if (DEFAULT_MAP_TYPE === GOOGLE_MAP_TYPE) {
      return <GoogleMaps {...props} />;
    } else if (DEFAULT_MAP_TYPE === OPEN_STREET_MAP_TYPE) {
      return <OpenStreetMap {...props} />;
    } else {
      return <h1>Unknown map type {DEFAULT_MAP_TYPE}</h1>;
    }
  }
};
