import {AdvancedMarker, InfoWindow, useAdvancedMarkerRef, AdvancedMarkerAnchorPoint} from "@vis.gl/react-google-maps";
import {Fragment, useCallback, useState} from "react";

export const MarkerWithInfoWindow = ({position, infoWindowContent, children}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleMarkerClick = useCallback(
    () => setInfoWindowShown(isShown => !isShown),
    []
  );

  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <Fragment>
      { children ? <AdvancedMarker
        ref={markerRef}
        position={position}
        anchorPoint={AdvancedMarkerAnchorPoint.TOP_CENTER}
        onClick={handleMarkerClick}
      >
        {children}
      </AdvancedMarker> : <AdvancedMarker
        ref={markerRef}
        position={position}
        anchorPoint={AdvancedMarkerAnchorPoint.TOP_CENTER}
        onClick={handleMarkerClick}
      /> }
      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose}>
          {infoWindowContent}
        </InfoWindow>
      )}
    </Fragment>
  );
};