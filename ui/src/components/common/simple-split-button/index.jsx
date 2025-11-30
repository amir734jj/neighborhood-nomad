import React, { useState } from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { GoogleIcon } from "../google-icon";

export const SimpleSplitButton = ({
  id,
  bsPrefix,
  size,
  variant,
  title,
  type = "button",
  toggleLabel = "Toggle dropdown",
  children,
  onClick,
  href,
  target,
  menuRole,
  renderMenuOnMount,
  rootCloseEvent,
  flip,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      {...props}
      as={ButtonGroup}
      show={open}
      onToggle={(isOpen) => setOpen(isOpen)}
    >
      <Button
        size={size}
        variant={variant}
        disabled={props.disabled}
        bsPrefix={bsPrefix}
        href={href}
        target={target}
        onClick={onClick}
        type={type}
      >
        {title}
      </Button>
      <Dropdown.Toggle
        split
        id={id}
        size={size}
        variant={variant}
        disabled={props.disabled}
        childBsPrefix={bsPrefix}
        className="p-0 pt-2"
        onClick={() => setOpen((prev) => !prev)} // Toggle state correctly
      >
        <GoogleIcon
          icon={open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          style={{ fontSize: "24px" }}
          lineHeight="1"
        />
      </Dropdown.Toggle>

      <Dropdown.Menu
        role={menuRole}
        renderOnMount={renderMenuOnMount}
        rootCloseEvent={rootCloseEvent}
        flip={flip}
      >
        {children}
      </Dropdown.Menu>
    </Dropdown>
  );
};
