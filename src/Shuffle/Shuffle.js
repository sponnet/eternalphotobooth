import React, { Component } from "react";
import "./Shuffle.css";
import config from "react-global-configuration";
import "react-image-gallery/styles/css/image-gallery.css";
import axios from "axios";
import Swipeable from "react-swipeable";
import { generate } from "ethjs-account";
import HttpProvider from "ethjs-provider-http";
import Eth from "ethjs";
import Ipfs from "ipfs";

const IMG_WIDTH = "342px";
const IMG_HEIGHT = "249px";

const RIGHT = "-1";
const LEFT = "+1";

class Shuffle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: null,
      gallery: null,
      imageIdx: 0,
      submitnow: false,
      votesubmission: null
    };
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(location => {
      this.locationChanged(location);
    });
    this.locationChanged(this.props.location);
  
    // const ipfs = new Ipfs({
    //   repo: "/orbitdb/examples/browser/new/ipfs/0.27.3",
    //   start: true,
    //   EXPERIMENTAL: {
    //     pubsub: true
    //   },
    //   config: {
    //     Addresses: {
    //       Swarm: [
    //         // Use IPFS dev signal server
    //         // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
    //         "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
    //         // Use local signal server
    //         // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
    //       ]
    //     }
    //   }
    // });

    // ipfs.on("error", e => {
    //   console.log("ipfs error -- ", e);
    // });
    // ipfs.on("ready", () => {
    //   console.log("ipfs started  -- ");
    //   //openButton.disabled = false;
    //   //createButton.disabled = false;
    //   //statusElm.innerHTML = "IPFS Started";
    //   //orbitdb = new OrbitDB(ipfs)
    //  // const orbitdb = new OrbitDB(ipfs);

    //   //   orbitdb.open(name, {
    //   //     // If database doesn't exist, create it
    //   //     create: true,
    //   //     overwrite: true,
    //   //     // Load only the local version of the database,
    //   //     // don't load the latest from the network yet
    //   //     localOnly: false,
    //   //     type: type,
    //   //     // If "Public" flag is set, allow anyone to write to the database,
    //   //     // otherwise only the creator of the database can write
    //   //     write: publicAccess ? ['*'] : [],
    //   //   })

    //   //const db = await orbitdb.log("hello");
    // //   orbitdb
    // //     .open("ephotobooth", {
    // //       create: true,
    // //       type: "eventlog",
    // //       overwrite: true,
    // //       write: ["*"]
    // //     })
    // //     .then(db => {
    // //       console.log("orbitDB added eventlog thing");

    // //       db.events.on("ready", () => {
    // //         console.log("db is ready");
    // //       });

    // //       // Load locally persisted database
    // //       db.load().then(() => {
    // //         setInterval(() => {
    // //           console.log("adding logline");
    // //           db.add({ avatar: "Quaak", userId: 12234234234234 }, () => {
    // //             console.log("orbitDB added logline");
    // //           });
    // //         }, 2 * 1000);
    // //       });
    // //     });
    // });

    // const ipfs = IpfsApi({
    //     host: "ipfs.web3.party",
    //     port: 5001,
    //     protocol: "https"
    //   });
    //   const orbitdb = new OrbitDB(ipfs);
    //   //const db = await orbitdb.log("hello");
    //   orbitdb.eventlog("123456678", { overwrite: true }).then(db => {
    //     db.add({ avatar: "Quaak", userId: 1234 });
    //   });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  locationChanged(location) {
    if (location && location.search) {
      this.hash = location.search.substring(1);

      if (localStorage.getItem("key-" + this.hash)) {
        this.gallerykey = JSON.parse(localStorage.getItem("key-" + this.hash));
      } else {
        debugger;
        const validChars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let array = new Uint8Array(40);
        window.crypto.getRandomValues(array);
        array = array.map(x => validChars.charCodeAt(x % validChars.length));
        const randomState = String.fromCharCode.apply(null, array);
        this.gallerykey = generate(randomState);
        localStorage.setItem(
          "key-" + this.hash,
          JSON.stringify(this.gallerykey)
        );
      }
      this.setState({
        hash: this.hash,
        images: null,
        gallerykey: this.gallerykey
      });
      axios.get(config.get("ipfsendpoint") + "/" + this.hash).then(res => {
        const gallery = res.data.images;
        let i = gallery.map(item => {
          return {
            original: config.get("ipfsendpoint") + "/" + item.original,
            thumbnail: config.get("ipfsendpoint") + "/" + item.thumbnail
          };
        });
        this.setState({ images: i, gallery: res.data }, () => {
          this.preloadNextPic(0);
        });
      });
    } else {
      this.setState({ images: null, hash: null });
    }

  }

  onSwiped(direction) {
    let votes = this.state.votes || { upvotes: [], downvotes: [] };
    let votekey = this.state.gallery.images[this.state.imageIdx].original;
    if (direction === RIGHT && votes.upvotes.indexOf(votekey) === -1) {
      votes.upvotes.push(votekey);
      console.log(`upvoted ${votekey}`);
    }
    if (direction === LEFT && votes.downvotes.indexOf(votekey) === -1) {
      votes.downvotes.push(votekey);
      console.log(`downvoted ${votekey}`);
    }

    const eth = new Eth(new HttpProvider(config.get("ethendpoint")));
    eth.getBlockByNumber("latest", false).then(result => {
      const votesubmission = {
        gallery: this.state.hash,
        // the authenticity object is a trustable timestamp for your submission
        // based on external info (the hash of the latest ETH block)
        authenticity: {
          number: result.number.toString(10),
          hash: result.hash
        },
        votes: votes
      };
      console.log(votesubmission);
      this.setState({ votesubmission: votesubmission });
    });
    let adjustedIdx = this.state.imageIdx + 1;
    let finishedVoting = false;
    if (adjustedIdx >= this.state.images.length) {
      // let's sign this thing.
      //newIdx = 0;
      finishedVoting = true;
      adjustedIdx = 0;
    } else {
      this.preloadNextPic(adjustedIdx + 1);
      //newIdx = adjustedIdx;
    }
    this.setState({
      imageIdx: adjustedIdx,
      votes: votes,
      submitnow: finishedVoting
    });
  }

  preloadNextPic(index) {
    for (let i = index; i < index + 3; i++) {
      if (i < this.state.images.length - 1) {
        // preload next image
        //debugger;
        let nextPic = this.state.images[i + 1].original;
        let img = new Image();
        img.onload = function(e) {
          // image  has been loaded
          console.log("preloaded " + e.currentTarget.src);
        };
        console.log("preloading " + nextPic);
        img.src = nextPic;
      }
    }
  }

  render() {
    if (this.state.images) {
      const { imageIdx = 0 } = this.state;
      const imageStyles = {
        //width: IMG_WIDTH,
        //height: IMG_HEIGHT,
        background: `url(${
          this.state.images[imageIdx].original
        }) center center / cover no-repeat`,

        WebkitBackgroundSize: "cover",
        MozBackgroundSize: "cover",
        OBackgroundSize: "cover",
        backgroundSize: "cover"
      };
      const buttonStyles = {
        height: IMG_HEIGHT,
        color: "#eeeeee",
        fontSize: "2em"
      };

      return (
        <div>
          <section style={imageStyles} className="hero is-info is-fullheight">
            <div className="hero-head">
              <nav className="navbar">
                <div className="container">
                  <div className="navbar-brand">
                    <h1 className="title">
                      {this.state.gallery.title}
                      {this.state.submitnow === false && (
                        <span>
                          {" "}
                          - image {this.state.imageIdx + 1} of{" "}
                          {this.state.images.length}
                        </span>
                      )}
                    </h1>
                  </div>
                </div>
              </nav>
            </div>

            <div className="hero-body">
              <div className="container has-text-centered">
                <div>
                  {this.state.submitnow === false && (
                    <Swipeable
                      className="swipe"
                      trackMouse
                      style={{ touchAction: "none" }}
                      preventDefaultTouchmoveEvent
                      onSwipedLeft={() => this.onSwiped(LEFT)}
                      onSwipedRight={() => this.onSwiped(RIGHT)}
                    >
                      <div className="columns">
                        <button
                          className="column title hollow is-one-fifth"
                          onClick={() => this.onSwiped(LEFT)}
                        >
                          ⇦
                        </button>
                        <div className="column">
                          {/* {this.state.gallerykey.address} */}
                        </div>
                        <button
                          className="column title hollow is-one-fifth"
                          onClick={() => this.onSwiped(RIGHT)}
                        >
                          ⇨
                        </button>
                      </div>
                    </Swipeable>
                  )}
                  {this.state.submitnow === true &&
                    this.state.votesubmission && (
                      <div>
                        <h1 className="title">Thanks for voting</h1>
                        <div>{this.state.votes.upvotes.length} upvotes</div>
                        <div>{this.state.votes.downvotes.length} downvotes</div>
                        <button>Submit your votes</button>
                      </div>
                    )}
                  {this.state.submitnow === true &&
                    !this.state.votesubmission && (
                      <div>Processing your votes</div>
                    )}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </section>
        </div>

        //   <section className="hero is-fullheight is-default is-bold">
        //     <div className="hero-head">
        //       <nav className="navbar">
        //         <div className="container">
        //           <div className="navbar-brand">
        //             <div className="navbar-item">
        //               <h1>{this.state.gallery.title}</h1>
        //               <br />
        //             </div>
        //           </div>
        //         </div>
        //       </nav>
        //     </div>
        //     <div className="hero-body">
        //       <div className="container has-text-centered">
        //         <div className="columns is-vcentered">
        //           <div className="column is-8">
        //             <div>
        //               Your reward address {this.state.gallerykey.address}
        //             </div>
        //             {this.state.submitnow === false && (
        //               <Swipeable
        //                 className="swipe"
        //                 trackMouse
        //                 style={{ touchAction: "none" }}
        //                 preventDefaultTouchmoveEvent
        //                 onSwipedLeft={() => this.onSwiped(LEFT)}
        //                 onSwipedRight={() => this.onSwiped(RIGHT)}
        //               >
        //                 <div style={imageStyles}>
        //                   <button
        //                     onClick={() => this.onSwiped(RIGHT)}
        //                     className="hollow float-left"
        //                     style={buttonStyles}
        //                   >
        //                     ⇦
        //                   </button>
        //                   <button
        //                     onClick={() => this.onSwiped(LEFT)}
        //                     className="hollow float-right"
        //                     style={buttonStyles}
        //                   >
        //                     ⇨
        //                   </button>
        //                 </div>
        //               </Swipeable>
        //             )}
        //             {this.state.submitnow === true &&
        //               this.state.votesubmission && <div>Submit your votes</div>}
        //             {this.state.submitnow === true &&
        //               !this.state.votesubmission && (
        //                 <div>Processing your votes</div>
        //               )}
        //           </div>
        //         </div>
        //       </div>
        //     </div>

        //     <div className="hero-foot">
        //       <div className="container">
        //         <div className="tabs is-centered">
        //           <ul>
        //             <li>
        //               <a href="../">powered by The Eternal Photoboothh</a>
        //             </li>
        //           </ul>
        //         </div>
        //       </div>
        //     </div>
        //   </section>
        // </div>
      );
    } else {
      return (
        <section className="hero is-fullheight is-default is-bold">
          <div className="hero-body">
            <div className="container is-fluid has-text-centered">
              <div className="columns is-vcentered">
                <div className="card">
                  <div className="card-content">
                    <div className="content">
                      <h3 className="title is-4 text-bold no-margin-bottom">
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

export default Shuffle;
