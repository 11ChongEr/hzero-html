import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select, Spin, Divider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Upload from 'components/Upload/UploadButton';
import intl from 'utils/intl';

import SourceLov from '../../SourceLov';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading, serviceCollect }) => ({
  serviceCollect,
  fetchAppLoading: loading.effects['serviceCollect/fetchAppLov'],
  fetchSourceLovLoading: loading.effects['serviceCollect/fetchSourceLov'],
}))
export default class serviceCollectForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appModalVisible: false,
      lovModalVisible: false,
      sourceLovData: {},
    };
  }

  /**
   * 关闭编辑的模态框
   */
  @Bind()
  handleCancel() {
    const { onCancel = e => e } = this.props;
    onCancel();
  }

  /**
   * 更新服务数据
   */
  @Bind()
  handleSaveService() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  /**
   * 请求应用来源lov数据
   * @param {object} params - 请求参数
   */
  @Bind()
  fetchSourceLov(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'serviceCollect/fetchSourceLov',
      payload: params,
    });
  }

  /**
   * 显示应用来源lov
   */
  @Bind()
  openAppSourceLov() {
    this.fetchSourceLov();
    this.setState({ lovModalVisible: true });
  }

  /**
   * 关闭应用来源lov
   */
  @Bind()
  handleCloseSourceLov() {
    this.setState({ lovModalVisible: false });
  }

  @Bind()
  handleAppSourceLovOk(record) {
    const {
      form: { setFieldsValue = e => e },
    } = this.props;
    this.setState({ sourceLovData: record });
    setFieldsValue({
      sourceKey: record.sourceKey,
      appSourceCode: record.appSourceCode,
      appSourceId: record.appSourceId,
      appSourceName: record.appSourceName,
    });
  }

  /**
   * @function onUploadSuccess - 图片上传成功的回调函数
   * @param {object} file - 上传的文件对象
   */
  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.registerField('serviceLogo');
      form.setFieldsValue({
        serviceLogo: file.response,
      });
    }
  }

  /**
   * 显示关联应用lov
   */
  @Bind()
  handleAppLovShow() {
    this.fetchAppLovList();
  }

  /**
   * 关闭关联应用lov
   */
  @Bind()
  handleAppLovHide() {
    this.setState({ appModalVisible: false });
  }

  /**
   * 选择关联的应用
   * @param {object} record - 选择的行数据
   */
  @Bind()
  handleAppLovOk(record) {
    const { form } = this.props;
    const sourceKey = form.getFieldValue('sourceKey');
    if (sourceKey === 'choerodon') {
      form.setFieldsValue({
        appId: record.appId,
        appName: record.appName,
        appCode: record.appCode,
        repoUrl: record.repoUrl,
      });
    }
    this.handleAppLovHide();
  }

  /**
   * 获取关联应用 lov 数据
   */
  @Bind()
  fetchAppLovList(params = {}) {
    const { dispatch } = this.props;
    const { sourceLovData } = this.state;
    dispatch({
      type: 'serviceCollect/fetchAppLov',
      payload: { appSourceId: sourceLovData.appSourceId, ...params },
    }).then(res => {
      if (res) {
        this.setState({ appModalVisible: true });
      }
    });
  }

  /**
   * 根据选择的应用来源，渲染对应的表单字段
   */
  @Bind()
  handleAppSourceRender() {
    const {
      fetchAppLoading,
      form,
      initData = {},
      serviceCollect: { appList = {} },
    } = this.props;
    const { appModalVisible } = this.state;
    const { config = {} } = initData;
    const { repoUrl, version, appCode, appName } = config;
    const { getFieldDecorator } = form;
    const value = form.getFieldValue('sourceKey');
    // 关联应用lov props
    const appLovProps = {
      rowKey: 'appId',
      visible: appModalVisible,
      dataSource: appList,
      loading: fetchAppLoading,
      onOk: this.handleAppLovOk,
      onCancel: this.handleAppLovHide,
      onSearch: this.fetchAppLovList,
      filterItems: [
        {
          label: `${intl.get('hsgp.serviceCollect.model.serviceCollect.appCode').d('应用编码')}/
          ${intl.get('hsgp.serviceCollect.model.serviceCollect.appName').d('应用名称')}`,
          code: 'condition',
        },
      ],
      columns: [
        {
          title: intl.get('hsgp.serviceCollect.model.serviceCollect.appCode').d('应用编码'),
          width: 150,
          dataIndex: 'appCode',
        },
        {
          title: intl.get('hsgp.serviceCollect.model.serviceCollect.appName').d('应用名称'),
          dataIndex: 'appName',
        },
      ],
    };
    switch (value) {
      case 'choerodon':
        return (
          <React.Fragment>
            <Divider orientation="left">
              {intl.get('hsgp.common.view.message.eidtorappConfig').d('应用配置')}
            </Divider>
            <FormItem
              {...formLayout}
              label={intl
                .get('hsgp.serviceCollect.model.serviceCollect.appSourceCode')
                .d('关联应用')}
            >
              {getFieldDecorator('appCode', {
                initialValue: appCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.appSourceCode')
                        .d('关联应用'),
                    }),
                  },
                ],
              })(
                <SourceLov
                  disabled={!!appCode}
                  onClick={this.handleAppLovShow}
                  lovModalProps={appLovProps}
                />
              )}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.appName').d('应用名称')}
            >
              {getFieldDecorator('appName', {
                initialValue: appName,
              })(<Input disabled />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.repoUrl').d('仓库地址')}
            >
              {getFieldDecorator('repoUrl', {
                initialValue: repoUrl,
              })(<Input disabled />)}
            </FormItem>
          </React.Fragment>
        );
      case 'git':
        return (
          <React.Fragment>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.repoUrl').d('仓库地址')}
            >
              {getFieldDecorator('repoUrl', {
                initialValue: repoUrl,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.repoUrl')
                        .d('关联应用'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.version').d('代码版本')}
            >
              {getFieldDecorator('version', {
                initialValue: version,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.version')
                        .d('代码版本'),
                    }),
                  },
                ],
              })(
                <Input
                  style={{ width: '100%' }}
                  addonBefore={getFieldDecorator('repoBranch', {
                    initialValue: 'repoBranch',
                  })(
                    <Select style={{ width: 70 }}>
                      <Option value="repoBranch">
                        {intl.get('hsgp.serviceCollect.model.serviceCollect.repoBranch').d('分支')}
                      </Option>
                      <Option value="repoTag">
                        {intl.get('hsgp.serviceCollect.model.serviceCollect.repoTag').d('标签')}
                      </Option>
                    </Select>
                  )}
                />
              )}
            </FormItem>
          </React.Fragment>
        );
      default:
        break;
    }
  }

  render() {
    const {
      form,
      initData,
      title,
      modalVisible,
      loading,
      initLoading = false,
      fetchSourceLovLoading = false,
      serviceCollect: { sourceLovList = {} },
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      serviceCode,
      serviceName,
      sourceKey,
      serviceLogo,
      appSourceId,
      appSourceCode,
      appSourceName,
      config = {},
    } = initData;
    const { appId } = config;
    const { lovModalVisible } = this.state;
    const lovModalProps = {
      rowKey: 'appSourceId',
      visible: lovModalVisible,
      onOk: this.handleAppSourceLovOk,
      onCancel: this.handleCloseSourceLov,
      dataSource: sourceLovList,
      onSearch: this.fetchSourceLov,
      loading: fetchSourceLovLoading,
      filterItems: [
        {
          label: intl.get('hsgp.common.model.common.appSourceCode').d('来源编码'),
          code: 'appSourceCode',
        },
        {
          label: intl.get('hsgp.common.model.common.appSourceName').d('来源名称'),
          code: 'appSourceName',
        },
      ],
      columns: [
        {
          title: intl.get('hsgp.common.model.common.appSourceCode').d('来源编码'),
          dataIndex: 'appSourceCode',
        },
        {
          title: intl.get('hsgp.common.model.common.appSourceName').d('来源名称'),
          width: 250,
          dataIndex: 'appSourceName',
        },
      ],
    };
    // 绑定应用来源key
    getFieldDecorator('sourceKey', { initialValue: sourceKey });
    // 绑定 appSource 相应字段
    getFieldDecorator('appSourceId', { initialValue: appSourceId });
    // getFieldDecorator('appSourceCode', { initialValue: appSourceCode });
    getFieldDecorator('appSourceName', { initialValue: appSourceName });
    // 绑定猪齿鱼对应字段
    getFieldDecorator('appId', { initialValue: appId });
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={this.handleCancel}
        onOk={this.handleSaveService}
      >
        <Spin spinning={initLoading}>
          <Form>
            <Divider orientation="left">
              {intl.get('hsgp.common.view.message.editor.basicInfo').d('基本信息')}
            </Divider>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.serviceCode').d('服务编码')}
            >
              {getFieldDecorator('serviceCode', {
                initialValue: serviceCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input disabled={!!serviceCode} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.serviceName').d('服务名称')}
            >
              {getFieldDecorator('serviceName', {
                initialValue: serviceName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
                    }),
                  },
                  {
                    max: 90,
                    message: intl.get('hzero.common.validation.max', {
                      max: 90,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.serviceLogo').d('服务图片')}
              extra="上传格式：*.png;*.jpeg"
              {...formLayout}
            >
              <Upload
                accept=".jpeg,.png"
                single
                fileList={
                  serviceLogo && [
                    {
                      uid: '-1',
                      name: serviceName,
                      status: 'done',
                      url: serviceLogo,
                    },
                  ]
                }
                bucketName="public"
                onUploadSuccess={this.onUploadSuccess}
              />
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.appSourceName').d('应用来源')}
            >
              {getFieldDecorator('appSourceCode', {
                initialValue: appSourceCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.common.model.common.appSourceName').d('应用来源'),
                    }),
                  },
                ],
              })(
                <SourceLov
                  disabled={!!sourceKey}
                  onClick={this.openAppSourceLov}
                  lovModalProps={lovModalProps}
                />
              )}
            </FormItem>
            {this.handleAppSourceRender()}
          </Form>
        </Spin>
      </Modal>
    );
  }
}
