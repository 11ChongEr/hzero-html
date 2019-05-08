/**
 * ServiceConfig - 服务配置
 * @date: 2018-12-09
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Cascader, Select, Row, Col, Modal, Form, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import 'codemirror/mode/yaml/yaml'; // yaml 代码格式

import { Content, Header } from 'components/Page';
import CodeMirror from 'components/CodeMirror';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
const { Option } = Select;

@formatterCollections({ code: ['hsgp.serviceConfig'] })
@Form.create({ fieldNameProp: null })
@connect(({ loading, serviceConfig }) => ({
  loading,
  serviceConfig,
  saveLoading: loading.effects['serviceConfig/saveServiceConfig'],
  fetchLoading: loading.effects['serviceConfig/queryServiceConfigYaml'],
  refreshLoading: loading.effects['serviceConfig/refreshServiceConfig'],
}))
export default class ServiceConfig extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setCodeStyle: 'default',
      controlEditFlag: false,
    };
  }

  codeMirrorEditor;

  componentDidMount() {
    const { dispatch } = this.props;
    // 查询产品及组合
    dispatch({
      type: 'serviceConfig/queryProductWithVersion',
    }).then(res => {
      if (res) {
        Promise.all([
          dispatch({
            type: 'serviceConfig/queryProductWithEnv',
            payload: { productId: res[0] ? res[0].value : '' },
          }),
          dispatch({
            type: 'serviceConfig/queryServiceAndVersion',
            payload: {
              productId: res[0] ? res[0].value : '',
              productVersionId: res[0] ? res[0].children[0].value : '',
            },
          }),
        ])
          .then(() => {
            this.fetchYaml();
          })
          .catch(() => {
            notification.warning();
            this.setState({ controlEditFlag: true });
          });
      }
    });
  }

  fetchYaml(params = {}) {
    const {
      dispatch,
      serviceConfig: {
        defaultProductVersion: product = [],
        defaultEnv: env = '',
        defaultServiceVersion: service = [],
      },
    } = this.props;
    dispatch({
      type: 'serviceConfig/queryServiceConfigYaml',
      payload: {
        productId: product[0],
        serviceId: service[0],
        productServiceId: service[1],
        productEnvId: env,
        ...params,
      },
    }).then(res => {
      if (!res) {
        dispatch({
          type: 'serviceConfig/updateState',
          payload: {
            configYamlContent: {},
          },
        });
      }
    });
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
  @Bind()
  setCodeMirror(editor) {
    this.codeMirrorEditor = editor;
  }

  /**
   * 切换产品
   * @param {array} value - 切换的产品及版本
   */
  @Bind()
  handleChangeProduct(value) {
    const { dispatch } = this.props;
    // 更新当前的产品及版本
    dispatch({
      type: 'serviceConfig/updateState',
      payload: { defaultProductVersion: value },
    });
    Promise.all([
      // 更新当前环境
      dispatch({
        type: 'serviceConfig/queryProductWithEnv',
        payload: { productId: value[0] },
      }),
      // 更新当前服务及版本
      dispatch({
        type: 'serviceConfig/queryServiceAndVersion',
        payload: {
          productId: value[0],
          productVersionId: value[1],
        },
      }),
    ])
      .then(() => {
        this.fetchYaml();
      })
      .catch(() => {
        notification.warning();
      });
  }

  @Bind()
  handleChangeEnv(value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceConfig/updateState',
      payload: { defaultEnv: value },
    });
    this.fetchYaml({ productEnvId: value });
  }

  @Bind()
  handleChangeService(value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceConfig/updateState',
      payload: { defaultServiceVersion: value },
    });
    this.fetchYaml({
      serviceId: value[0],
      productServiceId: value[1],
    });
  }

  @Bind()
  handleRefresh() {
    const {
      dispatch,
      serviceConfig: {
        defaultProductVersion: product = [],
        defaultEnv = '',
        defaultServiceVersion: service = [],
      },
    } = this.props;
    Modal.confirm({
      title: `${intl.get('hsgp.common.view.message.confirm.refresh').d('确定要刷新')}?`,
      content: `${intl
        .get('hsgp.serviceConfig.view.message.refresh.description')
        .d('将动态刷新服务配置')}！`,
      onOk() {
        dispatch({
          type: 'serviceConfig/refreshServiceConfig',
          payload: {
            productId: product[0],
            productEnvId: defaultEnv,
            productServiceId: service[1],
          },
        }).then(res => {
          if (res) {
            notification.success();
          }
        });
      },
    });
  }

  @Bind()
  handleSetDefault() {
    const that = this;
    const {
      dispatch,
      serviceConfig: {
        productWithVersionList: productList = [],
        defaultProductVersion: product = [],
        envList = [],
        defaultEnv: env = '',
        defaultServiceVersion: service = [],
        configYamlContent = {},
      },
    } = this.props;
    const productName = productList.filter(item => item.value === product[0])[0].meaning;
    const envName = envList.filter(item => item.value === env)[0].meaning;
    Modal.confirm({
      title: `${intl.get('hsgp.serviceConfig.view.message.confirm.default', {
        productName,
        envName,
      })}？`,
      content: `${intl
        .get('hsgp.serviceConfig.view.message.default.description')
        .d('在没有可用配置时将使用该默认配置')}。`,
      onOk() {
        dispatch({
          type: 'serviceConfig/setDefaultConfig',
          payload: {
            ...configYamlContent,
            productId: product[0],
            serviceId: service[0],
            productServiceId: service[1],
            productEnvId: env,
          },
        }).then(res => {
          if (res) {
            notification.success();
            that.fetchYaml();
          }
        });
      },
    });
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
      serviceConfig: { configYamlContent = {} },
    } = this.props;
    dispatch({
      type: 'serviceConfig/updateState',
      payload: { configYamlContent: { ...configYamlContent, configYaml: value } },
    });
  }

  @Bind()
  handleSaveConfig() {
    const {
      form,
      dispatch,
      serviceConfig: {
        defaultProductVersion: product = [],
        defaultEnv: env = '',
        defaultServiceVersion: service = [],
        configYamlContent = {},
      },
    } = this.props;
    const content = this.codeMirrorEditor.getValue();
    form.setFieldsValue({ configYaml: content });
    form.validateFieldsAndScroll(err => {
      if (!err) {
        dispatch({
          type: 'serviceConfig/saveServiceConfig',
          payload: {
            ...configYamlContent,
            productId: product[0],
            serviceId: service[0],
            productServiceId: service[1],
            productEnvId: env,
            configYaml: content,
          },
        }).then(res => {
          if (res) {
            notification.success();
            dispatch({
              type: 'serviceConfig/updateState',
              payload: { configYamlContent: res },
            });
          }
        });
      }
    });
  }

  render() {
    const {
      form,
      saveLoading = false,
      fetchLoading = false,
      refreshLoading = false,
      serviceConfig: {
        defaultProductVersion = [],
        productWithVersionList = [],
        defaultServiceVersion = [],
        serviceWithVersionList = [],
        defaultEnv = '',
        envList = [],
        configYamlContent,
      },
    } = this.props;
    const { setCodeStyle, controlEditFlag } = this.state;
    const { getFieldDecorator } = form;
    const { configYaml } = configYamlContent;
    const codeMirrorProps = {
      value: configYaml,
      options: {
        theme: setCodeStyle,
        mode: 'yaml',
      },
      onChange: this.handleCodeChange,
    };
    const hasListFlag =
      productWithVersionList.length === 0 ||
      envList.length === 0 ||
      serviceWithVersionList.length === 0;
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.serviceConfig.view.message.title').d('服务配置')}>
          <Button
            type="primary"
            icon="save"
            disabled={hasListFlag || controlEditFlag || refreshLoading}
            loading={saveLoading}
            onClick={this.handleSaveConfig}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="sync"
            loading={refreshLoading}
            disabled={hasListFlag || controlEditFlag}
            onClick={this.handleRefresh}
          >
            {intl.get('hsgp.serviceConfig.view.button.refresh').d('刷新配置')}
          </Button>
          <Button
            icon="setting"
            disabled={hasListFlag || controlEditFlag || refreshLoading}
            onClick={this.handleSetDefault}
          >
            {intl.get('hsgp.serviceConfig.view.button.default').d('设为默认')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchLoading}>
            <Row>
              <Col span={6}>
                <span>
                  {`${intl.get('hsgp.common.view.title.product').d('产品')}/${intl
                    .get('hsgp.common.view.title.version')
                    .d('版本')}：`}
                  ：
                </span>
                <Cascader
                  placeholder=""
                  style={{ width: 200 }}
                  disabled={refreshLoading}
                  expandTrigger="hover"
                  allowClear={false}
                  value={defaultProductVersion}
                  options={productWithVersionList}
                  fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                  onChange={this.handleChangeProduct}
                />
              </Col>
              <Col span={6}>
                <span>{`${intl.get('hsgp.common.view.title.env').d('环境')}：`}</span>
                <Select
                  style={{ width: 200 }}
                  disabled={refreshLoading}
                  value={defaultEnv}
                  onChange={this.handleChangeEnv}
                >
                  {envList.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
              <Col span={6}>
                <span>
                  {`${intl.get('hsgp.common.view.title.service').d('服务')}/${intl
                    .get('hsgp.common.view.title.version')
                    .d('版本')}：`}
                  ：
                </span>
                <Cascader
                  placeholder=""
                  style={{ width: 220 }}
                  disabled={refreshLoading}
                  expandTrigger="hover"
                  allowClear={false}
                  value={defaultServiceVersion}
                  options={serviceWithVersionList}
                  fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                  onChange={this.handleChangeService}
                />
              </Col>
            </Row>
            <Row style={{ marginTop: 12 }}>
              <Col span={17}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: 12, fontWeight: 'bold' }}>
                    {intl.get('hsgp.serviceConfig.view.editor.configInfo').d('配置信息')}
                  </div>
                  <Select
                    onChange={this.setCodeStyle.bind(this)}
                    style={{ width: 100 }}
                    defaultValue="default"
                  >
                    <Option value="default" key="default">
                      Light
                    </Option>
                    <Option value="dracula" key="dracula">
                      Dark
                    </Option>
                  </Select>
                </div>
                <Form>
                  <FormItem>
                    {getFieldDecorator('configYaml', {
                      initialValue: configYaml,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hsgp.serviceConfig.view.editor.configInfo')
                              .d('配置信息'),
                          }),
                        },
                      ],
                    })(
                      <CodeMirror
                        codeMirrorProps={codeMirrorProps}
                        fetchCodeMirror={editor => this.setCodeMirror(editor)}
                      />
                    )}
                  </FormItem>
                </Form>
              </Col>
            </Row>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
