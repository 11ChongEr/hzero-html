import React from 'react';
import { Modal, Input, Form, Row, Col, InputNumber, Spin } from 'hzero-ui';
import { isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import Upload from 'components/Upload/UploadButton';

import intl from 'utils/intl';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class AppDrawer extends React.PureComponent {
  /**
   * @function handleOK - 确认操作
   */
  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        if (isFunction(onOk)) {
          onOk(fieldsValue);
        }
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
      form.setFieldsValue({
        appImage: file.response,
      });
    }
  }

  render() {
    const {
      form,
      modalVisible,
      openAppDetail,
      onCancel,
      fetchDetailLoading,
      saveDetailLoading,
      detailTitle,
      fileList = [],
    } = this.props;
    const {
      openAppId,
      appCode,
      appId,
      orderSeq,
      appName,
      redirectUri,
      appKey,
      authorizePath,
      tokenPath,
      refreshTokenPath,
      selfPath,
      scope,
      appImage,
    } = openAppDetail;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const lineFormLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <Modal
        destroyOnClose
        title={detailTitle}
        visible={modalVisible}
        width="1000px"
        confirmLoading={saveDetailLoading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={onCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={openAppId ? fetchDetailLoading : false}>
          <Form>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.appCode').d('应用编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('appCode', {
                    initialValue: appCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.appCode').d('应用编码'),
                        }),
                      },
                    ],
                  })(<Input trim inputChinese={false} />)}
                </FormItem>
                <FormItem label="appId" {...formLayout}>
                  {getFieldDecorator('appId', {
                    initialValue: appId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.appId').d('appId'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.orderSeq').d('序号')}
                  {...formLayout}
                >
                  {getFieldDecorator('orderSeq', {
                    initialValue: orderSeq,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.orderSeq').d('序号'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} />)}
                </FormItem>
                <FormItem
                  label={
                    <span className="ant-form-item-required">
                      {intl.get('hiam.openApp.model.openApp.appleImage').d('应用图片')}
                    </span>
                  }
                  extra="上传格式：*.png;*.jpeg"
                  {...formLayout}
                >
                  <Upload
                    accept=".jpeg,.png"
                    fileType="image/jpeg;image/png"
                    single
                    fileList={fileList}
                    bucketName="public"
                    onUploadSuccess={this.onUploadSuccess}
                  />
                </FormItem>
                <FormItem wrapperCol={{ span: 10, offset: 9 }}>
                  {getFieldDecorator('appImage', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.appImage').d('应用图片'),
                        }),
                      },
                    ],
                    initialValue: appImage,
                  })(<span />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.appName').d('应用名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('appName', {
                    initialValue: appName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.appName').d('应用名称'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.appKey').d('授权码')}
                  {...formLayout}
                >
                  {getFieldDecorator('appKey', {
                    initialValue: appKey,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.appKey').d('授权码'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.redirectUri').d('回调地址')}
                  {...formLayout}
                >
                  {getFieldDecorator('redirectUri', {
                    initialValue: redirectUri,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.openApp.model.openApp.redirectUri').d('回调地址'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.authorizePath').d('认证码地址')}
                  {...lineFormLayout}
                >
                  {getFieldDecorator('authorizePath', {
                    initialValue: authorizePath,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.tokenPath').d('AccessToken地址')}
                  {...lineFormLayout}
                >
                  {getFieldDecorator('tokenPath', {
                    initialValue: tokenPath,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl
                    .get('hiam.openApp.model.openApp.refreshTokenPath')
                    .d('RefreshToken地址')}
                  {...lineFormLayout}
                >
                  {getFieldDecorator('refreshTokenPath', {
                    initialValue: refreshTokenPath,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.selfPath').d('获取个人信息地址')}
                  {...lineFormLayout}
                >
                  {getFieldDecorator('selfPath', {
                    initialValue: selfPath,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get('hiam.openApp.model.openApp.scope').d('授权列表')}
                  {...lineFormLayout}
                >
                  {getFieldDecorator('scope', {
                    initialValue: scope,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
