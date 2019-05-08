/**
 * 节点组维护 - 新建节点组 - 编辑配置步骤
 * @date: 2018-9-10
 * @author: 王家程 <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Icon, Button, Row, Col, Select, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import Codemirror from '../Codemirror';
import styles from '../index.less';

const { Option } = Select;
@connect(({ loading, nodeGroup }) => ({
  nodeGroup,
  fetchConfigLoading: loading.effects['nodeGroup/fetchInstanceConfig'],
}))
@formatterCollections({ code: 'hsgp.nodeGroup' })
export default class ConfigInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setCodeStyle: 'default',
    };
  }
  codeMirrorEditor;

  componentDidMount() {
    const {
      nodeGroup: {
        configData: { content = '' },
      },
    } = this.props;
    if (!content) {
      this.fetchInstanceConfig();
    }
  }

  /**
   * @function fetchInstanceConfig - 获取实例配置数据
   * @param {object} params - 参数
   */
  @Bind()
  fetchInstanceConfig(params = {}) {
    const {
      dispatch,
      match: {
        params: { productId, productEnvId },
      },
      nodeGroup: {
        versionData: { productServiceId = [] },
      },
    } = this.props;
    dispatch({
      type: 'nodeGroup/fetchInstanceConfig',
      payload: {
        productId,
        productEnvId,
        productServiceId: productServiceId[1],
        ...params,
      },
    });
  }

  /**
   * @function handleNextStep - 前往下一步，配置预览
   */
  @Bind()
  handleNextStep() {
    const {
      dispatch,
      history,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
      nodeGroup: { configData = {} },
    } = this.props;
    let content = '';
    if (this.codeMirrorEditor) {
      content = this.codeMirrorEditor.getValue();
    }
    dispatch({
      type: 'nodeGroup/updateState',
      payload: { configData: { ...configData, content } },
    });
    history.push(`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/preview`);
  }

  /**
   * @function handlePreStep - 前往上一步，选择版本及应用
   */
  @Bind()
  handlePreStep() {
    const {
      history,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
    } = this.props;
    history.push(`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/version`);
  }

  /**
   * @function setCodeStyle - 设置编辑器的主题
   * @param {string} value - 主题值
   */
  @Bind()
  setCodeStyle(value) {
    this.setState({ setCodeStyle: value });
  }

  /**
   * @function setCodeMirror - 获取CodeMirror实例
   * @param {object} editor - CodeMirror实例
   */
  setCodeMirror(editor) {
    this.codeMirrorEditor = editor;
  }

  /**
   * 编辑代码后更新数据
   * @param {object} editor - 编辑器对象
   * @param {object} data - 数据对象
   * @param {string} value - 编辑后的代码
   */
  @Bind()
  handleCodeChange(editor, data, value) {
    const {
      dispatch,
      nodeGroup: { configData },
    } = this.props;
    dispatch({
      type: 'nodeGroup/updateState',
      payload: { configData: { ...configData, content: value } },
    });
  }

  render() {
    const {
      getCurrentStep,
      nodeGroup: { configData = {} },
      fetchConfigLoading = false,
    } = this.props;
    const { setCodeStyle } = this.state;
    const { content, type = 'yaml' } = configData;
    const codeMirrorProps = {
      value: content,
      options: {
        theme: setCodeStyle,
        mode: type,
      },
      onChange: this.handleCodeChange,
    };
    return (
      <Content>
        <Spin spinning={fetchConfigLoading}>
          <Row type="flex" justify="center">
            <Col span={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: 12, fontWeight: 'bold' }}>
                  <Icon type="appstore-o" className={styles['node-group-icon']} />
                  {intl.get('hsgp.nodeGroup.view.message.title.info').d('配置信息')}
                </div>
                <Select onChange={this.setCodeStyle} style={{ width: 100 }} defaultValue="default">
                  <Option value="default" key="default">
                    Light
                  </Option>
                  <Option value="dracula" key="dracula">
                    Dark
                  </Option>
                </Select>
              </div>
              <Codemirror
                codeMirrorProps={codeMirrorProps}
                fetchCodeMirror={editor => this.setCodeMirror(editor)}
              />
            </Col>
          </Row>
        </Spin>
        <Row type="flex" justify="center" style={{ marginTop: 12 }}>
          <Col>
            <Button type="primary" style={{ marginRight: '8px' }} onClick={this.handleNextStep}>
              {intl.get('hzero.common.button.next').d('下一步')}
            </Button>
            {getCurrentStep() !== 0 && (
              <Button onClick={this.handlePreStep} style={{ marginRight: '8px' }}>
                {intl.get('hzero.common.button.previous').d('上一步')}
              </Button>
            )}
            <Button onClick={this.fetchInstanceConfig}>重置</Button>
          </Col>
        </Row>
      </Content>
    );
  }
}
