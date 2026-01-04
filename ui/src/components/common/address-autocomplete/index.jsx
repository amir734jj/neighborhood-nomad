import React, { Fragment, useEffect, useRef, useState } from "react";
import { usePlacesWidget } from "react-google-autocomplete";
import { Form } from "react-bootstrap";
import _ from "lodash";
import { useGlobalConfig } from "../../../state";
import { Spinner } from "../spinner";
import {ADDRESS_AUTOCOMPLETE_TYPES} from "../../../constants";

const AddressAutoCompleteHelper = ({
  onSelect = _.noop,
  defaultValue = '',
  onChange = _.noop,
  onEmptySelect = _.noop,
  // Customize what the autocomplete returns; by default only street addresses.
  // Examples:
  //  - ["address"] (default) → only addresses
  //  - ["establishment"] → business/place names
  //  - undefined/[] → allow all supported predictions
  types = [ADDRESS_AUTOCOMPLETE_TYPES.address],
  ...props
}) => {
  const { publicGlobalConfig: { googleMapsAutoComplete = '' } } = useGlobalConfig();
  const [typed, setTyped] = useState(false);
  const placeSelectedRef = useRef(false);

  useEffect(() => {
    if (ref.current && ref.current?.value !== defaultValue) {
      ref.current.value = defaultValue;
    }
  }, [defaultValue]);

  const { ref } = usePlacesWidget({
    apiKey: googleMapsAutoComplete,
    onPlaceSelected: (place) => {
      placeSelectedRef.current = true;
      setTyped(false); // Reset typed flag

      if (!place || !place.address_components || !place.geometry?.location) return;

      const addressComponents = place.address_components;
      const getComponent = (type) =>
        addressComponents.find((component) => component.types.includes(type))?.long_name || "";
      const getComponentShort = (type) =>
        addressComponents.find((component) => component.types.includes(type))?.short_name || "";

      const city = getComponent("locality");
      const postalCode = getComponent("postal_code");
      const addressLine1 = `${getComponent("street_number")} ${getComponent("route")}`.trim();
      const addressLine2 = getComponent("sublocality_level_1");
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      const state = getComponent("administrative_area_level_1");
      const country = getComponentShort("country");

      // Pass extracted data
      onSelect({
        city,
        zipCode: postalCode,
        addressLine1,
        addressLine2,
        longitude,
        latitude,
        state,
        country,
        name: place?.name || "",
        input: ref.current?.value,
      });
    },
    libraries: ["places", "maps"],
    options: {
      // If the caller wants to search by place name too, pass types={["establishment"]}
      // or omit this prop to allow all. We pass through the prop as-is.
      types,
      componentRestrictions: { country: "us" },
      fields: [
        "address_components",
        "geometry.location",
        "place_id",
        "formatted_address",
        "name",
      ],
    },
  });

  return (
    <Form.Control
      defaultValue={defaultValue}
      {...props}
      ref={ref}
      onChange={(event) => {
        setTyped(true);
        placeSelectedRef.current = false;
        onChange(event.target.value);
      }}
      onBlur={(event) => {
        setTimeout(() => {
          if (typed && !placeSelectedRef.current) {
            // clear leftover longitude and latitude
            onEmptySelect(event.target.value);
          }
        }, 300); // wait just a little to allow onPlaceSelected to fire first
      }}
      type="text"
    />
  );
};

export const AddressAutoComplete = ({ id, ...props }) => {
  const { publicGlobalConfig: { googleMapsAutoComplete = '' } } = useGlobalConfig();

  if (!googleMapsAutoComplete) {
    return <Spinner />;
  }

  // Force remount when types change by using it as a key
  const key = id || props.types?.join(',') || 'default';

  return <Fragment>
    <AddressAutoCompleteHelper key={key} {...props} />
  </Fragment>;
};
