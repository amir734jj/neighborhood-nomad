import { Typeahead as RawTypeahead } from "react-bootstrap-typeahead";
import React, { useEffect, useRef, useState } from "react";
import _, { random } from "lodash";
import { Button } from "react-bootstrap";
import { Spinner } from "../spinner";
import './index.scss';

export const Typeahead = ({
  id = random().toString(),
  emptyLabel,
  disabled = false,
  placeholder = '',
  defaultValue = '',
  minLength = 5,
  options = [],
  onSearch = _.noop,
  onInput = _.noop,
  onSelect = _.identity,
  onClear = _.noop,
  optionKeySelector = x => x.label,
  inputType = 'text',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const typeaheadRef = useRef(null);
  const [selected, setSelected] = useState([]);

  const handleInputChange = async (value) => {
    setIsLoading(true);
    onInput(value);
    try {
      setSelected([]);
      await debouncedSearch(value);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = _.awaitDebouncedSearch(async (value) => {
    if (_.size(value) >= minLength) {
      await onSearch(value);
    }
  }, 1000);

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ flex: "0 0 80%" }}>
        <RawTypeahead
          disabled={disabled}
          ref={typeaheadRef}
          id={id}
          selected={selected}
          filterBy={() => true}
          isLoading={isLoading}
          minLength={minLength}
          options={options}
          onChange={async (option) => {
            if (_.isArray(option) && _.size(option) === 1) {
              const result = await onSelect(_.first(option));
              setSelected(result ? [result] : []);
            }
          }}
          inputProps={{
            type: inputType,
          }}
          onInputChange={handleInputChange}
          labelKey={optionKeySelector}
          emptyLabel={emptyLabel}
          placeholder={placeholder}
          style={{ width: "100%" }} // Ensure the input inside is fully using the 80%
          {...props}
        />
      </div>
      <div style={{ flex: "0 0 20%", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        {!!selected.length && <Button variant='outline-secondary' onClick={() =>  {
          setSelected([]);
          onClear();
        }}>Clear</Button>}
        {isLoading ? <Spinner /> : null}
      </div>
    </div>
  );
};
