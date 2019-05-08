import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Button, Icon, Upload, Row, Col, InputNumber } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getAccessToken, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import style from '../index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ loading, templatesConfig }) => ({
  createTemplatesConfigLoading: loading.effects['templatesConfig/createTemplatesConfig'],
  templatesConfig,
  currentTenantId: getCurrentOrganizationId(),
}))
export default class TemplateForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { initData } = props;
    const { imageUrl } = initData;
    this.state = {
      previewImage: '',
      previewVisible: false,
      fileList: imageUrl ? [{ uid: '-1', url: imageUrl, name: 'xxx.png', status: 'done' }] : [],
      saveItemId: '',
    };
  }

  /**
   * removeFile - 删除文件
   * @param {object} file - 删除的文件对象
   */
  @Bind()
  removeFile(file) {
    const { dispatch, initData } = this.props;
    if (file.url && file.uid !== '-1') {
      dispatch({
        type: 'templatesConfig/removeFileList',
        payload: {
          bucketName: 'hptl-template',
          attachmentUUID: this.state.attachmentUUID || initData.attachmentUUID,
          urls: [file.url],
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
    } else {
      const { fileList } = this.state;
      const newFile = fileList.filter(item => {
        return item.uid !== '-1';
      });
      this.setState({
        fileList: newFile,
      });
    }
  }

  @Bind()
  handlePreview(file) {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({ previewVisible: false });
  }

  @Bind()
  handleChange({ file, fileList }) {
    this.setState({ fileList });
    switch (file.status) {
      case 'error':
        notification.warning({ message: '上传失败' });
        break;
      case 'done':
        notification.success();
        break;
      default:
        break;
    }
  }

  @Bind()
  beforeUpload(file) {
    const { fileSize = 2 * 1024 * 1024 } = this.props;
    const fileType = 'image/jpeg;image/png';
    if (fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('hptl.common.view.message.updateLoadFileTypeMustBeImg')
          .d('上传文件类型必须是: jpeg/png'),
      });
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl.get('hptl.common.view.message.uploadFileSizeLimit', {
          size: fileSize / (1024 * 1024),
        }),
      });
      return false;
    }
    return true;
  }

  @Bind()
  uploadData(file) {
    return {
      bucketName: 'hptl-config',
      fileName: file.name,
    };
  }

  @Bind()
  handleSave() {
    const { dispatch, form, initData, configId } = this.props;
    const { isCreate = false, imageUrl, configItemId } = initData;
    form.validateFields((err, value) => {
      this.setState({ saveItemId: configItemId });
      const { upload = [], description, content = '', configCode, linkUrl, orderSeq } = value;
      if (isEmpty(err)) {
        let params = {};
        if (isCreate) {
          params = {
            configId,
            configCode,
            imageUrl: (upload[0] && upload[0].response) || imageUrl,
            description,
            linkUrl,
            orderSeq,
            content,
          };
        } else {
          params = {
            ...initData,
            content,
            description,
            linkUrl,
            orderSeq,
            configCode,
            imageUrl: upload[0].response || upload[0].url || imageUrl,
          };
        }
        dispatch({
          type: 'templatesConfig/createTemplatesConfig',
          payload: [params],
        }).then(res => {
          this.setState({ saveItemId: '' });
          if (res) {
            dispatch({
              type: 'templatesConfig/fetchTemplateDetail',
              payload: { configId },
            });
            notification.success();
          }
        });
      }
    });
  }

  @Bind()
  normFile(e) {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }

  @Bind()
  deleteCarousel(data) {
    const {
      dispatch,
      configId,
      templatesConfig: { templateDetail },
    } = this.props;
    const { CAROUSEL = [] } = templateDetail;
    const { configItemId, imageUrl } = data;
    if (imageUrl) {
      dispatch({
        type: 'templatesConfig/deleteTemplatesConfig',
        payload: data,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'templatesConfig/fetchTemplateDetail',
            payload: { configId },
          });
          notification.success();
        }
      });
    } else {
      dispatch({
        type: 'templatesConfig/updateState',
        payload: {
          templateDetail: {
            ...templateDetail,
            CAROUSEL: CAROUSEL.filter(item => item.configItemId !== configItemId),
          },
        },
      });
      notification.success();
    }
  }

  render() {
    const {
      form,
      type,
      initData,
      desc,
      createTemplatesConfigLoading = false,
      currentTenantId,
    } = this.props;
    const { getFieldDecorator } = form;
    const { content, description, linkUrl, orderSeq } = initData;
    const { previewVisible, previewImage, fileList, saveItemId } = this.state;
    const requestLoading = {
      save: createTemplatesConfigLoading,
    };
    const formLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <Form style={{ margin: '12px auto 24px' }}>
        {type === 'LOGO' && <p style={{ fontSize: '16px' }}>{desc}</p>}
        <Row type="flex" justify="start">
          <Col>
            <FormItem>
              {getFieldDecorator('upload', {
                initialValue: fileList,
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })(
                <Upload
                  accept=".jpeg,.png"
                  className={
                    type === 'LOGO' ? style['template-upload-logo'] : style['template-upload']
                  }
                  listType="picture-card"
                  action={`${HZERO_FILE}/v1/${
                    isTenantRoleLevel() ? `${currentTenantId}/` : ''
                  }files/multipart`}
                  headers={{ Authorization: `bearer ${getAccessToken()}` }}
                  data={this.uploadData}
                  onPreview={this.handlePreview}
                  onRemove={this.removeFile}
                  onChange={this.handleChange}
                  beforeUpload={this.beforeUpload}
                >
                  {fileList.length < 1 && (
                    <Icon style={{ fontSize: '32px', color: '#999' }} type="cloud-upload-o" />
                  )}
                </Upload>
              )}
            </FormItem>
          </Col>
          <Col>
            <Row>
              {type !== 'LOGO' && (
                <Col>
                  <FormItem
                    label={intl.get('hptl.common.model.portal.content').d('标题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('content', {
                      initialValue: content,
                    })(<Input style={{ width: 300 }} />)}
                  </FormItem>
                </Col>
              )}
              <Col>
                <FormItem
                  label={intl.get('hptl.common.model.portal.description').d('描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description', {
                    initialValue: description,
                  })(<Input style={{ width: 300 }} />)}
                </FormItem>
              </Col>
              <Col>
                <FormItem
                  label={intl.get('hptl.common.model.portal.orderSeq').d('序号')}
                  {...formLayout}
                >
                  {getFieldDecorator('orderSeq', {
                    initialValue: orderSeq,
                    rules: [
                      {
                        required: true,
                        message: intl.get(intl.get('hzero.common.validation.notNull'), {
                          name: intl.get('hptl.common.model.portal.orderSeq').d('序号'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} style={{ width: 300 }} />)}
                </FormItem>
              </Col>
              <Col>
                <FormItem
                  label={intl.get('hptl.common.model.portal.linkUrl').d('链接')}
                  {...formLayout}
                >
                  {getFieldDecorator('linkUrl', {
                    initialValue: linkUrl,
                  })(<Input style={{ width: 300 }} />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <FormItem>
            {getFieldDecorator('configCode', {
              initialValue: type,
            })(<div />)}
          </FormItem>
        </Row>
        <Row>
          <Col>
            <FormItem>
              <Button
                disabled={fileList < 1 || (fileList[0] && fileList[0].status === 'error')}
                loading={requestLoading.save && initData.configItemId === saveItemId}
                type="primary"
                htmlType="submit"
                onClick={this.handleSave}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              {type === 'CAROUSEL' && (
                <Button style={{ marginLeft: 8 }} onClick={() => this.deleteCarousel(initData)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
            </FormItem>
          </Col>
        </Row>
        <Modal visible={previewVisible} footer={null} onCancel={() => this.handleCancel()}>
          <img alt="preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Form>
    );
  }
}
