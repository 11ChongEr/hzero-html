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

@connect(({ loading, productService }) => ({
  productService,
  fetchProductLovLoading: loading.effects['productService/queryProductServiceLov'],
}))
@Form.create({ fieldNameProp: null })
export default class productServiceForm extends React.PureComponent {
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
  fetchProductServiceLov(params = {}) {
    const {
      dispatch,
      productService: { defaultProductVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'productService/queryProductServiceLov',
      payload: {
        productId: defaultValue[0],
        productVersionId: defaultValue[1],
        ...params,
      },
    });
  }

  @Bind()
  openLovModal() {
    this.fetchProductServiceLov();
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
    } = this.props;
    this.setState({ sourceLovData: record });
    // 注册表单字段
    form.registerField('serviceId');
    setFieldsValue({
      serviceCode: record.serviceCode,
      serviceName: record.serviceName,
      serviceId: record.serviceId,
    });
    // 选择服务后，获取对应的依赖版本
    dispatch({
      type: 'productService/queryVersionWithService',
      payload: {
        serviceId: record.serviceId,
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
      fetchProductLovLoading = false,
      productService: { productServiceLovList = {}, versionList = [] },
    } = this.props;
    const { getFieldDecorator } = form;
    const { sourceLovData, lovModalVisible } = this.state;
    const lovModalProps = {
      rowKey: 'serviceId',
      visible: lovModalVisible,
      onOk: this.handleServiceLovOk,
      onCancel: this.handleCloseServiceLov,
      dataSource: productServiceLovList,
      onSearch: this.fetchProductServiceLov,
      loading: fetchProductLovLoading,
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
              {getFieldDecorator('serviceCode', {
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
              {getFieldDecorator('serviceName')(<Input disabled />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.serviceVersionId').d('依赖版本')}
            >
              {getFieldDecorator('serviceVersionId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.common.model.common.serviceVersionId').d('依赖版本'),
                    }),
                  },
                ],
              })(
                <Select style={{ width: 150 }}>
                  {versionList.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
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
