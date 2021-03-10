import React from "react";
import SkyLight from "react-skylight";
import Card from "./card.js";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "./style.css";
import logo from "./logo.png";
import axios from "axios";

import qs from "qs";
import { Ring } from "react-spinners-css";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const dialogStyle = {
  backgroundColor: "white",
  top: 0,
  left: 0,
  marginLeft: 10,
  marginTop: 10,
  width:"inherit"
};

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



/**
 * Style for the search box
 */
const getSearchListStyle = (isDraggingOver) => ({
  boxShadow: "inset 0px 0px 15px 0px rgba(0,0,0,0.55)",
  background: isDraggingOver ? "#F6B09C" : "#F9DAD2",
  padding: 8,
  width: "100%",
  overflowX: "scroll",
  borderCollapse: "separate",
  borderSpacing: 5,
});


/**
 * Style for the found box
 */
const getFoundListStyle = (isDraggingOver) => ({
  boxShadow: "inset 0px 0px 15px 0px rgba(0,0,0,0.55)",
  background: isDraggingOver ? "#F7C257" : "#FCDC9D",
  padding: 8,
  width: "100%",
  overflowX: "scroll",
  borderCollapse: "separate",
  borderSpacing: 5,
});

class Foreground extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      showres: false,
      showsearchsettings:false,
      showrefine:false,
      launch: true,
      searchitems: [],
      founditems: [],
      rejectitems: [],
      clickeditem: [],
      screenshot: "",
      firstrun: false,
      loaded:false,
      searchurl:"https://fdl-us-knowledge.ue.r.appspot.com/similarimages/"
    };

    this.cardClick = this.cardClick.bind(this);
    this.assignWvbutton = this.assignWvbutton.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.showSearchBox = this.showSearchBox.bind(this);
    this.showSearchSettings = this.showSearchSettings.bind(this);
    this.fetchFound = this.fetchFound.bind(this);
    this.close = this.close.bind(this);
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

    if(this.state.searchitems.length > 2){
      console.log("more than 2 in search");
      this.setState({
        showrefine:true
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
    });
    this.getSearchCoordinates();
  }

  /**
   * Show the search settings
   */
  showSearchSettings() {
    this.setState({
      showsearchsettings: true,
    });
    // this.getSearchCoordinates();
  }

  /**
   * Get the right coordinates
   */
  getSearchCoordinates() {
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

    var searchdata = [
      {
        id: "item-1",
        content: full,
        image:
          "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&CRS=EPSG:4326&TIME=2020-10-02&WRAP=DAY&BBOX=" +
          full +
          "&FORMAT=image/jpeg&WIDTH=256&HEIGHT=256&AUTOSCALE=False&ts=1611851763001",
      },
    ];

    this.setState({
      searchitems: searchdata,
    });

    this.fetchFound(searchdata);
  }


  /**
   * Call the API
   */
  fetchFound(searchdata) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    };
    var searchimage = searchdata[0].image;
    var search = [
      {
        inputurl: searchimage,
        startdate: "2020-10-02",
        enddate: "2020-10-03",
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
          
           var firsthalf = stringed.substring(0,ts-3);
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
          loaded:true
        });
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  close(){
    this.setState({
      showres: false,
      founditems:[],
      searchitems:[]
    });
  }

  componentDidMount() {
    var wvbutton = document.getElementById("wv-image-button");

    if (wvbutton) {
      this.assignWvbutton(wvbutton);
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
          style={{ display: this.state.showres ? "none" : "block" }}
        >
          <button id="searchpromptbutton" onClick={this.showSearchBox}>
            Search For Similar
          </button>

          <button id="searchsettingsbutton" onClick={this.showSearchSettings}>
            search settings
          </button>
        </div>
        <div id="settings" style ={{ display: this.state.showsearchsettings ? "block" : "none"}}>
          <p>settings!</p>

        </div>
        <div
          id="results"
          style={{ display: this.state.showres ? "block" : "none" }}
        >
          <div className="topbar">
            <img src={logo} />
            <div id="closebutton" onClick={this.close}>close</div>
          </div>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <div className="search-container">
              <h2>
                Searching for: <b>{this.state.searchitems.length}</b>
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
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
            <div className="refinebar">
              <div id="refinebutton" className={ (this.state.searchitems.length > 1 ? 'showrefine' : 'hiderefine')}>refine search</div>
              <div id="downloadbutton">download all</div>
            </div>
            <div className="found-container">
              <h2>Found Similar images: {this.state.founditems.length}</h2>
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
                        />
                      ))}
                      {provided.placeholder}
                      {this.state.loaded ? null : <div className="loader">
                      <Ring color="#F08B02" />
                      <p>Searching...</p>
                      </div>}
                      
                      
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
              <p>{this.state.clickeditem.content}</p>
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
