import React, { PureComponent } from 'react';
import { isEmpty } from 'lodash';
import { Modal, Upload, Icon, Tabs, Form, Button, Input, Select } from 'hzero-ui';
import isAbsoluteUrl from 'is-absolute-url';
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
// import intl from 'utils/intl';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

@Form.create({ fieldNameProp: null })
export default class RichTextInsertImages extends PureComponent {
  state = {
    fileList: [],
    fileUrl: null,
  };

  ok() {
    const {
      form: { getFieldValue = e => e },
      onOk,
    } = this.props;
    const { fileList, fileUrl } = this.state;
    let content = '';
    if (!isEmpty(fileList) && fileUrl) {
      content += `<a href="${fileUrl}" target="_blank">${getFieldValue('fileName') ||
        fileList[0].name ||
        fileUrl}</a>`;
    }
    const url = getFieldValue('url');
    const urlPrefix = getFieldValue('urlPrefix');

    if (!isEmpty(url)) {
      content += `<a href="${urlPrefix + url}" target="_blank">${getFieldValue('fileName') ||
        url + urlPrefix}</a>`;
    }

    onOk(content);
    this.cancel();
  }

  cancel() {
    const { onCancel = e => e } = this.props;
    this.setState({
      fileList: [],
    });
    onCancel();
  }

  onUploadRemove(file) {
    const { fileList } = this.state;
    this.setState({
      fileList: fileList.filter(o => o.uid !== file.uid),
    });
  }

  setFileList(file) {
    this.setState({
      fileList: [file],
    });
  }

  beforeUpload(file) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    this.setState({
      fileList: [file],
    });
    request(`${HZERO_FILE}/v1/files/multipart`, {
      method: 'POST',
      query: { bucketName: 'static-text', fileName: file.name },
      body: formData,
      responseType: 'text',
    }).then(res => {
      if (isAbsoluteUrl(res)) {
        notification.success();
        this.setState({
          fileUrl: res,
        });
      } else {
        notification.error({ description: JSON.parse(res).message });
      }
    });
    return false;
  }

  render() {
    const { visible, form, prompt = {} } = this.props;
    const { getFieldDecorator } = form;
    const { fileList } = this.state;
    const uploadProps = {
      beforeUpload: this.beforeUpload.bind(this),
      onRemove: this.onUploadRemove.bind(this),
      fileList,
    };
    const prefixSelector = getFieldDecorator(`urlPrefix`, {
      initialValue: 'https://',
    })(
      <Select>
        <Option value="https://">https://</Option>
        <Option value="http://">http://</Option>
      </Select>
    );

    return (
      <Modal
        title={prompt.insertFile || '插入文件'}
        visible={visible}
        onOk={this.ok.bind(this)}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        width={500}
      >
        <Tabs defaultActiveKey="upload">
          <TabPane
            tab={
              <span>
                <Icon type="upload" />
                {prompt.uploadLocalFile || '本地上传'}
              </span>
            }
            key="upload"
            style={{ height: '100%' }}
          >
            <Upload {...uploadProps}>
              <Button>
                <Icon type="upload" /> {prompt.selectFile || '选择文件上传'}
              </Button>
            </Upload>
            <br />
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="link" />
                {prompt.fileLink || '文件链接'}
              </span>
            }
            key="link"
          >
            <Form>
              <FormItem {...formItemLayout} label="url">
                {getFieldDecorator(`url`)(
                  <Input addonBefore={prefixSelector} style={{ width: '80%' }} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={prompt.fileDescription || '文件说明'}>
                {getFieldDecorator(`fileName`)(<Input style={{ width: '80%' }} />)}
              </FormItem>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
