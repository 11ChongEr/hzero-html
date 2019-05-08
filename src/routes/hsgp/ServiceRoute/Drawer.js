import React from 'react';
import { Form, Input, Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';

import intl from 'utils/intl';

import SourceLov from '../SourceLov';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 },
};

@connect(({ loading, serviceRely, serviceRoute }) => ({
  serviceRely,
  serviceRoute,
  fetchServiceLovLoading: loading.effects['serviceRoute/fetchExcludeRouteList'],
}))
@Form.create({ fieldNameProp: null })
export default class ServiceRouteForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lovModalVisible: false,
    };
  }

  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  @Bind()
  fetchServiceLov(params = {}) {
    const {
      dispatch,
      serviceRoute: { defaultProductEnv: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'serviceRoute/fetchExcludeRouteList',
      payload: {
        productId: defaultValue[0],
        productEnvId: defaultValue[1],
        ...params,
      },
    });
  }

  @Bind()
  openLovModal() {
    this.fetchServiceLov();
    this.setState({ lovModalVisible: true });
  }

  @Bind()
  handleCloseServiceLov() {
    this.setState({ lovModalVisible: false });
  }

  @Bind()
  handleServiceLovOk(record) {
    const {
      form: { setFieldsValue = e => e, registerField = e => e },
    } = this.props;
    // 注册表单字段
    registerField('serviceId');
    setFieldsValue({
      serviceId: record.serviceId,
      serviceCode: record.serviceCode,
      serviceName: record.serviceName,
    });
  }

  render() {
    const {
      form,
      title,
      modalVisible,
      loading,
      onCancel,
      initData = {},
      initLoading = false,
      fetchServiceLovLoading = false,
      serviceRoute: { excludeRouteList = {} },
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      serviceCode,
      serviceName,
      name,
      path,
      url,
      sensitiveHeaders,
      helperService,
      customSensitiveHeaders = 0,
      stripPrefix = 1,
      retryable = 0,
    } = initData;
    const { lovModalVisible } = this.state;
    const lovModalProps = {
      rowKey: 'serviceId',
      visible: lovModalVisible,
      onOk: this.handleServiceLovOk,
      onCancel: this.handleCloseServiceLov,
      dataSource: excludeRouteList,
      onSearch: this.fetchServiceLov,
      loading: fetchServiceLovLoading,
      filterItems: [
        {
          label: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
          code: 'serviceCode',
        },
        {
          label: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
          code: 'serviceName',
        },
      ],
      columns: [
        {
          title: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
          width: 200,
          dataIndex: 'serviceCode',
        },
        {
          title: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
          dataIndex: 'serviceName',
        },
      ],
    };
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        width={620}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={initLoading}>
          <Form>
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
                ],
              })(
                <SourceLov
                  disabled={!!serviceCode}
                  onClick={this.openLovModal}
                  lovModalProps={lovModalProps}
                />
              )}
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
                ],
              })(<Input disabled />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceRoute.model.serviceRoute.name').d('路由标识')}
            >
              {getFieldDecorator('name', {
                initialValue: name,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.serviceRoute.model.serviceRoute.name').d('路由标识'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input disabled={!!name} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceRoute.model.serviceRoute.path').d('服务路径')}
            >
              {getFieldDecorator('path', {
                initialValue: path,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.serviceRoute.model.serviceRoute.path').d('服务路径'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
              })(<Input disabled={!!path} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceRoute.model.serviceRoute.url').d('物理路径')}
            >
              {getFieldDecorator('url', {
                initialValue: url,
                rules: [
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
              label={intl.get('hsgp.serviceRoute.model.serviceRoute.stripPrefix').d('去掉前缀')}
            >
              {getFieldDecorator('stripPrefix', {
                initialValue: stripPrefix,
              })(<Switch />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceRoute.model.serviceRoute.retryable').d('支持路由重试')}
            >
              {getFieldDecorator('retryable', {
                initialValue: retryable,
              })(<Switch />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl
                .get('hsgp.serviceRoute.model.serviceRoute.customSensitiveHeaders')
                .d('自定义敏感头')}
            >
              {getFieldDecorator('customSensitiveHeaders', {
                initialValue: customSensitiveHeaders,
              })(<Switch />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl
                .get('hsgp.serviceRoute.model.serviceRoute.helperService')
                .d('敏感头部列表')}
            >
              {getFieldDecorator('sensitiveHeaders', {
                initialValue: sensitiveHeaders,
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', {
                      max: 240,
                    }),
                  },
                ],
              })(<Input inputChinese={false} />)}
            </FormItem>
            <FormItem {...formLayout} label="自定义GatewayHelper">
              {getFieldDecorator('helperService', {
                initialValue: helperService,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input inputChinese={false} />)}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
