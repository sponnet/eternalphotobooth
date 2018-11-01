import React, { Component } from "react";
import ImageGallery from "react-image-gallery";
import config from "react-global-configuration";
import "react-image-gallery/styles/css/image-gallery.css";
import axios from "axios";

class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = { images: null, gallery: null };
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(location => {
      this.locationChanged(location);
    });
    this.locationChanged(this.props.location);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  locationChanged(location) {
    if (location && location.search) {
      this.hash = location.search.substring(1);
      this.setState({ hash: this.hash, images: null });
      axios.get(config.get("ipfsendpoint") + "/" + this.hash).then(res => {
        const gallery = res.data.images;
        let i = gallery.map(item => {
          return {
            original: config.get("ipfsendpoint") + "/" + item.original,
            thumbnail: config.get("ipfsendpoint") + "/" + item.thumbnail
          };
        });
        this.setState({ images: i, gallery: res.data });
      });
    } else {
      this.setState({ images: null, hash: null });
    }
  }

  render() {
    if (this.state.images) {
      return (
        <div>
          <section className="hero is-fullheight is-default is-bold">
            <div className="hero-head">
              <nav className="navbar">
                <div className="container">
                  <div className="navbar-brand">
                    <div className="navbar-item">
                      <h1>{this.state.gallery.title}</h1>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
            <div className="hero-body">
              <div className="container has-text-centered">
                <div className="columns is-vcentered">
                  <div className="column is-8">
                    <ImageGallery items={this.state.images} />
                    {/* <div className="columns is-vcentered">
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
                </div> */}
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-foot">
              <div className="container">
                <div className="tabs is-centered">
                  <ul>
                    <li>
                      <a href="../">powered by The Eternal Photobooth</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    } else {
      return (
        <section className="hero is-fullheight is-default is-bold">
          <div className="hero-body">
            <div className="container is-fluid has-text-centered">
              <div className="columns is-vcentered">
                <div class="card">
                  <div class="card-content">
                    <div class="content">
                      <h3 class="title is-4 text-bold no-margin-bottom">
                        Loading gallery
                      </h3>
                      <p>{this.state.hash}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
}

export default Gallery;
