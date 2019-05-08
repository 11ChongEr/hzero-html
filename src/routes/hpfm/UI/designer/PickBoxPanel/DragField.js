/**
 * 可拖动的 新增的字段
 */
import React from 'react';
import { DragSource } from 'react-dnd';

import { DragType } from '../config';

const classNames = {
  formClassName: 'iconfont icon-form',
  tableClassName: 'iconfont icon-table',
  toolbarClassName: 'iconfont icon-buttonq',
  modalClassName: 'iconfont icon-square',
  selectClassName: 'iconfont icon-select',
  dateClassName: 'iconfont icon-date',
  numberClassName: 'iconfont icon-plus-numberfill',
  lovClassName: 'iconfont icon-search',
  inputClassName: 'iconfont icon-wenben',
  checkboxClassName: 'iconfont icon-checkbox',
  switchClassName: 'iconfont icon-kaiguanclose',
  buttonClassName: 'iconfont icon-button-component',
};

const dragFieldSpec = {
  beginDrag(props) {
    return {
      component: props.component,
    };
  },
};

const dragFieldCollect = (connect, monitor) => {
  const connectDragSource = connect.dragSource();
  const connectDragPreview = connect.dragPreview();
  const isDragging = monitor.isDragging();
  return {
    connectDragSource,
    connectDragPreview,
    isDragging,
  };
};

@DragSource(DragType.dragField, dragFieldSpec, dragFieldCollect)
class DragField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { component = {}, connectDragSource } = this.props;
    return (
      connectDragSource &&
      connectDragSource(
        <div className="drag-field pick-box-panel-item">
          <i className={classNames[component.className]} />
          <h3>{component.name}</h3>
        </div>
      )
    );
  }
}

export default DragField;
