import React, { Component } from "react";
import "./Uploader.css";
import "@uppy/dashboard/dist/style.min.css";
import config from "react-global-configuration";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/lib/Dashboard";
//import { NavLink } from "react-router-dom";
import ThumbnailGenerator from "./ThumbnailGenerator";

const XHRUpload = require("@uppy/xhr-upload");

class Uploader extends Component {
  constructor(props) {
    super(props);
    this.gallery = [];
    this.title = "";
    this.thumbnails = [];
    this.galleryHash = null;

    this.state = {
      title: ""
    };

    this.uppy = new Uppy({
      autoProceed: true,
      allowedFileTypes: [
        "application/json",
        "text/plain",
        "image/*",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif"
      ]
    });

    this.uppy.use(ThumbnailGenerator, {
      id: `sponnets:ThumbnailGenerator`,
      thumbnailWidth: 200
    });

    this.onGalleryAdded = props.onGalleryAdded.bind(this);
    this.setTitle = this.setTitle.bind(this);

    this.makeGallery = this.makeGallery.bind(this);
    this.makeMetaData = this.makeMetaData.bind(this);

    this.uppy.use(XHRUpload, {
      endpoint: config.get("ipfsapiendpoint") + "/api/v0/add",
      formData: true,
      metaFields: [],
      limit: 5
    });

    this.uppy.on("file-added", file => {
      //debugger;
      if (file.name === "thumbnail.jpeg") {
        this.thumbnails.push(file.id);
      }
    });

    this.uppy.on("upload-success", (file, body, uploadURL) => {
      console.log("uploaded...", file.name);
      //var u = this.uppy;
      switch (file.meta.eptype) {
        case "gallery":
          // gallery meta-data has been uploaded
          console.log("remove gallery file", file.id);
          this.uppy.removeFile(file.id);
          this.galleryHash = body.Hash;
          this.setState({ galleryHash: body.Hash });
          this.onGalleryAdded(this.galleryHash);
          this.reset();
          break;
        case "thumbnail":
          // thumbnail has been uploaded - remove from uppy
          console.log("remove thumbnail file", file.id);
          this.uppy.removeFile(file.id);

          let tnIndex = this.thumbnails.indexOf(file.id);
          if (tnIndex > -1) {
            this.thumbnails.splice(tnIndex, 1);
          }
          this.gallery.push({
            original: file.source,
            thumbnail: body.Hash
          });
          this.makeMetaData();
          break;
        default:
          console.log("Added...", file.name);
          // check for same images - ignore multiple same images
          let imageIndex = this.gallery.findIndex(function(element) {
            return element.original === body.Hash;
          });
          if (imageIndex === -1) {
            // regular file has been uploaded
            var uploadedFile = this.uppy.getFile(file.id);

            uploadedFile.previewPromise.then(preview => {
              // get the thumbnail image
              var xhr = new XMLHttpRequest();
              xhr.open("GET", preview, true);
              xhr.responseType = "blob";
              xhr.onload = e => {
                if (e.target.status === 200) {
                  console.log("create thumbnail file from", file.name);
                  this.uppy.addFile({
                    name: "tn-" + file.name,
                    type: uploadedFile.type,
                    data: e.target.response,
                    source: body.Hash,
                    meta: { eptype: "thumbnail" }
                  });
                }
              };
              xhr.send();
            });
          }
          break;
      }
    });
  }

  makeMetaData() {
    const galleryMeta = {
      title: this.title,
      previousversion: this.galleryHash,
      images: this.gallery,
      titleimage: this.gallery[0].thumbnail
    };
    this.setState({ gallerymeta: galleryMeta });
    return galleryMeta;
  }

  makeGallery() {
    var galleryMeta = this.makeMetaData();
    var galleryBlob = new Blob([JSON.stringify(galleryMeta)], {
      type: "application/json"
    });
    this.uppy.addFile({
      name: "gallery.json",
      type: galleryBlob.type,
      data: galleryBlob,
      //      source: "Local",
      meta: { eptype: "gallery" }
    });
  }

  setTitle(event) {
    this.title = event.target.value;
    this.setState({ title: event.target.value });
  }

  reset() {
    this.uppy.reset();
    this.title = "";
    this.gallery = [];
    this.thumbnails = [];
    this.galleryHash = null;
    this.setState({ title: "", gallerymeta: null });
  }

  render() {
    //let galleryLink = undefined;

    const locale = {
      strings: { dropPaste: "Drop images here, paste or %{browse}" }
    };
    return (
      <div>
        <Dashboard
          uppy={this.uppy}
          proudlyDisplayPoweredByUppy={true}
          locale={locale}
          hideUploadButton={true}
          hideProgressAfterFinish={true}
          showProgressDetails={true}
          disableStatusBar={true}
          hidePauseResumeCancelButtons={true}
          width="100%"
          disableThumbnailGenerator={true}
        />
        {this.state.gallerymeta && (
          <div
            className="card"
            data-count={
              this.state.gallerymeta.images.length +
              (this.state.gallerymeta.images.length > 1 ? " photos" : " photo")
            }
          >
            <div className="card-image title-image">
              <img
                alt=""
                src={
                  config.get("ipfsendpoint") +
                  "/" +
                  this.state.gallerymeta.titleimage
                }
              />
            </div>
            <div className="card-content">
              <input
                className="input"
                type="text"
                value={this.state.title}
                placeholder="Set Gallery Title (optional)"
                onChange={this.setTitle}
              />
            </div>
            <footer className="card-footer">
              <a
                onClick={this.makeGallery.bind(this)}
                className="card-footer-item"
              >
                Save
              </a>
              <a onClick={this.reset.bind(this)} className="card-footer-item">
                Cancel
              </a>
              {/* <a
                target="_new"
                href={"/view/?" + this.state.galleryHash}
                className="card-footer-item"
              >
                Preview
              </a> */}
            </footer>
          </div>
        )}
      </div>
    );
  }
}

export default Uploader;
