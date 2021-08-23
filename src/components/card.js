import React from "react";
import SkyLight from "react-skylight";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";
import Iframe from "react-iframe";
import { MdGrade, MdDelete } from "react-icons/md";
import { BiMap } from "react-icons/bi";
import { Fade } from "react-awesome-reveal";
import ReactModal from "react-modal";
import Img from "react-image";

const getItemStyle = (isDragging, draggableStyle) => ({
  // change background colour if dragging
  userSelect: "none",

  ...draggableStyle,
});

const dialogStyle = {
  minHeight: "400px",
  position: "fixed",
  top: "30%",
  left: "50%",
};

const frameStyle = {
  minHeight: "600px",
  width: "800px",
  position: "fixed",
  top: "30%",
  left: "50%",
};

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
    //bind fns
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({
      modalOpen: true,
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
    });
  }

  moveinfo() {
    var item = {
      source: {
        index: this.props.indexprop,
      },
    };
    return item;
  }

  render() {
    return (
      <Draggable
        key={this.props.keyprop}
        draggableId={this.props.idprop}
        index={this.props.indexprop}
      >
        {(provided, snapshot) => (
          <div
            className="card_1 fade-in-image"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            {this.props.showview ? (
              <div className="cardButtonbar-top">
                <div
                  className="discardButton button"
                  onClick={() => this.simpleDialog.show()}
                >
                  <BiMap />
                  View
                </div>
                <SkyLight
                  dialogStyles={frameStyle}
                  hideOnOverlayClicked
                  ref={(ref) => (this.simpleDialog = ref)}
                  title="Image Location"
                >
                  {this.props.searchlocation ? (
                    // <Iframe
                    //   url={
                    //     // "https://worldview.earthdata.nasa.gov/" +
                    //     this.props.searchlocation
                    //   }
                    //   width="700px"
                    //   height="600px"
                    //   id="myId"
                    //   // className="frame-style"
                    //   display="initial"
                    //   position="relative"
                    //   loading="lazy"
                    // />
                    <div>Hello World!</div>
                  ) : (
                    <p> Please wait for search to complete!</p>
                  )}
                </SkyLight>
              </div>
            ) : null}
            <img
              className={this.props.imgstyle}
              onClick={() => this.props.clickFunction(this.props.itemprop)}
              src={this.props.image}
            ></img>
            <div className="cardButtonbar">
              {this.props.hasmovetosearch ? (
                <div
                  className="keepButton button"
                  onClick={() =>
                    this.props.movetosearchfunction(this.moveinfo())
                  }
                >
                  <MdGrade /> Move to input
                </div>
              ) : (
                <div className="keepButton button">
                  <MdGrade />
                </div>
              )}
              {/* {decides whether to discard from search or found container based on state of show view} */}
              {this.props.showview ? (
                <div
                  className="discardButton button"
                  onClick={() => this.props.discardfunction(this.moveinfo(), 2)}
                >
                  <MdDelete /> discard
                </div>
              ) : (
                <div
                  className="discardButton button"
                  onClick={() => this.props.discardfunction(this.moveinfo(), 1)}
                >
                  <MdDelete /> discard
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}

export default Card;
