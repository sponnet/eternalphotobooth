import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div>
      <h1>Error</h1>
      <Link className="navbar-brand" to="/">
        Go Back
      </Link>
    </div>
  );
};

export default Error;
