import React from "react";
import SkyLight from "react-skylight";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";

import {  MdGrade, MdDelete } from 'react-icons/md';
import { Fade } from "react-awesome-reveal";

import Img from 'react-image';

const getItemStyle = (isDragging, draggableStyle) => ({
    // change background colour if dragging
userSelect: 'none',

  ...draggableStyle,
});

class Card extends React.Component {
  state = {};

  moveinfo(){
    var item = {
      source: {
        index:this.props.indexprop,
      }
    }
    return(item)
  }

  render() {
    
      return(
        <Draggable key={this.props.keyprop} draggableId={this.props.idprop} index={this.props.indexprop}>
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
        
            <img onClick={() => this.props.clickFunction(this.props.itemprop)} src={this.props.image}></img>
            {/* <div className="cardDetails">
        
            </div> */}
            
            <div className="cardButtonbar">
              {this.props.hasmovetosearch 
              ? ( <div className="keepButton button" onClick={()  => this.props.movetosearchfunction(this.moveinfo())}><MdGrade /> Move to input</div>)
              : (
                <div className="keepButton button" ><MdGrade /></div>
              )
              }
             
              <div className="discardButton button" onClick={()  => this.props.discardfunction(this.moveinfo())}><MdDelete /> discard</div>

            </div>
         
          </div>
        )}
      </Draggable>
      )

    
   
  }
}

export default Card;
