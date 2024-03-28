import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Homepage from "../../views/Homepage";
import PropTypes from "prop-types";

const HomepageRouter = () => {
  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Routes>

        <Route path="" element={<Homepage />} />

        <Route path="dashboard" element={<Homepage />} />

        <Route path="*" element={<Navigate to="dashboard" replace />} />

      </Routes>
   
    </div>
  );
};
/*
* Don't forget to export your component!
 */

HomepageRouter.propTypes = {
  base: PropTypes.string
}

export default HomepageRouter;
