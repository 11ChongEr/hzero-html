import React from 'react';
import { Form, Input, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
export default class ProductForm extends React.PureComponent {
  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const {
      form,
      initData,
      title,
      modalVisible,
      loading,
      onCancel,
      initLoading = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const { productCode, productName, description } = initData;
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
              label={intl.get('hsgp.productCollect.model.productCollect.productCode').d('产品编码')}
            >
              {getFieldDecorator('productCode', {
                initialValue: productCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.productCollect.model.productCollect.productCode')
                        .d('产品编码'),
                    }),
                  },
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                  {
                    pattern: /^[A-Z0-9][A-Z0-9-_.]*$/,
                    message: intl.get('hsgp.common.validation.code').d('编码格式不正确'),
                  },
                ],
              })(<Input disabled={!!productCode} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.productCollect.model.productCollect.productName').d('产品名称')}
            >
              {getFieldDecorator('productName', {
                initialValue: productName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.productCollect.model.productCollect.productName')
                        .d('产品名称'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
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
              })(<Input />)}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
