import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Spin, InputNumber, Divider, Select, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import SourceLov from '../SourceLov';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading, productEnv }) => ({
  productEnv,
  fetchLovLoading: loading.effects['productEnv/queryEnabledPlatformLov'],
  fetchEnvLovLoading: loading.effects['productEnv/queryCherodonEnvList'],
}))
export default class ProductEnvForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lovModalVisible: false,
      envLovVisible: false,
      sourceLovData: {},
    };
  }

  @Bind()
  handleCancel() {
    const { onCancel = e => e } = this.props;
    this.setState({ sourceLovData: {} });
    onCancel();
  }

  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  @Bind()
  fetchPlatformLov(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'productEnv/queryEnabledPlatformLov',
      payload: { ...params },
    });
  }

  @Bind()
  openLovModal() {
    this.fetchPlatformLov();
    this.setState({ lovModalVisible: true });
  }

  @Bind()
  handleClosePlatformLov() {
    this.setState({ lovModalVisible: false });
  }

  @Bind()
  handlePlatformLovOk(record) {
    const {
      form: { setFieldsValue = e => e },
    } = this.props;
    this.setState({ sourceLovData: record });
    // 设置表单字段
    setFieldsValue({
      deployPlatformId: record.deployPlatformId,
      deployPlatformName: record.platformName,
    });
  }

  @Bind()
  fetchEnvLov(params = {}) {
    const {
      dispatch,
      productEnv: { defaultProduct = '' },
      form,
    } = this.props;
    const deployPlatformId = form.getFieldValue('deployPlatformId');
    dispatch({
      type: 'productEnv/queryCherodonEnvList',
      payload: { productId: defaultProduct, deployPlatformId, ...params },
    });
  }

  @Bind()
  openBindEnvLov() {
    this.fetchEnvLov();
    this.setState({ envLovVisible: true });
  }

  @Bind()
  handleCloseEnvLov() {
    this.setState({ envLovVisible: false });
  }

  @Bind()
  handleEnvLovOk(record) {
    const {
      form: { setFieldsValue = e => e },
      form,
    } = this.props;
    // 注册 部署平台id
    form.registerField('devopsEnvId');
    form.registerField('devopsEnvCode');
    form.registerField('devopsEnvName');
    // 注册表单字段
    setFieldsValue({
      devopsEnvId: record.devopsEnvId,
      devopsEnvCode: record.devopsEnvCode,
      devopsEnvName: record.devopsEnvName,
      activeFlag: record.activeFlag,
      connectFlag: record.connectFlag,
    });
    this.handleCloseEnvLov();
  }

  render() {
    const {
      form,
      initData,
      title,
      modalVisible,
      loading,
      initLoading = false,
      fetchLovLoading = false,
      fetchEnvLovLoading = false,
      productEnv: { enabledPlatformList = {}, cherodonEnvList = [], grantTypeList = [] },
    } = this.props;
    const { lovModalVisible, envLovVisible, sourceLovData } = this.state;
    const { getFieldDecorator } = form;
    const {
      envCode,
      envName,
      deployPlatformName,
      description,
      orderSeq,
      sourceKey,
      deployPlatformId,
      config = {},
    } = initData;
    const {
      gatewayPath,
      tenantQueryPath,
      userQueryPath,
      urlQueryPath,
      devopsEnvCode,
      activeFlag,
      connectFlag,
      clientId,
      grantType,
      clientSecret,
      username,
      password,
    } = config;
    const lovModalProps = {
      rowKey: 'deployPlatformId',
      visible: lovModalVisible,
      onOk: this.handlePlatformLovOk,
      onCancel: this.handleClosePlatformLov,
      onSearch: this.fetchPlatformLov,
      dataSource: enabledPlatformList,
      loading: fetchLovLoading,
      columns: [
        {
          title: intl.get('hsgp.deployPlatform.model.deployPlatform.platformCode').d('平台编码'),
          dataIndex: 'platformCode',
        },
        {
          title: intl.get('hsgp.deployPlatform.model.deployPlatform.platformName').d('平台名称'),
          width: 250,
          dataIndex: 'platformName',
        },
      ],
    };
    const bindLovProps = {
      rowKey: 'devopsEnvId',
      visible: envLovVisible,
      onOk: this.handleEnvLovOk,
      onCancel: this.handleCloseEnvLov,
      dataSource: { content: cherodonEnvList },
      loading: fetchEnvLovLoading,
      columns: [
        {
          title: intl.get('hsgp.productEnv.model.productEnv.envCode').d('环境编码'),
          dataIndex: 'devopsEnvCode',
        },
        {
          title: intl.get('hsgp.productEnv.model.productEnv.envName').d('环境名称'),
          width: 200,
          dataIndex: 'devopsEnvName',
        },
      ],
      pagination: false,
    };
    // 注册 deployPlatformId 字段
    form.getFieldDecorator('deployPlatformId', { initialValue: deployPlatformId });
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={this.handleCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={initLoading}>
          <Form>
            <Divider orientation="left">
              {intl.get('hsgp.common.view.message.editor.envInfo').d('环境信息')}
            </Divider>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.productEnv.model.productEnv.envCode').d('环境编码')}
            >
              {getFieldDecorator('envCode', {
                initialValue: envCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.productEnv.model.productEnv.envCode').d('环境编码'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                  {
                    pattern: /^[A-Za-z0-9][A-Za-z0-9-_.]*$/,
                    message: intl.get('hsgp.common.validation.code').d('编码格式不正确'),
                  },
                ],
              })(<Input disabled={!!envCode} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.productEnv.model.productEnv.envName').d('环境名称')}
            >
              {getFieldDecorator('envName', {
                initialValue: envName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.productEnv.model.productEnv.envName').d('环境名称'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.description').d('描述')}
            >
              {getFieldDecorator('description', {
                initialValue: description,
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', {
                      max: 240,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.productEnv.model.productEnv.orderSeq').d('序号')}
            >
              {getFieldDecorator('orderSeq', {
                initialValue: orderSeq,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.productEnv.model.productEnv.orderSeq').d('序号'),
                    }),
                  },
                ],
              })(<InputNumber min={0} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.productEnv.model.productEnv.deployPlatformName').d('部署平台')}
            >
              {getFieldDecorator('deployPlatformName', {
                initialValue: deployPlatformName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.productEnv.model.productEnv.deployPlatformName')
                        .d('部署平台'),
                    }),
                  },
                ],
              })(<SourceLov onClick={this.openLovModal} lovModalProps={lovModalProps} />)}
            </FormItem>
            {(sourceKey === 'choerodon' || sourceLovData.sourceKey === 'choerodon') && (
              <React.Fragment>
                <Divider orientation="left">
                  {intl.get('hsgp.common.view.message.editor.bindInfo').d('绑定信息')}
                </Divider>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.productEnv.model.productEnv.devopsEnvCode').d('绑定环境')}
                >
                  {getFieldDecorator('devopsEnvCode', {
                    initialValue: devopsEnvCode,
                  })(<SourceLov onClick={this.openBindEnvLov} lovModalProps={bindLovProps} />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.productEnv.model.productEnv.activeFlag').d('环境状态')}
                >
                  {getFieldDecorator('activeFlag', {
                    initialValue: activeFlag,
                  })(
                    <Tag color={form.getFieldValue('activeFlag') ? 'green' : 'red'}>
                      {form.getFieldValue('activeFlag')
                        ? intl.get('hsgp.productEnv.view.message.editor.action').d('运行中')
                        : intl.get('hsgp.productEnv.view.message.editor.stop').d('已停用')}
                    </Tag>
                  )}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.productEnv.model.productEnv.connectFlag').d('连接状态')}
                >
                  {getFieldDecorator('connectFlag', {
                    initialValue: connectFlag,
                  })(
                    <Tag color={form.getFieldValue('connectFlag') ? 'green' : 'red'}>
                      {form.getFieldValue('connectFlag')
                        ? intl.get('hsgp.productEnv.view.message.editor.link').d('已连接')
                        : intl.get('hsgp.productEnv.view.message.editor.unLink').d('未连接')}
                    </Tag>
                  )}
                </FormItem>
                <Divider orientation="left">
                  {intl.get('hsgp.common.view.message.editor.systemGrant').d('系统授权')}
                </Divider>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.common.model.common.grantType').d('授权类型')}
                >
                  {getFieldDecorator('grantType', {
                    initialValue: grantType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsgp.common.model.common.grantType').d('授权类型'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }}>
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
                  {...formLayout}
                  label={intl.get('hsgp.common.model.common.clientId').d('客户端ID')}
                >
                  {getFieldDecorator('clientId', {
                    initialValue: clientId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsgp.common.model.common.clientId').d('客户端ID'),
                        }),
                      },
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.common.model.common.clientSecret').d('客户端密钥')}
                >
                  {getFieldDecorator('clientSecret', {
                    initialValue: clientSecret,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsgp.common.model.common.clientSecret').d('客户端密钥'),
                        }),
                      },
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(<Input type="password" inputChinese={false} />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.common.model.common.username').d('用户名')}
                >
                  {getFieldDecorator('username', {
                    initialValue: username,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsgp.common.model.common.username').d('用户名'),
                        }),
                      },
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.common.model.common.password').d('密码')}
                >
                  {getFieldDecorator('password', {
                    initialValue: password,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsgp.common.model.common.password').d('密码'),
                        }),
                      },
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(<Input type="password" />)}
                </FormItem>
                <Divider orientation="left">
                  {intl.get('hsgp.common.view.message.editor.accessInfo').d('访问地址')}
                </Divider>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.productEnv.model.productEnv.gatewayPath').d('网关地址')}
                >
                  {getFieldDecorator('gatewayPath', {
                    initialValue: gatewayPath,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('hsgp.productEnv.model.productEnv.tenantQueryPath')
                    .d('租户查询地址')}
                >
                  {getFieldDecorator('tenantQueryPath', {
                    initialValue: tenantQueryPath,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('hsgp.productEnv.model.productEnv.userQueryPath')
                    .d('用户查询地址')}
                >
                  {getFieldDecorator('userQueryPath', {
                    initialValue: userQueryPath,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsgp.productEnv.model.productEnv.urlQueryPath').d('URL查询地址')}
                >
                  {getFieldDecorator('urlQueryPath', {
                    initialValue: urlQueryPath,
                  })(<Input />)}
                </FormItem>
              </React.Fragment>
            )}
          </Form>
        </Spin>
      </Modal>
    );
  }
}
