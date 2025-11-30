import {useEffect} from "react";
import {useGlobalConfig} from "../../../state";
import {getPublicGlobalConfig} from "../../../api";

export const LoadPublicConfig = () => {
  const { initializedPublicGlobalConfig, publicGlobalConfig,
    setPublicGlobalConfig, setInitializedPublicGlobalConfig } = useGlobalConfig();

  useEffect(() => {
    if (!initializedPublicGlobalConfig) {
      getPublicGlobalConfig().then(({data: publicGlobalConfig}) => {
        setPublicGlobalConfig(publicGlobalConfig);
      }).finally(() => {
        setInitializedPublicGlobalConfig(true);
      });
    }
  }, []);

  return initializedPublicGlobalConfig && !publicGlobalConfig.isProduction ? <p className='text-danger text-center bold my-1'>
    <strong>DEV environment — for testing only.</strong>
  </p> : null;
};