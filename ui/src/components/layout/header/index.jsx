import Navbar from "../../navbar";
import { JWT } from "../../jwt";
import {ThemeSelector} from "../../common/theme-selector";
import {DarkMode} from "../../common";
import React, {Fragment} from "react";

export const Header = () => <Fragment>
  <JWT />
  <Navbar />
  <ThemeSelector />
  <DarkMode doInitialSetup={true} className='d-none' />
</Fragment>;
