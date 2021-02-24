import React from "react";
import SkyLight from "react-skylight";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";

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
      droppableId:this.props.droppable,
      source: {
        index:this.props.index,
        droppableId:this.props.droppable
      }
    }
    return(item)
  }

  render() {
    
      return(
        <Draggable key={this.props.keyprop} draggableId={this.props.idprop} index={this.props.indexprop}>
        {(provided, snapshot) => (
          <div
            
            className="card"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
        
            <img onClick={() => this.props.clickFunction(this.props.itemprop)} src={this.props.image}></img>
            <div className="cardDetails">
        
            </div>
            
            <div className="cardButtonbar">
              <div className="keepButton button" onClick={()  => this.props.movetosearchfunction(this.moveinfo())}>keep</div>
              <div className="discardButton button">discard</div>

            </div>
         
          </div>
        )}
      </Draggable>
      )

    
   
  }
}

export default Card;
