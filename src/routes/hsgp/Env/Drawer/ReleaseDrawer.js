/*
 * 环境管理-新建环境
 * @date: 2018/10/7
 * @author: 周邓 <deng.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { trim } from 'lodash';
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  Select,
  Button,
  Table,
  Popconfirm,
} from 'hzero-ui';
import Lov from 'components/Lov';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import URIDrawer from './URIDrawer';
import RequestDrawer from './RequestDrawer';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@connect(({ loading, env }) => ({
  create: loading.effects['env/createEnv'],
  update: loading.effects['env/updateEnv'],
  env,
}))
export default class ReleaseDrawer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      URIModalVisible: false,
      RequestModalVisible: false,
      isUpdate: false, // 是否为编辑状态
    };
  }

  /**
   * 打开 新建URI参数modal
   * @function createURIParams
   */
  @Bind()
  createURIParams() {
    this.setState({
      URIModalVisible: true,
    });
  }

  /**
   * 关闭 新建URI参数modal
   * @function handleCancelURI
   */
  @Bind()
  handleCancelURI() {
    const { dispatch } = this.props;
    this.setState({
      URIModalVisible: false,
      isUpdate: false,
    });
    dispatch({
      type: 'env/updateState',
      payload: {
        currentURIParam: {}, // 清空当前编辑的URI参数的信息
      },
    });
  }

  /**
   * 打开 新建Request参数modal
   * @function createRequestParams
   */
  @Bind()
  createRequestParams() {
    this.setState({
      RequestModalVisible: true,
    });
  }

  /**
   * 关闭 新建Request参数modal
   * @function handleCancelRequest
   */
  @Bind()
  handleCancelRequest() {
    const { dispatch } = this.props;
    this.setState({
      RequestModalVisible: false,
      isUpdate: false,
    });
    dispatch({
      type: 'env/updateState',
      payload: {
        currentRequestParam: {},
      },
    });
  }

  /**
   * 编辑URI请求参数
   * @function updateURI
   * @param {object} record -当前记录数据
   * @param {number} index -当前记录的位置
   * @param {string} record.paramsName -参数名称
   * @param {string} record.paramsValue -参数值
   */
  @Bind()
  updateURI(record, index) {
    const { dispatch } = this.props;
    this.setState({
      URIModalVisible: true,
      isUpdate: true,
    });
    // 保存当前URI参数数据
    dispatch({
      type: 'env/updateState',
      payload: {
        currentURIParam: {
          ...record,
          index,
        },
      },
    });
  }

  /**
   * 删除URI请求参数
   * @function deleteURI
   * @param {object} record -当前记录数据
   * @param {string} record.paramsName -参数名称
   * @param {string} record.paramsValue -参数值
   */
  @Bind()
  deleteURI(record) {
    // URIParams为对象数组
    const {
      env: { URIParams },
      dispatch,
    } = this.props;
    const newURIParams = [];
    URIParams.forEach(element => {
      if (element.paramsName !== record.paramsName || element.paramsValue !== record.paramsValue) {
        newURIParams.push(element);
      }
    });
    dispatch({
      type: 'env/updateState',
      payload: {
        URIParams: [...newURIParams],
      },
    });
  }

  /**
   * 编辑Request请求参数
   * @function updateRequest
   * @param {object} record -当前记录数据
   * @param {number} index -当前记录的位置
   * @param {string} record.paramsName -参数名称
   * @param {string} record.paramsValue -参数值
   */
  @Bind()
  updateRequest(record, index) {
    const { dispatch } = this.props;
    this.setState({
      RequestModalVisible: true,
      isUpdate: true,
    });
    // 保存当前Request参数数据
    dispatch({
      type: 'env/updateState',
      payload: {
        currentRequestParam: {
          ...record,
          index,
        },
      },
    });
  }

  /**
   * 删除Request请求参数
   * @function deleteRequest
   * @param {object} record -当前记录数据
   * @param {number} index -当前记录的位置
   * @param {string} record.paramsName -参数名称
   * @param {string} record.paramsValue -参数值
   */
  @Bind()
  deleteRequest(record) {
    const {
      env: { requestParams },
      dispatch,
    } = this.props;
    const newRequestParams = [];
    requestParams.forEach(element => {
      if (element.paramsName !== record.paramsName || element.paramsValue !== record.paramsValue) {
        newRequestParams.push(element);
      }
    });
    dispatch({
      type: 'env/updateState',
      payload: {
        requestParams: [...newRequestParams],
      },
    });
  }

  /**
   * @function handleSaveDevopsEnvName - 保存运维id对应名称
   * @param {object} record -当前选中项的数据
   * @param {string} record.devopsEnvName -环境名称
   */
  @Bind()
  handleSaveDevopsEnvName(_, record) {
    const { form } = this.props;
    form.setFieldsValue({ devopsEnvName: record.devopsEnvName });
  }

  @Bind()
  saveEnvData() {
    const {
      saveEvn,
      form,
      env: { envId },
      dispatch,
      env: { URIParams, requestParams },
      env: { basicList },
    } = this.props;
    form.validateFields(err => {
      const envCode = trim(form.getFieldValue('envCode')); // 对编码字段做处理，去掉前后空格
      const BasicValue = form.getFieldsValue([
        'envName',
        'description',
        'orderSeq',
        'devopsEnvId',
        'devopsEnvName',
      ]);
      const configData = form.getFieldsValue([
        'CLIENT_ID',
        'CLIENT_SECRET',
        'GRANT_TYPE',
        'OAUTH_USERNAME',
        'OAUTH_PASSWORD',
        'TENANT_QUERY_API',
        'USER_QUERY_API',
        'URL_QUERY_API',
        'CONTEXT_PATH',
        'COMMON_REQUEST_PARAMS',
        'COMMON_URI_PARAMS',
      ]);

      const configValue = []; // 存储处理后的配置信息
      const newRequestparams = this.transfromParams(requestParams);
      const newURIparams = this.transfromParams(URIParams);

      Object.keys(configData).forEach(key => {
        if (key === 'COMMON_REQUEST_PARAMS') {
          configValue.push({ configCode: key, configValue: `{${newRequestparams}}` });
        } else if (key === 'COMMON_URI_PARAMS') {
          configValue.push({ configCode: key, configValue: `{${newURIparams}}` });
        } else {
          configValue.push({ configCode: key, configValue: configData[key] });
        }
      });
      if (!err) {
        dispatch({
          type: `env/${envId === null ? 'createEnv' : 'updateEnv'}`,
          payload: {
            ...basicList,
            envCode,
            ...BasicValue,
            envConfigList: [...configValue],
          },
        }).then(res => {
          if (res) {
            dispatch({
              type: 'env/updateState',
              payload: {
                basicList: {},
                configList: {},
                envId: null,
                URIParams: [],
                requestParams: [],
              },
            });
            saveEvn();
            notification.success();
          }
        });
      }
    });
  }

  /**
   * @function transfromParams - 将对象数组转换为后端要求的字符串格式
   * @param {array} param - 需要转换的数组
   */
  transfromParams(param) {
    let newParam = '';
    param.forEach((element, index) => {
      if (index !== param.length - 1) {
        newParam += `"${element.paramsName}":"${element.paramsValue}",`;
      } else {
        newParam += `"${element.paramsName}":"${element.paramsValue}"`;
      }
    });
    return newParam;
  }

  render() {
    const {
      modalVisible,
      onCancel,
      env: {
        basicList = {},
        configList = {},
        grantTypeList = [],
        envId,
        URIParams = [],
        requestParams = [],
      },
      isEdit,
      form,
      create,
      update,
    } = this.props;
    const { URIModalVisible, RequestModalVisible, isUpdate } = this.state;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    };
    const URIControllParams = {
      URIModalVisible,
      isUpdate,
      handleCancel: this.handleCancelURI,
    };
    const RqueestControllParams = {
      RequestModalVisible,
      isUpdate,
      handleCancel: this.handleCancelRequest,
    };
    const URIColumns = [
      {
        title: intl.get('hsgp.env.model.env.paramsName').d('参数名称'),
        dataIndex: 'paramsName',
      },
      {
        title: intl.get('hsgp.env.model.env.paramsValue').d('参数值'),
        dataIndex: 'paramsValue',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        dataIndex: 'edit',
        render: (text, record, index) => {
          return (
            <span className="action-link">
              <a onClick={() => this.updateURI(record, index)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => {
                  this.deleteURI(record);
                }}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    const RequestColumns = [
      {
        title: intl.get('hsgp.env.model.env.paramsName').d('参数名称'),
        dataIndex: 'paramsName',
      },
      {
        title: intl.get('hsgp.env.model.env.paramsValue').d('参数值'),
        dataIndex: 'paramsValue',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        dataIndex: 'edit',
        render: (text, record, index) => {
          return (
            <span className="action-link">
              <a onClick={() => this.updateRequest(record, index)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => {
                  this.deleteRequest(record);
                }}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={`${
          envId === null
            ? intl.get('hsgp.env.view.message.createEnv').d('新建环境')
            : intl.get('hsgp.env.view.message.updateEnv').d('编辑环境')
        }`}
        visible={modalVisible}
        width="1000px"
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={onCancel}
        onOk={this.saveEnvData}
        confirmLoading={envId === null ? create : update}
      >
        <Form>
          <Row type="flex" justify="center">
            <Col span={12}>
              <FormItem
                label={intl.get('hsgp.env.model.env.envCode').d('环境编码')}
                {...formLayout}
              >
                {getFieldDecorator('envCode', {
                  initialValue: basicList.envCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hsgp.env.view.message.inputEnvCode').d('请输入环境编码'),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input style={{ width: '100%' }} disabled={isEdit} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.model.env.envName').d('环境名称')}
                {...formLayout}
              >
                {getFieldDecorator('envName', {
                  initialValue: basicList.envName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hsgp.env.view.message.inputEnvName').d('请输入环境名称'),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(<Input style={{ width: '100%' }} disabled={isEdit} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.model.env.description').d('描述')}
                {...formLayout}
              >
                {getFieldDecorator('description', {
                  initialValue: basicList.description,
                  rules: [
                    {
                      max: 80,
                      message: intl.get('hzero.common.validation.max', {
                        max: 80,
                      }),
                    },
                  ],
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem label={intl.get('hsgp.env.model.env.orderSeq').d('序号')} {...formLayout}>
                {getFieldDecorator('orderSeq', {
                  initialValue: basicList.orderSeq,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hsgp.env.view.message.inputOrderSeq').d('请输入序号'),
                    },
                    {
                      type: 'number',
                      message: intl
                        .get('hsgp.env.view.message.requestNumber')
                        .d('格式应为数字类型！'),
                    },
                  ],
                })(<InputNumber style={{ width: '100%' }} min={1} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.devopsEnvId').d('绑定环境')}
                {...formLayout}
              >
                {getFieldDecorator('devopsEnvId', {
                  initialValue: basicList.devopsEnvId,
                  rules: [
                    {
                      type: 'number',
                    },
                  ],
                })(
                  <Lov
                    disabled={isEdit}
                    code="HSGP.ENV.DEVOP"
                    style={{ width: '100%' }}
                    textValue={basicList.devopsEnvName}
                    onChange={this.handleSaveDevopsEnvName}
                  />
                )}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.CLIENT_ID').d('客户端ID')}
                {...formLayout}
              >
                {getFieldDecorator('CLIENT_ID', {
                  initialValue: configList.CLIENT_ID,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hsgp.env.view.message.inputCLIENT_ID').d('请输入客户端ID'),
                    },
                  ],
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.CLIENT_SECRET').d('客户端密钥')}
                {...formLayout}
              >
                {getFieldDecorator('CLIENT_SECRET', {
                  initialValue: configList.CLIENT_SECRET,
                })(<Input style={{ width: '100%' }} type="password" />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.commonRequestParams').d('通用请求参数')}
                {...formLayout}
              >
                <Button type="primary" onClick={this.createRequestParams}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl.get('hsgp.env.view.message.GRANT_TYPE').d('授权类型')}
                {...formLayout}
              >
                {getFieldDecorator('GRANT_TYPE', {
                  initialValue: configList.GRANT_TYPE,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get('hsgp.env.view.message.inputGRANT_TYPE')
                        .d('请输入授权类型'),
                    },
                  ],
                })(
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    defaultValue={configList.GRANT_TYPE}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {grantTypeList.map(item => {
                      return (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.OAUTH_USERNAME').d('认证用户名')}
                {...formLayout}
              >
                {getFieldDecorator('OAUTH_USERNAME', {
                  initialValue: configList.OAUTH_USERNAME,
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.OAUTH_PASSWORD').d('认证密码')}
                {...formLayout}
              >
                {getFieldDecorator('OAUTH_PASSWORD', {
                  initialValue: configList.OAUTH_PASSWORD,
                })(<Input style={{ width: '100%' }} type="password" />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.CONTEXT_PATH').d('网关地址')}
                {...formLayout}
              >
                {getFieldDecorator('CONTEXT_PATH', {
                  initialValue: configList.CONTEXT_PATH,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hsgp.env.view.message.requestEnv').d('请输入上下文环境'),
                    },
                  ],
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.TENANT_QUERY_API').d('租户查询地址')}
                {...formLayout}
              >
                {getFieldDecorator('TENANT_QUERY_API', {
                  initialValue: configList.TENANT_QUERY_API,
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.USER_QUERY_API').d('用户查询地址')}
                {...formLayout}
              >
                {getFieldDecorator('USER_QUERY_API', {
                  initialValue: configList.USER_QUERY_API,
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.URL_QUERY_API').d('URL查询地址')}
                {...formLayout}
              >
                {getFieldDecorator('URL_QUERY_API', {
                  initialValue: configList.URL_QUERY_API,
                })(<Input style={{ width: '100%' }} />)}
              </FormItem>
              <FormItem
                label={intl.get('hsgp.env.view.message.commonURIParams').d('通用URI参数')}
                {...formLayout}
              >
                <Button type="primary" onClick={this.createURIParams}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="start">
            <Col span={10}>
              <Table
                bordered
                rowKey="paramsName"
                dataSource={requestParams}
                columns={RequestColumns}
                scroll={{ x: tableScrollWidth(RequestColumns) }}
                pagination={false}
              />
              <FormItem>
                {getFieldDecorator('devopsEnvName', {
                  initialValue: basicList.devopsEnvName,
                })(<div />)}
              </FormItem>
            </Col>
            <Col span={10} offset={2}>
              <Table
                bordered
                rowKey="paramsName"
                dataSource={URIParams}
                columns={URIColumns}
                scroll={{ x: tableScrollWidth(URIColumns) }}
                pagination={false}
              />
            </Col>
          </Row>
        </Form>
        <URIDrawer {...URIControllParams} />
        <RequestDrawer {...RqueestControllParams} />
      </Modal>
    );
  }
}
