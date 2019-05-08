import React from 'react';
import { Form, Input, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Upload from 'components/Upload/UploadButton';
import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
export default class serviceManageForm extends React.Component {
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

  render() {
    const { form, initData, title, modalVisible, loading, initLoading = false } = this.props;
    const { getFieldDecorator } = form;
    const { serviceCode, serviceName, serviceLogo } = initData;
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
          </Form>
        </Spin>
      </Modal>
    );
  }
}
