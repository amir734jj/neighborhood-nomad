import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {useMap as useOpenStreetMap} from "react-leaflet";
import {useMap as useGoogleMap} from '@vis.gl/react-google-maps';
import * as L from "leaflet";
import {TerraDraw, TerraDrawPolygonMode, TerraDrawRenderMode} from "terra-draw";
import {TerraDrawLeafletAdapter} from "terra-draw-leaflet-adapter";
import {Button, Table} from "react-bootstrap";
import {OpenStreetMap} from "../openstreet-map";
import * as turf from "@turf/turf";
import _ from "lodash";
import classNames from "classnames";
import {DEFAULT_MAP_TYPE, GOOGLE_MAP_TYPE, OPEN_STREET_MAP_TYPE} from "../../../constants";
import {TerraDrawGoogleMapsAdapter} from "terra-draw-google-maps-adapter";
import {GoogleMaps} from "../google-maps";
import {v7 as uuid} from "uuid";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
import {produce} from "immer";

const defaultDrawingState = {
  features: [],
  currentMode: "render"
};

const useDrawingState = create(immer((set) => ({
  ...defaultDrawingState,
  setFeatures: (features) => {
    set(produce(state => {
      state.features = features;
    }));
  },
  setCurrentMode: (currentMode) => {
    set(produce(state => {
      state.currentMode = currentMode;
    }));
  }
})));

const MapWithDrawingControls = ({ useMap, createTerraDrawAdapter, setupMap, setupDraw, component: MapComponent, ...props }) => {
  const drawInstanceRef = useRef(null);
  const [mapSetup, setMapSetup] = useState(false);
  const [mapDebug, setMapDebug] = useState(false);
  const { features, setFeatures,currentMode, setCurrentMode } = useDrawingState();

  const getPolygonFeatures = (features) => features.filter(x => x.properties.mode === "polygon");

  const cleanupDraw = (draw) => {
    draw?.clear();
    draw?.stop();
  };

  const MapInstanceProvider = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      let disposed = false;

      const process = async () => {
        if (!mapSetup) {
          await setupMap(map);
          setMapSetup(true);
        }

        const draw = new TerraDraw({
          adapter: createTerraDrawAdapter(map),
          modes: [
            new TerraDrawPolygonMode({
              modeName: "polygon"
            }),
            new TerraDrawRenderMode({
              modeName: "render"
            })
          ],
        });

        draw.on("finish", (featureId) => {
          setFeatures(features.concat(getPolygonFeatures(draw.getSnapshot()).filter(x => x?.id === featureId)));
        });

        draw.start();

        await setupDraw(draw);

        draw.setMode(currentMode);
        draw.addFeatures(features);

        if (!disposed) {
          drawInstanceRef.current = draw;
        } else {
          cleanupDraw(draw);
        }
      };

      process();

      return () => {
        cleanupDraw(drawInstanceRef.current);
        drawInstanceRef.current = null;
        disposed = true;
      };
    }, [map, features, currentMode]);

    return null;
  };

  const handleClear = useCallback(() => {
    drawInstanceRef.current?.clear();
    setFeatures([]);
  }, []);

  const handleToggleDrawingMode = () => {
    if (drawInstanceRef.current) {
      const newMode = currentMode === "render" ? "polygon" : "render";

      drawInstanceRef.current?.setMode(newMode);
      setCurrentMode(newMode);
    }
  };

  // area is in square meter
  const formatArea = (area) => {
    if (area === null) return "";
    const areaSqFt = area * 10.764; // Convert from square meters to square feet
    if (areaSqFt > 10000) {
      return `${(areaSqFt / 43560).toFixed(2)} acres`; // Use acres for large areas
    }
    return `${areaSqFt.toFixed(2)} sq ft`;
  };

  const calculateSurfaceArea = useCallback(() => {
    return _.fromPairs(features.map(feature => {
      try {
        const geojsonPolygon = turf.polygon(feature.geometry.coordinates);
        const surfaceAreaInM2 =  turf.area(geojsonPolygon);
        return [feature.id, surfaceAreaInM2];
      } catch (err) {
        return [feature.id, 0];
      }
    }));
  }, [features]);

  const removeFeature = (featureId) => {
    setFeatures(features.filter(x => x.id !== featureId));
    drawInstanceRef.current?.removeFeatures([featureId]);
  };

  const surfaceArea = calculateSurfaceArea();

  return (
    <div>
      <div style={{ padding: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        <Button onClick={() => handleToggleDrawingMode()}>{currentMode}</Button>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={() => setMapDebug(x => !x)} active={mapDebug}>Debug</Button>
      </div>
      <MapComponent {...props}>
        <MapInstanceProvider />
      </MapComponent>
      <pre className={classNames({ 'd-none': !mapDebug })}>
        {JSON.stringify(drawInstanceRef.current?.getSnapshot(), null, 2)}
      </pre>
      <Table hover responsive className={classNames({ 'd-none': features.length === 0 })}>
        <thead>
          <tr>
            <th>Coordinates</th>
            <th>Surface area</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr key={i}>
              <td>
                <ul>
                  {_.map(_.head(feature.geometry.coordinates) || [])
                    .map(([longitude, latitude], i) => <li key={i}>Lat: {_.round(latitude, 2)}, Lon: {_.round(longitude, 2)}</li>)}
                </ul>
              </td>
              <td>{formatArea(surfaceArea[feature.id])}</td>
              <td>
                <Button onClick={() => removeFeature(feature.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export const MapDraw = ({ ...props }) => {
  let options = {
    useMap: _.noop,
    createTerraDraw: _.noop,
    component: Fragment,
    setupMap: map => Promise.resolve(map),
    setupDraw: draw => Promise.resolve(draw),
  };

  if (DEFAULT_MAP_TYPE === OPEN_STREET_MAP_TYPE) {
    options = {
      component: OpenStreetMap,
      useMap: useOpenStreetMap,
      createTerraDrawAdapter: map => new TerraDraw({
        adapter: new TerraDrawLeafletAdapter({ lib: L, map }),
        modes: [new TerraDrawPolygonMode()],
      }),
    };
  } else if (DEFAULT_MAP_TYPE === GOOGLE_MAP_TYPE) {
    options = {
      component: GoogleMaps,
      useMap: () => {
        return [
          useGoogleMap(),
          // Note: is needs the whole library
          // eslint-disable-next-line no-undef
          google.maps
        ];
      },
      createTerraDrawAdapter: ([map, library]) => {
        // set id, it should start with a letter
        map.getDiv().id = `map-${uuid()}`;

        return new TerraDrawGoogleMapsAdapter({
          lib: library,
          map,
          coordinatePrecision: 9,
        });
      },
      setupMap: async ([map, library]) => {
        // setting up the map twice will not work, event listeners will not be called
        // https://github.com/JamesLMilner/terra-draw/blob/main/guides/3.ADAPTERS.md#google-maps
        await Promise.all([
          new Promise((resolve) => {
            map.addListener("projection_changed", () => {
              resolve();
            });
          }),
          new Promise((resolve) => {
            map.addListener('tilesloaded', function() {
              const _ = map.getBounds();
              resolve();
            });
          })
        ]);
      },
      setupDraw: (draw) => new Promise((resolve) => {
        draw.on('ready', () => {
          resolve();
        });
      })
    };
  }

  return <MapWithDrawingControls {...props} {...options} />;
};