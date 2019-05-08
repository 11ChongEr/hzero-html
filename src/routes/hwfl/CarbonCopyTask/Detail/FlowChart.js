import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { approveNameRender } from 'utils/renderer';
import intl from 'utils/intl';
import { getAccessToken } from 'utils/utils';
import { HZERO_WFL, API_HOST } from 'utils/config';

const prefix = `${HZERO_WFL}/v1`;

export default class FlowChart extends Component {
  state = {
    forecastData: '',
  };

  processImage;

  componentDidMount() {
    this.loadForecastDiagram();
  }

  loadForecastDiagram() {
    const { dispatch, tenantId, match } = this.props;
    dispatch({
      type: 'carbonCopyTask/fetchForecast',
      payload: {
        tenantId,
        id: match.params.id,
      },
    }).then(data => {
      if (data) {
        this.setState({
          forecastData: data,
        });
      }
    });
  }

  getForecastDiagramTR(assigneeName, positionName, unitName, action, endTime, id) {
    return (
      <tr align="center" key={id}>
        <td>{assigneeName}</td>
        <td>{positionName}</td>
        <td>{unitName}</td>
        <td>{approveNameRender(action)}</td>
        <td>{endTime}</td>
      </tr>
    );
  }

  getForecastDiagramTRs(data) {
    const trs = [];
    const historyList = data.history || {};
    const forecastList = data.forecast;
    if (data.executed || historyList) {
      for (let i = 0; i < historyList.length; i += 1) {
        const assigneeName = historyList[i].assigneeName || '';
        const positionName = historyList[i].positionName || '';
        const unitName = historyList[i].unitName || '';
        const tr = this.getForecastDiagramTR(
          assigneeName,
          positionName,
          unitName,
          historyList[i].action,
          historyList[i].endTime,
          historyList[i].id
        );
        trs.push(tr);
      }
    }
    if (forecastList) {
      for (let i = 0; i < forecastList.length; i += 1) {
        const employeeCode = forecastList[i].employeeCode || '';
        const positionName = forecastList[i].positionName || '';
        const unitName = forecastList[i].unitName || '';
        const tr = this.getForecastDiagramTR(
          `${forecastList[i].name}(${employeeCode})`,
          positionName,
          unitName,
          '',
          ''
        );
        trs.push(tr);
      }
    }
    return trs;
  }

  getForecastDiagramContent(data) {
    return (
      <div key={data.taskId}>
        <table border="1" cellSpacing="0">
          <tbody>
            <tr align="center">
              <th>{intl.get('hwfl.common.model.approval.owner').d('审批人')}</th>
              <th>{intl.get('entity.position.name').d('岗位名称')}</th>
              <th>{intl.get('entity.department.name').d('部门名称')}</th>
              <th>{intl.get('hwfl.common.model.approval.action').d('审批动作')}</th>
              <th>{intl.get('hwfl.common.model.approval.time').d('审批时间')}</th>
            </tr>
            {this.getForecastDiagramTRs(data)}
          </tbody>
        </table>
      </div>
    );
  }

  getForecastDiagram(offsetLeft, offsetTop, data) {
    const grapINfo = data.graphicInfo;
    const left = grapINfo.x + offsetLeft;
    const top = grapINfo.y + offsetTop;
    return (
      <Popover
        content={this.getForecastDiagramContent(data)}
        title={intl.get('hwfl.common.model.approval.record').d('审批记录')}
        key={data.taskId}
      >
        <div
          id={data.taskId}
          name="svgDiv"
          style={{
            width: grapINfo.width,
            height: grapINfo.height,
            position: 'absolute',
            left,
            top,
          }}
        />
      </Popover>
    );
  }

  getForecastData = data => {
    const forecastDiagrams = [];
    if (data) {
      const dom = this.processImage;
      for (let i = 0; i < data.length; i += 1) {
        const div = this.getForecastDiagram(0, dom.offsetTop, data[i]);
        forecastDiagrams.push(div);
      }
    }
    return forecastDiagrams;
  };

  /**
   * 获取流程预览及预测图路径.
   * @returns {*} 流程预览及预测图路径
   */
  @Bind()
  processImageSrc() {
    const { tenantId, match, uselessParam } = this.props;
    const accessToken = getAccessToken('access_token');
    return `${API_HOST}${prefix}/${tenantId}/process/instance/diagram/${
      match.params.id
    }?access_token=${accessToken}&t=${uselessParam}`;
  }

  render() {
    const { forecastData } = this.state;
    return (
      <div
        id="processImg"
        ref={ref => {
          this.processImage = ref;
        }}
      >
        <img
          alt={intl.get('hwfl.common.model.process.graph').d('流程图')}
          id="svg"
          type="image/svg+xml"
          src={this.processImageSrc()}
          // style={{ height: 500 }}
        />
        {/* <embed id="svg" type="image/svg+xml" src={this.processImageSrc()} style={{ height: 500 }} /> */}
        {this.getForecastData(forecastData)}
      </div>
    );
  }
}
