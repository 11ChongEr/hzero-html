import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Upload from 'components/Upload/UploadButton';

import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onAdd - 添加确定的回调函数
 * @reactProps {Function} onEdit - 编辑确定的回调函数
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  @Bind()
  onOk() {
    const { form, onAdd, isCreate, tableRecord, onEdit } = this.props;
    const { _token, templateId, objectVersionNumber } = tableRecord;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (isCreate) {
          onAdd(values);
        } else {
          onEdit({ _token, templateId, objectVersionNumber, ...values });
        }
      }
    });
  }

  // 上传图片成功
  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        templateAvatar: file.response,
      });
    }
  }

  // 删除图片成功
  @Bind()
  onCancelSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        templateAvatar: '',
      });
    }
  }

  render() {
    const {
      modalVisible,
      onCancel,
      saving,
      anchor,
      tableRecord,
      isCreate,
      fileList = [],
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        width={520}
        title={
          isCreate
            ? intl.get('hptl.portalTemplate.view.message.create').d('新建模板')
            : intl.get('hptl.portalTemplate.view.message..edit').d('编辑模板')
        }
        visible={modalVisible}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem
            label={intl.get('hptl.portalTemplate.model.portalTemplate.templateCode').d('模板代码')}
            {...formLayout}
          >
            {getFieldDecorator('templateCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hptl.portalTemplate.model.portalTemplate.templateCode')
                      .d('模板代码'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.templateCode : '',
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hptl.portalTemplate.model.portalTemplate.templateName').d('模板名称')}
            {...formLayout}
          >
            {getFieldDecorator('templateName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hptl.portalTemplate.model.portalTemplate.templateName')
                      .d('模板名称'),
                  }),
                },
              ],
              initialValue: tableRecord.templateName ? tableRecord.templateName : '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('hptl.portalTemplate.model.portalTemplate.templateAvatar')
              .d('模板缩略图')}
            {...formLayout}
            // eslint-disable-next-line
            required={true}
            extra={intl
              .get('hptl.portalTemplate.model.portalTemplate.uploadSupport', {
                type: '*.png;*.jpeg',
              })
              .d('上传格式：*.png;*.jpeg')}
          >
            <Upload
              accept="image/jpeg,image/png"
              single
              bucketName="hptl-templates"
              onUploadSuccess={this.onUploadSuccess}
              fileList={fileList}
              onRemove={this.onCancelSuccess}
            />
          </FormItem>
          <FormItem wrapperCol={{ span: 15, offset: 7 }}>
            {getFieldDecorator('templateAvatar', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hptl.portalTemplate.model.portalTemplate.templateAvatar')
                      .d('模板缩略图'),
                  }),
                },
              ],
              initialValue: tableRecord.templateAvatar,
            })(<div />)}
          </FormItem>
          <FormItem
            label={intl.get('hptl.portalTemplate.model.portalTemplate.templatePath').d('模板路径')}
            {...formLayout}
          >
            {getFieldDecorator('templatePath', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hptl.portalTemplate.model.portalTemplate.templatePath')
                      .d('模板路径'),
                  }),
                },
              ],
              initialValue: tableRecord.templatePath ? tableRecord.templatePath : '',
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isUndefined(tableRecord.enabledFlag) ? 1 : tableRecord.enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
