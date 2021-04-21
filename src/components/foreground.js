import React from "react";
import SkyLight from "react-skylight";
import Card from "./card.js";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "./style.css";
import logo from "./logo.png";
import axios from "axios";
import { MdSearch, MdClose, MdImage, MdGrade, MdYoutubeSearchedFor } from 'react-icons/md';
import { IoEarth } from 'react-icons/io5';
import { HiOutlineSwitchVertical } from 'react-icons/hi';

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
  // backgroundColor: "white",
  // top: 0,
  // left: 0,
  // marginLeft: 10,
  // marginTop: 10,
  // width: "inherit",
};

function closest(needle, haystack) {
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

function getMonthFromString(mon){
  return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
};

function minTwoDigits(n) {

  return (n < 10 ? '0' : '') + n;
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
      showbuttons:false,
      showsearchsettings: false,
      showrefine: false,
      launch: true,
      searchitems: [],
      founditems: [],
      rejectitems: [],
      clickeditem: [],
      screenshot: "",
      firstrun: false,
      loaded: false,
      searchurl: "https://fdl-us-knowledge.ue.r.appspot.com/similarimages/",
    };

    this.cardClick = this.cardClick.bind(this);
    this.assignWvbutton = this.assignWvbutton.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.showSearchBox = this.showSearchBox.bind(this);
    this.showSearchSettings = this.showSearchSettings.bind(this);
    this.callAPI = this.callAPI.bind(this);
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
    console.log(param);
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
          showbuttons:true
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
      showbuttons:false,
      loaded:true
    });

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

    var dimensions = document.getElementById("wv-image-dimensions").textContent;

    var dimsplit = dimensions.split("x");

    var x = dimsplit[0];

    var y = dimsplit[1];

    x = x.replace(/\D/g,'');

    y = y.replace(/\D/g,'');

    var largestdimension = Math.max(x, y);

    var allowedresolutions = [4096];

    var closestdimension = closest(largestdimension, allowedresolutions);

    console.log("x: "+ x + "y: "+ y + "largest: "+ largestdimension);

    var trainingsetting = "RANDOM";

    if(closestdimension == 4096){
      trainingsetting = "NONE";
    }

    var searchdata = [
      {
        id: "item-1",
        dimension:closestdimension,
        training: trainingsetting,
        year: year,
        month: month, 
        day: day,
        content: full,
        image:
          "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&CRS=EPSG:4326&TIME="+year+"-"+month+"-"+day+"&WRAP=DAY&BBOX=" +
          full +
          "&FORMAT=image/jpeg&WIDTH="+largestdimension+"&HEIGHT="+largestdimension+"&AUTOSCALE=False&ts=1611851763001",
      },
    ];

    this.setState({
      searchitems: searchdata,
    });
    
  }

  startsearch(){
    
    // this.callAPI(this.state.searchitems);
    this.refinesearch();
  }

  /**
   * Show the search settings
   */
  showSearchSettings() {
    this.setState({
      showsearchsettings: true,
      showbuttons:false
    });
  }

  

  /**
   * Call the API
   */
  callAPI(searchdata) {
    this.setState({
      loaded:false,
    })
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    };
    var searchimage = searchdata[0].image;
    var date = searchdata[0].year+"-"+searchdata[0].month+"-"+searchdata[0].day;
    var search = [
      {
        inputurl: searchimage,
        startdate: date,
        enddate: date,
      },
    ];

    // var searchurl = "https://fdl-us-knowledge.ue.r.appspot.com/similarimages/";

    console.log("Posting to API:");
    console.log(search[0]);
    axios
      .post(this.state.searchurl, qs.stringify(search[0]), { headers: headers })
      .then((res) => {
        console.log("API returns:");
        console.log(res);
        var found = [];
        res.data.forEach((data, index) => {
          var stringed = JSON.stringify(data);

          var ts = stringed.search('"ts');

          var firsthalf = stringed.substring(0, ts - 3);
          firsthalf = firsthalf + '}"';

          var json = JSON.parse(firsthalf);
          var compiled = JSON.parse(json);

          found.push({
            image: compiled.urldisplayimage,
            id: "item-" + (index + 2),
            content: compiled.BBOX,
          });
        });
        this.setState({
          founditems: found,
          loaded: true,
        });
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  close() {
    this.setState({
      showres: false,
      founditems: [],
      searchitems: [],
    });
  }

  componentDidMount() {
    console.log("component mounted")
    var wvbutton = document.getElementById("wv-image-button");
    

    if (wvbutton) {
      console.log("found wv button")
      this.assignWvbutton(wvbutton);
    }
  }

  settingsChange(event){
    this.setState({searchurl: event.target.value});

  }

  settingsSubmit(event){
    
    this.setState({
      showres: false,
      showbuttons: true,
      showsearchsettings: false,
    });
    event.preventDefault();
  }

  moveToSearch(data){
    console.log("move to search");
    console.log(data.source.index);

    const moving = this.state.founditems[data.source.index];
    console.log(moving)
    var newsearch = this.state.searchitems;
    newsearch.splice(0,0,moving);

    var newfound = this.state.founditems;
    newfound.splice(data.source.index,1)

    this.setState({
      searchitems: newsearch,
      founditems: newfound
    });
  }

  discard(data){
    console.log("discard");
    console.log(data.source.index);
    var newsearch = this.state.searchitems;
    newsearch.splice(data.source.index,1);

    this.setState({
      searchitems: newsearch,
    });

  }

 /**
  * refine the search
  */
  
  refinesearch(){

    this.setState({
      loaded:false,
      founditems:[]
    })

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    };

    if(this.state.searchitems.length < 2 && this.state.searchitems[0].embeddings == null ){
      // searching using the original image
      var inputurls = this.state.searchitems.map( a => a.image);
    console.log(inputurls);
    

    var resolution = this.state.searchitems[0].dimension;
    resolution = parseInt(resolution);

    var body = {
      startdate: "08-15-2020",
      enddate: "08-24-2020",
    };

      
    var searchurl = "https://fdl-us-knowledge.ue.r.appspot.com/similarimagesmultiple/"
    console.log("Sending multi search POST");

    axios
      .post(searchurl,qs.stringify(body),{params:{
        resolutions:resolution,
        bound_box:0,
        model_name:0,
        ann_lib:0,
        return_items: 10,
        products:"viirs",
        inputurls:inputurls,
        training_type: this.state.searchitems[0].training
      }
      ,
  paramsSerializer: params => {
    console.log("multisearch sending:");
    console.log(params);
    return qs.stringify(params, {indices:false})
  }
    })
      .then((res) => {
        console.log("Multi search returns:")
        console.log(res.data[0]);
        var found = [];
        res.data.forEach((data,i) =>{
        
        var json = data;
        json = json.replaceAll("'", "")
        json = json.split("output_urls");
        json = json[1].slice(4);
        json = json.slice(0, -4);
        json = "["+json+"]";
        console.log("json replaced : %o", json);
        json = JSON.parse(json)
        console.log("json parsed : %o", json);

        json.forEach((output, index) =>{
          found.push({
            image: output.worldviewurl,
            id: "item-" + (index+2),
            content: output.BBOX,
            embeddings: output.embedding,
            dimension: resolution
          });
        });

        })
        
        this.setState({
          founditems: found,
          loaded: true,
        });
        
      })
      .catch((err) => {
        console.log(err.response)
      })
    } else {
    

      // multiple embeddings search here we go!
      var resolution = this.state.searchitems[0].dimension;
      resolution = parseInt(resolution);
      
      // construct the body
      var embeddings = "";
      this.state.searchitems.forEach((item, index) =>{
        if(item.embeddings){
          console.log("Embedding: %o", index);
          console.log(item.embeddings);
          var embedding = item.embeddings.slice(1,-1);
          if(embeddings != ""){
            embeddings = embeddings+","+embedding;
          } else {
            embeddings = embedding;
          }
          
        }
      })

      var body = {
        startdate: "08-15-2020",
        enddate: "08-24-2020",
        inputembeddings:embeddings.replace(/\s\s+/g, ' '),
      }

      console.log("body before strinigfy:");
      console.log(body);
      
      body = qs.stringify(body, {indices:false})
      console.log("body:");
      console.log(body);
      
      var searchurl = "https://fdl-us-knowledge.ue.r.appspot.com/similarembeddings/"

     
      axios
        .post(searchurl, body, {params:{
          resolutions:resolution,
          bound_box:0,
          model_name:0,
          ann_lib:0,
          return_items: 5,
          products:"viirs",
        },paramsSerializer: params => {
          console.log("embeddings search:");
          console.log(params);
          return qs.stringify(params, {indices:false})
        }})
        .then((res) => {
          console.log("embeddings search response")
          console.log(res.data)
          var found = [];
          var json = res.data;
          json = json.replaceAll("'", "")

          json = JSON.parse(json);
          console.log("jsoned1:");
          console.log(json);

          json.forEach((string, index) =>{
          
            string = string.split("output_embeddings");
            string = string[1].slice(5); 
            string = string.slice(0, -2);
            string = JSON.parse(string);
            console.log("Stringed:");
            console.log(string)
            string.forEach((output, index) =>{
              found.push({
                image:output.worldviewurl,
                id: "item-" + (index+2),
                content: output.BBOX,
                embeddings: output.embedding,
                dimension: resolution
              })
            })
          })

         

          this.setState({
            founditems: found,
            loaded: true,
          });

        })
        .catch((err) =>{
          console.log("error")
          console.log(err.response)
        })
    }

    
    

    
  }



  render() {
    return (
      <div
        id="popup-cover"
        style={{ display: this.state.show ? "block" : "none" }}
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
          id="settings"
          style={{ display: this.state.showsearchsettings ? "block" : "none" }}
        >
          <h2>Search Settings</h2>
          <form onSubmit={this.settingsSubmit}>
            <label>API URL:
              <input type="text" 
              name="searchurl" 
              value={this.state.searchurl} 
              onChange={this.settingsChange}
              />
            </label>
            <br />
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div
          id="results"
          style={{ display: this.state.showres ? "block" : "none" }}
        >
          <div className="topbar">
            <p><IoEarth /> <b>WorldView</b> Similarity Search</p>
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
                          hasmovetosearch = {false}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
            <div className="refinebar">
              {this.state.founditems.length > 0 
              ?(
              <div id="refineprompt">
              <p><HiOutlineSwitchVertical /> <b>Refine your search</b> by moving found images to the search input.</p>
              </div>
              )
              : (null)
              }
              
              <div
                id="refinebutton"
                className={
                  this.state.loaded == false
                    ? "activebutton"
                    : (null)
                }
                onClick={this.startsearch}
              >
                 {this.state.founditems.length > 0 
              ?(
                <MdYoutubeSearchedFor /> 
              )
              : (<MdSearch /> )
              }
                  &nbsp;Search 
              </div>
              {/* <div id="downloadbutton">download all</div> */}
            </div>
            <div className="found-container">
              <h2><MdImage /> Found Similar images: {this.state.founditems.length}</h2>
              <div className="droppable">
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
                          hasmovetosearch = {true}
                        />
                        
                      ))}
                      {provided.placeholder}
                      {this.state.founditems.length < 1 && this.state.loaded  ? (<div className="loader">
                        
                        <p>Press the search button above to<br /> perform a similarity search. <br/><br /> The results will show up here.</p>
                      </div>):(
                        null
                      )}

                      {this.state.loaded ? (
                      null
                      ) : (
                        <div className="loader">
                          <Ring color="white" />
                          <p>Searching... Using {this.state.searchitems.length} image(s).</p>
                          <br />
                          <br />
                          <p><TextLoop children={["Creating embeddings...", "Indexing the planet...", "Configuring models...", "Optimizing search area...", "Searching for similarities..."]} /></p>

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
              <p>Download: <a href={this.state.clickeditem.image}>LINK</a></p>
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
