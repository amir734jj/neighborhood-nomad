import {Dropdown, DropdownButton, Spinner} from "react-bootstrap";
import React, {useState} from "react";

export const LoadingDropdown = ({ title, options, variant = 'primary' }) => {
  const [loading, setLoading] = useState(false);

  return <DropdownButton
    disabled={loading}
    title={loading ? <Spinner animation="border" size="sm" /> : title}
    variant={variant}>
    {options.map((option, index) => (<Dropdown.Item key={index} disabled={option.disabled} onClick={async () => {
      try {
        setLoading(true);
        await option.onClick();
      } finally {
        setLoading(false);
      }
    }}>
      {option.label}
    </Dropdown.Item>))}
  </DropdownButton>;
};