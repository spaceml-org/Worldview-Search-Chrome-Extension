import React from "react";
import SkyLight from "react-skylight";
import Card from "./card.js";
import "./style.css";

import axios from "axios";
import {
  MdSearch,
  MdClose,
  MdImage,
  MdGrade,
  MdYoutubeSearchedFor,
} from "react-icons/md";
import { IoEarth } from "react-icons/io5";

import { Ring } from "react-spinners-css";

import TextLoop from "react-text-loop";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const dialogStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
  position: "fixed",
  top: "30%",
  left: "50%",
};

function getMonthFromString(mon) {
  return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1;
}

function minTwoDigits(n) {
  return (n < 10 ? "0" : "") + n;
}

class Foreground extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      showres: false,
      showbuttons: false,
      showsearchsettings: false,
      showrefine: false,
      launch: true,
      searchitems: [],
      founditems: [],
      clickeditem: [],
      found1: [],
      searchmap: {},
      screenshot: "",
      firstrun: false,
      loaded: false,
      viewdate: false,
      showview: false,
      searchurl: "https://fdl-us-knowledge.ue.r.appspot.com/similarimages/",
    };

    this.cardClick = this.cardClick.bind(this);
    this.assignWvbutton = this.assignWvbutton.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.showSearchBox = this.showSearchBox.bind(this);
    this.showSearchSettings = this.showSearchSettings.bind(this);

    this.close = this.close.bind(this);
    this.settingsChange = this.settingsChange.bind(this);
    this.settingsSubmit = this.settingsSubmit.bind(this);
    this.moveToSearch = this.moveToSearch.bind(this);
    this.discard = this.discard.bind(this);
    this.refinesearch = this.refinesearch.bind(this);
    this.startsearch = this.startsearch.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.toDataURL = this.toDataURL.bind(this);
  }

  dateChange(range) {
    this.setState({
      daterange: range,
    });
  }

  /**
   * To open a dialog window when a card is clicked
   */
  cardClick(param) {
    console.log("param= ", param);
    this.simpleDialog.show();
    this.setState({
      clickeditem: param,
    });
  }

  /**
   * Assign the worldview button to show the "search similar" button
   */
  assignWvbutton(button) {
    var self = this;

    button.addEventListener("click", function () {
      self.setState(
        {
          show: true,
          showbuttons: true,
        },
        () => {
          console.log(this.state);
        }
      );
    });
  }

  /**
   * Show the search box
   * This function sets the parameters for the request body of the selected bounded box
   */
  showSearchBox() {
    this.setState({
      showres: true,
      showbuttons: false,
      loaded: true,
    });

    // latitude and longitude of top and bottom of the bounded box
    var top = document.getElementById("wv-image-top").textContent;
    var bottom = document.getElementById("wv-image-bottom").textContent;

    var topsplit = top.split(" ");
    var top1 = topsplit[0].slice(0, -2);
    var top2 = topsplit[1].slice(0, -1);

    var bottomsplit = bottom.split(" ");
    var bottom1 = bottomsplit[0].slice(0, -2);
    var bottom2 = bottomsplit[1].slice(0, -1);

    top = top1 + "," + top2;
    bottom = bottom1 + "," + bottom2;

    var full = bottom + "," + top;

    var year = document.getElementById("year-timeline").value;

    var month = document.getElementById("month-timeline").value;

    var day = document.getElementById("day-timeline").value;

    day = parseInt(day);

    day = minTwoDigits(day);

    month = getMonthFromString(month);

    month = minTwoDigits(month);

    var searchdata = [
      {
        id: "item-1",
        year: year,
        month: month,
        day: day,
        content: full,
        image:
          "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&CRS=EPSG:4326&TIME=" +
          year +
          "-" +
          month +
          "-" +
          day +
          "&WRAP=DAY&BBOX=" +
          full +
          "&FORMAT=image/jpeg&WIDTH=256&HEIGHT=256&AUTOSCALE=TRUE&ts=1611851763001",
        // "&FORMAT=image/jpeg&WIDTH=" +
        // largestdimension +
        // "&HEIGHT=" +
        // largestdimension +
        // "&AUTOSCALE=False&ts=1611851763001",
      },
    ];

    this.setState(
      {
        searchitems: searchdata,
      },
      () => {
        this.startsearch();
      }
    );
  }

  startsearch() {
    this.refinesearch();
  }

  /**
   * Show the search settings
   */
  showSearchSettings() {
    this.setState({
      showsearchsettings: true,
      showbuttons: false,
    });
  }

  /**
   * Call the API
   */

  close() {
    this.setState({
      show: false,
      showres: false,
      founditems: [],
      searchitems: [],
    });
  }

  componentDidMount() {
    console.log("component mounted");
    var wvbutton = document.getElementById("wv-image-button");

    var outside = document.getElementsByClassName("ol-viewport")[0];
    console.dir(outside);
    outside.onclick = () => {
      console.log("outside click!");
      this.close();
    };

    if (wvbutton) {
      console.log("found wv button");
      this.assignWvbutton(wvbutton);
    }
  }

  settingsChange(event) {
    this.setState({ searchurl: event.target.value });
  }

  settingsSubmit(event) {
    this.setState({
      showres: false,
      showbuttons: true,
      showsearchsettings: false,
    });
    event.preventDefault();
  }

  moveToSearch(data) {
    console.log("move to search");
    console.log(data.source.index);

    const moving = this.state.founditems[data.source.index];
    console.log(moving);
    var newsearch = this.state.searchitems;
    newsearch.splice(0, 0, moving);

    var newfound = this.state.founditems;
    newfound.splice(data.source.index, 1);

    this.setState({
      searchitems: newsearch,
      founditems: newfound,
    });
  }

  discard(data, val) {
    console.log(`discard: ${val}`);
    console.log(data.source.index);
    if (val === 1) {
      var newsearch = this.state.searchitems;
      newsearch.splice(data.source.index, 1);
      this.setState({
        searchitems: newsearch,
      });
    } else if (val === 2) {
      var newfound = this.state.founditems;
      newfound.splice(data.source.index, 1);
      this.setState({
        founditems: newfound,
      });
    }
  }

  /**
   * function to convert img to base64
   */

  toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  }

  /**
   * refine the search
   */

  refinesearch() {
    this.setState({
      loaded: false,
      founditems: [],
    });

    console.log("search items = ", this.state.searchitems);

    //setting url variables for view on map ( searchlocation )
    const urlprefix =
      "?l=Reference_Labels_15m(hidden),Reference_Features_15m(hidden),Coastlines_15m(hidden),VIIRS_NOAA20_CorrectedReflectance_TrueColor(hidden),VIIRS_SNPP_CorrectedReflectance_TrueColor,MODIS_Aqua_CorrectedReflectance_TrueColor(hidden),MODIS_Terra_CorrectedReflectance_TrueColor(hidden)&lg=true";
    const zoomlevel =
      "&v=-166.02834055119263,-88.04645825821608,207.31713381220345,87.44535976936983+&t=";

    // searching using the original image
    var inputurls = this.state.searchitems.map((a) => a.image);
    console.log(inputurls);

    // converts the search image to base64
    // post request to api made within context of this function as it returns a promise asynchronously
    this.toDataURL(inputurls, (encoded) => {
      var parent = this;
      console.log(parent);
      // console.log("raw encoded output: ", encoded);
      encoded = encoded.substring(encoded.indexOf(",") + 1);
      //setup for api call
      var data = JSON.stringify({
        image: encoded,
        neighbors: 10,
      });

      var config = {
        method: "post",
        url: "https://d2cru4xfdgon7n.cloudfront.net/search",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
        },
        data: data,
      };
      let found1 = [];
      //api call to /search endpoint
      axios(config)
        .then(function (response) {
          // console.log("API Response: ", JSON.stringify(response.data));
          let json = response.data;
          // console.log(json);
          json = JSON.stringify(json);
          json = JSON.parse(json);
          json = json["images"];
          json.forEach((item, idx) => {
            //   console.log(idx + 1, ": ", item);
            found1.push({
              image: item.url,
              id: "img-" + (idx + 2) + Math.random().toString(36).substr(2, 9),
              content: item.bbox,
            });
            // condense the coordinates of this particular image into 2 coordinates, to be able to view it on map using marker
            //   let coordinates = found1[index].content.split(",");
            //   let bottom =
            //     (parseFloat(coordinates[0]) + parseFloat(coordinates[2])) / 2;
            //   let top =
            //     (parseFloat(coordinates[1]) + parseFloat(coordinates[3])) / 2;
            //   condensedlist.push("&s=" + String(top) + "," + String(bottom));
            //   console.log("coord is :", coordinates);
            //   //adding the condensed values and the time to our search map for the view on map feature, by mapping id of found1[idx] (current image) to location
            //   let time = new URLSearchParams(found1[index].image).get("TIME");
            //   searchmap[found1[index].id] =
            //     urlprefix + zoomlevel + "&t=" + time + condensedlist[index];
            parent.setState(
              {
                founditems: found1,
                loaded: true,
                // searchmap: searchmap,
                showview: false,
              },
              () => console.log("founditems: ", parent.state.founditems)
            );
          });
          // console.log(found1);
        })
        .catch(function (err) {
          if (err.response) {
            console.log("error response:");
            console.log(err.response);
          } else if (err.request) {
            console.log("error request:");
            console.log(err.request);
          } else {
            console.log("error:");
            console.log(err);
          }

          // this.refinesearch();
        });
    });
  }

  render() {
    return (
      <div
        id="popup-cover"
        style={{
          display: this.state.show ? "block" : "none",
        }}
      >
        <div
          id="searchprompt"
          style={{ display: this.state.showbuttons ? "block" : "none" }}
        >
          <button
            id="searchpromptbutton"
            onClick={() => {
              this.showSearchBox();
              // this.startsearch();
            }}
          >
            <IoEarth /> WorldView Similarity Search
          </button>
        </div>
        <div
          id="results"
          style={{ display: this.state.showres ? "block" : "none" }}
        >
          <div className="topbar">
            <p>
              <IoEarth /> <b>WorldView</b> Similarity Search
            </p>
            <div id="closebutton" onClick={this.close}>
              <MdClose />
            </div>
          </div>
          <div style={{ display: "none" }}>
            <img id="hidden-img" src={this.state.searchitems.img}></img>
          </div>
          <div className="search-container">
            <h2 style={{ width: "674px", textAlign: "left" }}>
              <MdGrade /> Search input: <b>{this.state.searchitems.length}</b>
            </h2>
            <div className="droppable-search">
              <div className="droppablecont">
                {this.state.searchitems.map((item, index) => (
                  <Card
                    imgstyle="search-img"
                    itemprop={item}
                    clickFunction={this.cardClick}
                    keyprop={item.id}
                    idprop={item.id}
                    indexprop={index}
                    image={item.image}
                    droppable={"droppable"}
                    movetosearchfunction={this.moveToSearch}
                    discardfunction={this.discard}
                    hasmovetosearch={false}
                    showview={false}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="refinebar"
            id="search"
            style={{
              display: this.state.searchitems.length > 0 ? "block" : "none",
            }}
          >
            <div
              id="refinebutton"
              className={this.state.loaded == false ? "activebutton" : null}
              onClick={this.startsearch}
            >
              {this.state.founditems.length > 0 ? (
                <MdYoutubeSearchedFor />
              ) : (
                <MdSearch />
              )}
              &nbsp;Search
            </div>
          </div>
          <div className="found-container">
            {this.state.founditems.length > 0 ? (
              <h2
                style={{
                  display: this.state.nearbyclicked ? "none" : "block",
                  width: "674px",
                  textAlign: "left",
                }}
              >
                <MdImage /> Showing first {this.state.founditems.length} results
              </h2>
            ) : (
              <h2
                style={{
                  display: this.state.nearbyclicked ? "none" : "block",
                  width: "674px",
                  textAlign: "left",
                }}
              >
                <MdImage /> Click search!
              </h2>
            )}
            <div
              className="droppable"
              style={{
                display: this.state.nearbyclicked ? "none" : "block",
              }}
            >
              <div className="droppablecont">
                {this.state.founditems.map((item, index) => (
                  <Card
                    imgstyle="output-img"
                    itemprop={item}
                    clickFunction={this.cardClick}
                    keyprop={item.id}
                    idprop={item.id}
                    indexprop={index}
                    image={item.image}
                    droppable={"droppable2"}
                    movetosearchfunction={this.moveToSearch}
                    discardfunction={this.discard}
                    hasmovetosearch={true}
                    showview={this.state.showview}
                    // searchlocation={item.searchlocation}
                    searchlocation={
                      this.state.showview
                        ? "https://worldview.earthdata.nasa.gov/" +
                          this.state.searchmap[item.id]
                        : null
                    }
                  />
                ))}
                {this.state.founditems.length < 1 && this.state.loaded ? (
                  <div className="loader">
                    <p>
                      Press the search button above to
                      <br /> perform a similarity search. <br />
                      <br /> The results will show up here.
                    </p>
                  </div>
                ) : null}

                {this.state.loaded ? null : (
                  <div className="loader2">
                    <Ring color="white" />
                    <p>
                      Searching... Using {this.state.searchitems.length}{" "}
                      image(s).
                    </p>
                    <br />
                    <br />
                    <p>
                      <TextLoop
                        children={[
                          "Creating embeddings...",
                          "Indexing the planet...",
                          "Configuring models...",
                          "Optimizing search area...",
                          "Searching for similarities...",
                        ]}
                      />
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <SkyLight
          dialogStyles={dialogStyle}
          hideOnOverlayClicked
          ref={(ref) => (this.simpleDialog = ref)}
          title=""
        >
          {this.state.clickeditem.image ? (
            <div>
              <img
                className="dialogImage"
                src={this.state.clickeditem.image}
              ></img>
              <p>Location: {this.state.clickeditem.content}</p>
              <p>
                Download: <a href={this.state.clickeditem.image}>LINK</a>
              </p>
            </div>
          ) : (
            <p>nothing here</p>
          )}
        </SkyLight>
      </div>
    );
  }
}

export default Foreground;
