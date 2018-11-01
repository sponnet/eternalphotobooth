import React, { Component } from "react";
import { NavLink } from "react-router-dom";
const Navigation = () => {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
      <NavLink to="/" className="navbar-item">Home</NavLink>
      <NavLink to="/upload" className="navbar-item">Upload Files</NavLink>

        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
