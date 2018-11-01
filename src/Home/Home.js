import React, { Component } from "react";
import "./Home.css";
import config from "react-global-configuration";
import axios from "axios";
import Uploader from "../Uploader/Uploader";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  faTrashAlt,
  faCopy,
  faCheckCircle,
  faHandPointUp
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

class Home extends Component {
  constructor(props) {
    super(props);
    const myGalleries = localStorage.getItem("mygalleries")
      ? JSON.parse(localStorage.getItem("mygalleries"))
      : [];
    this.state = { mygalleries: myGalleries };
    this.addGallery = this.addGallery.bind(this);
    this.deleteGallery = this.deleteGallery.bind(this);
    this.copiedToClipboard = this.copiedToClipboard.bind(this);
  }

  addGallery(hash) {
    axios.get(config.get("ipfsendpoint") + "/" + hash).then(res => {
      const gallery = res.data;
      if (gallery.images) {
        const newGalleries = [
          ...this.state.mygalleries,
          {
            title: gallery.title,
            previousversion: gallery.previousversion,
            hash: hash,
            titleimage: gallery.images[0].thumbnail,
            imagecount: gallery.images.length
          }
        ];
        // if this gallery replaces an older one - remove that one.
        var index = newGalleries.findIndex(function(element) {
          return element.hash === gallery.previousversion;
        });
        if (index !== -1) {
          newGalleries.splice(index, 1);
        }

        localStorage.setItem(
          "mygalleries",
          JSON.stringify(newGalleries.reverse())
        );
        this.setState({ mygalleries: newGalleries });
      }
    });
  }

  deleteGallery(hashToDelete) {
    // if this gallery replaces an older one - remove that one.
    let newGalleries = this.state.mygalleries;
    var index = newGalleries.findIndex(function(element) {
      return element.hash === hashToDelete;
    });
    if (index !== -1) {
      newGalleries.splice(index, 1);
    }

    localStorage.setItem("mygalleries", JSON.stringify(newGalleries.reverse()));
    this.setState({ mygalleries: newGalleries });
  }

  copiedToClipboard() {
    const Msg = ({ closeToast }) => (
      <article class="message">
        {/* <div class="message-header">
    <p>Copied</p>
    <button class="delete" aria-label="delete" onClick={closeToast}></button>
  </div> */}
        <div class="message-body">gallery link copied to clipboard.</div>
      </article>
    );

    toast(<Msg />);
  }

  render() {
    let createTable = () => {
      let table = [];
      // Outer loop to create parent
      for (let i = 0; i < this.state.mygalleries.length / 4; i++) {
        let children = [];
        //Inner loop to create children
        for (let j = 0; j < 4; j++) {
          if (4 * i + j < this.state.mygalleries.length) {
            let f = this.state.mygalleries[4 * i + j];
            children.push(
              <div key={"row-" + (4 * i + j)} className="column is-one-quarter">
                <div
                  className="card gallery"
                  data-count={
                    f.imagecount + (f.imagecount > 1 ? " photos" : " photo")
                  }
                >
                  <Link
                    target="_new"
                    to={{
                      pathname: "/view",
                      search: "?" + f.hash
                    }}
                  >
                    <div className="card-image title-image">
                      <img
                        alt=""
                        src={config.get("ipfsendpoint") + "/" + f.titleimage}
                      />
                    </div>
                    <div className="card-content">
                      {f.title || "Click to view"}
                    </div>
                  </Link>
                  <footer className="card-footer">
                    <a
                      onClick={() => this.deleteGallery(f.hash)}
                      className="card-footer-item"
                      alt="Delete Gallery"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </a>
                    <CopyToClipboard
                      className="card-footer-item"
                      onCopy={this.copiedToClipboard}
                      text={
                        window.location.protocol +
                        "//" +
                        window.location.host +
                        "/view?" +
                        f.hash
                      }
                    >
                      <div>
                        <FontAwesomeIcon icon={faCopy} />
                      </div>
                    </CopyToClipboard>
                    <Link
                      className="card-footer-item"
                      target="_new"
                      to={{
                        pathname: "/shuffle",
                        search: "?" + f.hash
                      }}
                    >
                      <FontAwesomeIcon icon={faHandPointUp} />
                    </Link>
                  </footer>
                </div>
              </div>
            );
          }
        }
        //Create the parent and add the children
        table.push(
          <div key={"col" + i} className="columns">
            {children}
          </div>
        );
      }
      return table;
    };

    return (
      <div>
        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          closeButton={false}
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover={false}
          transition={Flip}
        />
        <section className="hero is-fullheight is-default is-bold">
          <div className="hero-head">
            <nav className="navbar">
              <div className="container">
                {/* <div className="navbar-brand"> */}
                <Link className="navbar-brand" target="_new" to="/">
                  <h1 className="title">The Eternal Photobooth</h1>
                </Link>
                {/* </div> */}
                <div id="navbarMenu" className="navbar-menu">
                  <div className="navbar-end">
                    <div className="tabs is-right">
                      <ul>
                        <li className="is-active">
                          <a>Home</a>
                        </li>
                        {this.state.mygalleries.length > 0 && (
                          <li>
                            <a href="#mygalleries">My Galleries</a>
                          </li>
                        )}
                        <li>
                          <a href="#about">About</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <div className="hero-body">
            <div className="container has-text-centered">
              <div className="columns is-vcentered">
                <div className="column is-5">
                  <Uploader onGalleryAdded={this.addGallery} />
                </div>
                <div className="column is-6 is-offset-1">
                  <h2 className="subtitle is-4">
                    Upload your photos to the decentralized web - share the link
                    as a nice gallery
                  </h2>
                  <br />
                  <p className="has-text-centered">
                    <a
                      className="button is-medium is-info is-outlined"
                      href="#about"
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="hero-foot">
            <div className="container">
              <div className="tabs is-centered">
                <ul>
                  <li>
                    <a href="https://ipfs.io/">powered by ipfs</a>
                  </li>
                </ul>
              </div>
            </div>
          </div> */}
        </section>

        {this.state.mygalleries.length > 0 && (
          <section className="section">
            <div className="container">
              <hr className="hr" />
              <a name="mygalleries">
                <h1 className="title">Your Galleries</h1>
              </a>
              {createTable()}
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <hr className="hr" />
            <h1 className="title">About the Eternal Photobooth</h1>
            <h2 className="subtitle">
              The easiest way to store images and share them.
            </h2>
            <p className="is-medium">
              <ul>
                <li>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Client side thumbnail generation
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Simple drag and drop interface
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  No user accounts
                </li>
              </ul>
            </p>
          </div>
        </section>
      </div>
    );
  }
}

export default Home;
