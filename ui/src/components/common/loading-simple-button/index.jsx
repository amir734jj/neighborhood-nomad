import React, {useState} from "react";
import {SimpleButton} from "../simple-button";
import _ from "lodash";

export const LoadingSimpleButton = ({onClick = _.noop, style = {}, disabled = false, ...props}) => {
  const [loading, setLoading] = useState(false);

  return (
    <SimpleButton
      style={_.extend({}, style, {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      })}
      loading={loading}
      disabled={disabled || loading}
      onClick={async () => {
        try {
          setLoading(true);
          await onClick();
        } finally {
          setLoading(false);
        }
      }}
      {...props}
    />
  );
};
