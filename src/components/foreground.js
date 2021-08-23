import React from "react";
import SkyLight from "react-skylight";
import Card from "./card.js";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
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
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);

  return result;
};

const dialogStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  console.log("Move invoked!");
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
 Presets for date picker
 */
const [min, max] = [new Date(2020, 7, 15), new Date(2020, 7, 24)];
// const [value, onChange] = [new Date(2020, 8, 15), new Date(2020, 8, 24)];
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
      // nearbyitems: [],
      rejectitems: [],
      clickeditem: [],
      found1: [],
      found2: [],
      found3: [],
      searchmap: {},
      screenshot: "",
      // nearbyclicked: false,
      firstrun: false,
      loaded: false,
      viewdate: false,
      showview: false,
      daterange: [new Date(2020, 7, 24), new Date(2020, 7, 24)],
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
      if (result.droppable) this.setState({ searchitems: result.droppable });
      if (result.droppable2) this.setState({ founditems: result.droppable2 });
      // this.setState({
      //   searchitems: result.droppable,
      //   founditems: result.droppable2,
      // });
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

    var allowedresolutions = [512, 1024, 2048];

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
    // this.setState({
    //   viewdate: true,
    // });
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
    // outside.onClick(() => {
    //   console.log("outside click!");
    // });

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
   * Utility function to convert date obj to mm/dd/yyyy
   */
  getFormattedDate(obj) {
    var month = obj.getMonth() + 1;
    var day = obj.getDate();
    var year = obj.getFullYear();
    return month + "-" + day + "-" + year;
  }

  //Utility function to merge two sorted lists based on embedding distance
  merge(arr1, arr2) {
    let merged = [];
    let index1 = 0;
    let index2 = 0;
    let current = 0;

    while (current < arr1.length + arr2.length) {
      let isArr1Depleted = index1 >= arr1.length;
      let isArr2Depleted = index2 >= arr2.length;

      if (
        !isArr1Depleted &&
        (isArr2Depleted ||
          parseFloat(arr1[index1].distance) < parseFloat(arr2[index2].distance))
      ) {
        merged[current] = arr1[index1];
        index1++;
      } else {
        merged[current] = arr2[index2];
        index2++;
      }

      current++;
    }

    return merged;
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

    //setting url variables for view on map ( searchlocation )
    const urlprefix =
      "?l=Reference_Labels_15m(hidden),Reference_Features_15m(hidden),Coastlines_15m(hidden),VIIRS_NOAA20_CorrectedReflectance_TrueColor(hidden),VIIRS_SNPP_CorrectedReflectance_TrueColor,MODIS_Aqua_CorrectedReflectance_TrueColor(hidden),MODIS_Terra_CorrectedReflectance_TrueColor(hidden)&lg=true";
    const zoomlevel =
      "&v=-166.02834055119263,-88.04645825821608,207.31713381220345,87.44535976936983+&t=";

    //setting varibles for start date and end date
    // let startdate = this.getFormattedDate(this.state.daterange[0]);
    // let enddate = this.getFormattedDate(this.state.daterange[1]);

    let startdate = "08-16-2020";
    let enddate = "08-16-2020";

    if (
      this.state.searchitems.length < 2 &&
      this.state.searchitems[0].embeddings == null
    ) {
      // searching using the original image
      var inputurls = this.state.searchitems.map((a) => a.image);
      console.log(inputurls);

      var resolution = this.state.searchitems[0].dimension;
      resolution = parseInt(resolution);

      var res1 = 512,
        res2 = 1024,
        res3 = 2048;

      var body = {
        startdate: startdate,
        enddate: enddate,
      };

      var searchurl =
        "https://fdl-us-knowledge.ue.r.appspot.com/similarimagesmultiple/";
      console.log("Sending multi search POST");

      let found1 = [];
      let dist1 = [];
      let searchmap = {};

      //api call for 512
      axios
        .post(searchurl, qs.stringify(body), {
          params: {
            resolutions: 512,
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
          let condensedlist = [];
          res.data.forEach((d, i) => {
            var json = d.replace("'", "");
            json = JSON.parse(json);
            var output_urls = json.output_urls;
            output_urls = output_urls.replace(/'/g, "");
            output_urls = JSON.parse(output_urls);
            output_urls.forEach((output, index) => {
              found1.push({
                image: output.worldviewurl,
                id:
                  "img-" +
                  (index + 2) +
                  Math.random().toString(36).substr(2, 9),
                content: output.BBOX,
                embeddings: output.embedding,
                dimension: resolution,
                distance: output.distance,
              });
              dist1.push(output.distance);
              // condense the coordinates of this particular image into 2 coordinates, to be able to view it on map using marker
              let coordinates = found1[index].content.split(",");
              let bottom =
                (parseFloat(coordinates[0]) + parseFloat(coordinates[2])) / 2;
              let top =
                (parseFloat(coordinates[1]) + parseFloat(coordinates[3])) / 2;
              condensedlist.push("&s=" + String(top) + "," + String(bottom));
              console.log("coord is :", coordinates);
              //adding the condensed values and the time to our search map for the view on map feature, by mapping id of found1[idx] (current image) to location
              let time = new URLSearchParams(found1[index].image).get("TIME");
              searchmap[found1[index].id] =
                urlprefix + zoomlevel + "&t=" + time + condensedlist[index];
            });
          });

          console.log("distance1: ", dist1);
          console.log("search_map: ", searchmap);
          this.setState(
            {
              founditems: found1,
              loaded: true,
              searchmap: searchmap,
              showview: true,
            },
            () => console.log("founditems: ", this.state.founditems)
          );
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
      // let zoomlevel =
      //   "&v=-166.02834055119263,-88.04645825821608,207.31713381220345,87.44535976936983+&t=";
      var resolution = this.state.searchitems[0].dimension;
      resolution = parseInt(resolution);
      let searchmap = [];
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
        startdate: startdate,
        enddate: enddate,
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
              resolutions: 512,
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
          var found1 = [];
          let condensedlist = [];
          var json = res.data;
          json = JSON.parse(res.data);
          json = json["output_embeddings"];
          json = json.replace(/'/g, "");
          json = JSON.parse(json);
          json.forEach((data, index) => {
            found1.push({
              image: data.worldviewurl,
              id:
                "img-" + (index + 2) + Math.random().toString(36).substr(2, 9),
              content: data.BBOX,
              embeddings: data.embedding,
              dimension: resolution,
            });
            let coordinates = found1[index].content.split(",");
            let bottom =
              (parseFloat(coordinates[0]) + parseFloat(coordinates[2])) / 2;
            let top =
              (parseFloat(coordinates[1]) + parseFloat(coordinates[3])) / 2;
            condensedlist.push("&s=" + String(top) + "," + String(bottom));
            console.log("coord is :", coordinates);
            //adding the condensed values and the time to our search map for the view on map feature, by mapping id of found1[idx] (current image) to location
            let time = new URLSearchParams(found1[index].image).get("TIME");
            searchmap[found1[index].id] =
              urlprefix + zoomlevel + "&t=" + time + condensedlist[index];
          });

          console.log("Multi seach found: ", found1);
          this.setState(
            {
              founditems: found1,
              showview: true,
              searchmap: searchmap,
              loaded: true,
            },
            console.log(this.state.founditems)
          );
        })
        .catch((err) => {
          console.log("multiple embeddings error");
          console.log(err);
          // this.refinesearch();
        });
    }
  }

  render() {
    // console.log("clicked item= ", this.state.clickeditem.content);

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
          <DragDropContext onDragEnd={this.onDragEnd}>
            <div className="search-container">
              <h2 style={{ width: "674px", textAlign: "left" }}>
                <MdGrade /> Search input: <b>{this.state.searchitems.length}</b>
              </h2>
              <div className="droppable-search">
                <Droppable droppableId="droppable" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      className="droppablecont"
                      ref={provided.innerRef}
                      style={getSearchListStyle(snapshot.isDraggingOver)}
                    >
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
                  <MdImage /> Showing first {this.state.founditems.length}{" "}
                  results
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
                <Droppable droppableId="droppable2" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      className="droppablecont"
                      ref={provided.innerRef}
                      style={getFoundListStyle(snapshot.isDraggingOver)}
                    >
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
