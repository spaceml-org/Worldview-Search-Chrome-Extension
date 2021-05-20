import React from "react";
import SkyLight from "react-skylight";
import Card from "./card.js";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "./style.css";
import logo from "./logo.png";
import axios from "axios";
import {
  MdSearch,
  MdClose,
  MdImage,
  MdGrade,
  MdYoutubeSearchedFor,
} from "react-icons/md";
import { IoEarth } from "react-icons/io5";
import { HiOutlineSwitchVertical } from "react-icons/hi";

import qs from "qs";
import { Ring } from "react-spinners-css";

import TextLoop from "react-text-loop";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const dialogStyle = {
  minHeight: "400px",
  position: "fixed",
  top: "30%",
  left: "50%",
};

function closest(needle, haystack) {
  // returns which of [1024,2048,4096] the i/p resoultion is closest to, threshold = 512
  return haystack.reduce((a, b) => {
    let aDiff = Math.abs(a - needle);
    let bDiff = Math.abs(b - needle);

    if (aDiff == bDiff) {
      return a > b ? a : b;
    } else {
      return bDiff < aDiff ? b : a;
    }
  });
}

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

function getMonthFromString(mon) {
  return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1;
}

function minTwoDigits(n) {
  return (n < 10 ? "0" : "") + n;
}

/**
 * Style for the search box
 */
const getSearchListStyle = (isDraggingOver) => ({
  // boxShadow: "inset 0px 0px 15px 0px rgba(0,0,0,0.55)",
  // background: isDraggingOver ? "#F6B09C" : "#F9DAD2",
  // padding: 8,
  // width: "100%",
  // overflowX: "scroll",
  // borderCollapse: "separate",
  // borderSpacing: 5,
});

/**
 * Style for the found box
 */
const getFoundListStyle = (isDraggingOver) => ({
  // boxShadow: "inset 0px 0px 15px 0px rgba(0,0,0,0.55)",
  // background: isDraggingOver ? "#F7C257" : "#FCDC9D",
  // padding: 8,
  // width: "100%",
  // overflowX: "scroll",
  // borderCollapse: "separate",
  // borderSpacing: 5,
});

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
      nearbyitems: [],
      rejectitems: [],
      clickeditem: [],
      screenshot: "",
      nearbyclicked: false,
      firstrun: false,
      loaded: false,
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
   * Points the items to the right droppables
   */
  id2List = {
    droppable: "searchitems",
    droppable2: "founditems",
  };

  getList = (id) => this.state[this.id2List[id]];

  /**
   * What happens when a card is dropped
   */
  onDragEnd = (result) => {
    console.log(result);
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { items };

      if (source.droppableId === "droppable2") {
        state = { selected: items };
      }

      this.setState(state);
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        searchitems: result.droppable,
        founditems: result.droppable2,
      });
    }

    if (this.state.searchitems.length > 2) {
      console.log("more than 2 in search");
      this.setState({
        showrefine: true,
      });
    }
  };

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

    //full contains a csv of bottom coordinates followed by top coordinates
    //storing the float version to state to compare coordinates with found items
    var newfull = full.split(",");
    newfull = newfull.map((item) => {
      return parseFloat(item);
    });
    console.log("new full: ", newfull);
    this.setState({
      baseCoordinates: newfull,
    });

    var year = document.getElementById("year-timeline").value;

    var month = document.getElementById("month-timeline").value;

    var day = document.getElementById("day-timeline").value;

    day = parseInt(day);

    day = minTwoDigits(day);

    month = getMonthFromString(month);

    month = minTwoDigits(month);

    var dimensions = document.getElementById("wv-image-dimensions").textContent;

    var dimsplit = dimensions.split("x");

    // x and y are the resolutions of the image in the search set, we get the max of these two and pass it to the closest function

    var x = dimsplit[0];

    var y = dimsplit[1];

    x = x.replace(/\D/g, "");

    y = y.replace(/\D/g, "");

    var largestdimension = Math.max(x, y);

    var allowedresolutions = [1024, 2048, 4096];

    //the closest function returns which value our input is closest to, threshold = 512,
    //example:  i/p: 1024 + (<=511) , o/p = 1024, i/p: 1024 + (>=512) , o/p = 2048, and similar for 2048 and 4096

    var closestdimension = closest(largestdimension, allowedresolutions);

    console.log("x: " + x + "y: " + y + "largest: " + largestdimension);
    console.log("dimension set as: ", closestdimension);
    var trainingsetting = "RANDOM";

    if (closestdimension == 4096) {
      trainingsetting = "NONE";
    }

    var searchdata = [
      {
        id: "item-1",
        dimension: closestdimension,
        training: trainingsetting,
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
          "&FORMAT=image/jpeg&WIDTH=" +
          largestdimension +
          "&HEIGHT=" +
          largestdimension +
          "&AUTOSCALE=False&ts=1611851763001",
      },
    ];

    this.setState({
      searchitems: searchdata,
    });
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
      showres: false,
      founditems: [],
      searchitems: [],
    });
  }

  componentDidMount() {
    console.log("component mounted");
    var wvbutton = document.getElementById("wv-image-button");

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

  discard(data) {
    console.log("discard");
    console.log(data.source.index);
    var newsearch = this.state.searchitems;
    newsearch.splice(data.source.index, 1);

    this.setState({
      searchitems: newsearch,
    });
  }

  //util function for calculating coordinate distance
  distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
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

    const config_headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    };

    const config = {
      headers: config_headers,
      timeout: 100000000,
    };

    if (
      this.state.searchitems.length < 2 &&
      this.state.searchitems[0].embeddings == null
    ) {
      // searching using the original image
      var inputurls = this.state.searchitems.map((a) => a.image);
      console.log(inputurls);

      var resolution = this.state.searchitems[0].dimension;
      resolution = parseInt(resolution);

      var body = {
        startdate: "08-15-2020",
        enddate: "08-15-2020",
      };

      var searchurl =
        "https://fdl-us-knowledge.ue.r.appspot.com/similarimagesmultiple/";
      console.log("Sending multi search POST");

      axios
        .post(searchurl, qs.stringify(body), {
          params: {
            resolutions: resolution,
            bound_box: 0,
            model_name: 0,
            ann_lib: 0,
            return_items: 10,
            products: "viirs",
            inputurls: inputurls,
            training_type: this.state.searchitems[0].training,
          },
          paramsSerializer: (params) => {
            console.log("multisearch sending:");
            console.log(params);
            return qs.stringify(params, { indices: false });
          },

          config,
        })
        .then((res) => {
          console.log("Multi search returns:");
          // console.log(res.data[0]);
          var found = [];
          res.data.forEach((data, i) => {
            var json = data;
            json = json.replaceAll("'", "");
            json = json.split("output_urls");
            json = json[1].slice(4);
            json = json.slice(0, -4);
            json = "[" + json + "]";
            // console.log("json replaced : %o", json);
            json = JSON.parse(json);
            // console.log("json parsed : %o", json);

            json.forEach((output, index) => {
              found.push({
                image: output.worldviewurl,
                id: "item-" + (index + 2),
                content: output.BBOX,
                embeddings: output.embedding,
                dimension: resolution,
              });
            });
          });

          let floatCoordinates = found.map((item) => {
            let newItem = item.content;
            newItem = newItem.split(",");
            newItem = newItem.map((element) => {
              return parseFloat(element);
            });
            return newItem;
          });

          // base coord: bottom left , top right
          // vertical lines are longitude
          // 0th and 2nd indexes are longtidude
          // console.log("Base Contents:", this.state.baseCoordinates);
          // console.log("Float Contents:  ", floatCoordinates);
          let diffList = [];
          floatCoordinates.forEach((item) => {
            diffList.push(
              (this.distance(
                item[1],
                item[0],
                this.state.baseCoordinates[1],
                this.state.baseCoordinates[0]
              ) +
                this.distance(
                  item[3],
                  item[2],
                  this.state.baseCoordinates[3],
                  this.state.baseCoordinates[2]
                )) /
                2
            );
          });
          // console.log("Found Items: ", found);
          let newfound = [];
          found.forEach((item, index) => {
            newfound.push({
              image: item.image,
              id: item.id,
              content: item.content,
              embeddings: item.embeddings,
              dimension: item.dimension,
              distance: diffList[index],
            });
          });
          // console.log("Diff List: ", diffList);
          // console.log("New Found: ", newfound);
          diffList.sort(function (a, b) {
            return a - b;
          });
          let nearby = diffList.slice(0, 5);
          let nearbyitems = [];
          newfound.forEach((item) => {
            nearby.forEach((element) => {
              if (element === item.distance) nearbyitems.push(item);
            });
          });
          // console.log("Nearby Items:", nearbyitems);
          this.setState({
            founditems: found,
            nearbyitems: nearbyitems,
            loaded: true,
          });
        })
        .catch((err) => {
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

          this.refinesearch();
        });
    } else {
      // multiple embeddings search here we go!
      var resolution = this.state.searchitems[0].dimension;
      resolution = parseInt(resolution);

      // construct the body -> combine embeddings of all searchitems
      var embeddings = "";
      this.state.searchitems.forEach((item, index) => {
        if (item.embeddings) {
          console.log("Embedding: %o", index);
          console.log(item.embeddings);
          var embedding = item.embeddings.slice(1, -1); // [second_index,second_last_index]
          if (embeddings != "") {
            embeddings = embeddings + "," + embedding;
          } else {
            embeddings = embedding;
          }
        }
      });

      const config_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

        "Access-Control-Allow-Headers":
          "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      };

      const config = {
        headers: config_headers,
        timeout: 100000000,
      };

      var body = {
        startdate: "08-15-2020",
        enddate: "08-15-2020",
        inputembeddings: embeddings.replace(/\s\s+/g, " "),
      };

      console.log("body before strinigfy:");
      console.log(body);

      body = qs.stringify(body, { indices: false });
      console.log("body:");
      console.log(body);

      var searchurl =
        "https://fdl-us-knowledge.ue.r.appspot.com/similarembeddings/";

      axios
        .post(
          searchurl,
          body,
          {
            params: {
              resolutions: resolution,
              bound_box: 0,
              model_name: 0,
              ann_lib: 0,
              return_items: 10,
              products: "viirs",
            },
            paramsSerializer: (params) => {
              console.log("embeddings search:");
              console.log(params);
              return qs.stringify(params, { indices: false });
            },
          },
          config
        )
        .then((res) => {
          console.log("embeddings search response");
          console.log(res.data);
          var found = [];
          var json = res.data;
          json = json.replaceAll("'", "");

          json = JSON.parse(json);
          console.log("jsoned1:");
          console.log(json);

          json.forEach((string, index) => {
            string = string.split("output_embeddings");
            string = string[1].slice(5);
            string = string.slice(0, -2);
            string = JSON.parse(string);
            console.log("Stringed:");
            console.log(string);
            string.forEach((output, index) => {
              found.push({
                image: output.worldviewurl,
                id: "item-" + (index + 2),
                content: output.BBOX,
                embeddings: output.embedding,
                dimension: resolution,
              });
            });
          });

          let floatCoordinates = found.map((item) => {
            let newItem = item.content;
            newItem = newItem.split(",");
            newItem = newItem.map((element) => {
              return parseFloat(element);
            });
            return newItem;
          });

          // base coord: bottom left , top right
          // vertical lines are longitude
          // 0th and 2nd indexes are longtidude
          // console.log("Base Contents:", this.state.baseCoordinates);
          // console.log("Float Contents:  ", floatCoordinates);
          let diffList = [];
          floatCoordinates.forEach((item) => {
            diffList.push(
              (this.distance(
                item[1],
                item[0],
                this.state.baseCoordinates[1],
                this.state.baseCoordinates[0]
              ) +
                this.distance(
                  item[3],
                  item[2],
                  this.state.baseCoordinates[1],
                  this.state.baseCoordinates[0]
                )) /
                2
            );
          });
          // console.log("Found Items: ", found);
          let newfound = [];
          found.forEach((item, index) => {
            newfound.push({
              image: item.image,
              id: item.id,
              content: item.content,
              embeddings: item.embeddings,
              dimension: item.dimension,
              distance: diffList[index],
            });
          });
          // console.log("Diff List: ", diffList);
          // console.log("New Found: ", newfound);
          diffList.sort(function (a, b) {
            return a - b;
          });
          let nearby = diffList.slice(0, 5);
          let nearbyitems = [];
          newfound.forEach((item) => {
            nearby.forEach((element) => {
              if (element === item.distance) nearbyitems.push(item);
            });
          });

          this.setState(
            {
              founditems: found,
              nearbyitems: nearbyitems,
              loaded: true,
            },
            console.log(this.state.founditems)
          );
        })
        .catch((err) => {
          console.log("multiple embeddings error");
          console.log(err);
          this.refinesearch();
        });
    }
  }

  render() {
    console.log("len= ", this.state.nearbyitems.length);
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
          <button id="searchpromptbutton" onClick={this.showSearchBox}>
            <IoEarth /> WorldView Similarity Search
          </button>

          {/* <button id="searchsettingsbutton" onClick={this.showSearchSettings}>
            search settings
          </button> */}
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
          <DragDropContext onDragEnd={this.onDragEnd}>
            <div className="search-container">
              <h2>
                <MdGrade /> Search input: <b>{this.state.searchitems.length}</b>
              </h2>
              <div className="droppable">
                <Droppable droppableId="droppable" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      className="droppablecont"
                      ref={provided.innerRef}
                      style={getSearchListStyle(snapshot.isDraggingOver)}
                    >
                      {this.state.searchitems.map((item, index) => (
                        <Card
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
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
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
              {this.state.founditems.length > 0 ? (
                <div id="refineprompt">
                  <p>
                    <HiOutlineSwitchVertical /> <b>Refine your search</b> by
                    moving found images to the search input.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="found-container">
              <h2
                style={{
                  display: this.state.nearbyclicked ? "none" : "block",
                }}
              >
                <MdImage /> Found Similar images: {this.state.founditems.length}
              </h2>
              <h2
                style={{
                  display: this.state.nearbyclicked ? "block" : "none",
                }}
              >
                <MdImage /> Found Nearby images: {this.state.nearbyitems.length}
              </h2>
              <button
                className="nearby-btn"
                style={{
                  display: this.state.nearbyclicked ? "none" : "block",
                }}
                onClick={() => this.setState({ nearbyclicked: true })}
              >
                View Nearby Items
              </button>
              <button
                className="nearby-btn"
                style={{
                  display: this.state.nearbyclicked ? "block" : "none",
                }}
                onClick={() => this.setState({ nearbyclicked: false })}
              >
                View All Items
              </button>
              <div
                className="droppable"
                style={{
                  display: this.state.nearbyclicked ? "none" : "block",
                }}
              >
                <Droppable droppableId="droppable2" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      className="droppablecont"
                      ref={provided.innerRef}
                      style={getFoundListStyle(snapshot.isDraggingOver)}
                    >
                      {this.state.founditems.map((item, index) => (
                        <Card
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
                        />
                      ))}
                      {provided.placeholder}
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
                        <div className="loader">
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
                  )}
                </Droppable>
              </div>
              <div
                className="droppable"
                style={{
                  display: this.state.nearbyclicked ? "block" : "none",
                }}
              >
                <Droppable droppableId="droppable2" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      className="droppablecont"
                      ref={provided.innerRef}
                      style={getFoundListStyle(snapshot.isDraggingOver)}
                    >
                      {this.state.nearbyitems.map((item, index) => (
                        <Card
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
                        />
                      ))}
                      {provided.placeholder}
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
                        <div className="loader">
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
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </div>

        <SkyLight
          dialogStyles={dialogStyle}
          hideOnOverlayClicked
          ref={(ref) => (this.simpleDialog = ref)}
          title=""
        >
          {this.state.clickeditem.image ? (
            <div>
              {/* <img src={this.state.screenshot}></img> */}
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
