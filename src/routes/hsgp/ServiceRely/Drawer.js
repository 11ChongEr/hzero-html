import React from 'react';
import { Form, Input, Modal, Spin, Select } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import SourceLov from '../SourceLov';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@connect(({ loading, serviceRely }) => ({
  serviceRely,
  fetchServiceLovLoading: loading.effects['serviceRely/fetchExcludeServiceList'],
}))
@Form.create({ fieldNameProp: null })
export default class ServiceRelyForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lovModalVisible: false,
      sourceLovData: {},
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
      serviceRely: { lovPagination = {}, defaultServiceVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'serviceRely/fetchExcludeServiceList',
      payload: { page: lovPagination, serviceId: defaultValue[0], ...params },
    });
  }

  @Bind()
  openLovModal() {
    this.fetchServiceLov();
    this.setState({ lovModalVisible: true });
  }

  @Bind()
  handleCloseServiceLov() {
    this.setState({ lovModalVisible: false, sourceLovData: {} });
  }

  @Bind()
  handleServiceLovOk(record) {
    const {
      form: { setFieldsValue = e => e },
      form,
      dispatch,
      serviceRely: { defaultServiceVersion: defaultValue = [] },
    } = this.props;
    this.setState({ sourceLovData: record });
    // 注册表单字段
    form.registerField('relyServiceId');
    setFieldsValue({
      relySourceCode: record.serviceCode,
      serviceName: record.serviceName,
      relyServiceId: record.serviceId,
    });
    // 选择服务后，获取对应的依赖版本
    dispatch({
      type: 'serviceRely/queryRelyVersionList',
      payload: {
        serviceId: defaultValue[0],
        serviceVersionId: defaultValue[1],
        relyServiceId: record.serviceId,
      },
    });
  }

  render() {
    const {
      form,
      title,
      modalVisible,
      loading,
      onCancel,
      initLoading = false,
      fetchServiceLovLoading = false,
      serviceRely: { excludeServiceList = {}, relyVersionList = [] },
    } = this.props;
    const { getFieldDecorator } = form;
    const { sourceLovData, lovModalVisible } = this.state;
    const lovModalProps = {
      rowKey: 'serviceId',
      visible: lovModalVisible,
      onOk: this.handleServiceLovOk,
      onCancel: this.handleCloseServiceLov,
      dataSource: excludeServiceList,
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
          width: 150,
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
              {getFieldDecorator('relySourceCode', {
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
                  textValue={sourceLovData.serviceCode}
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
              label={intl.get('hsgp.serviceRely.model.serviceRely.versionNumber').d('依赖版本')}
            >
              {getFieldDecorator('relyServiceVersionId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceRely.model.serviceRely.versionNumber')
                        .d('依赖版本'),
                    }),
                  },
                ],
              })(
                <Select style={{ width: 150 }}>
                  {relyVersionList.map(item => {
                    return (
                      <Option key={item.serviceVersionId} value={item.serviceVersionId}>
                        {item.versionNumber}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
