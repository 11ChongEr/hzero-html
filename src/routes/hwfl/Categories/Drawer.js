import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

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
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (isCreate) {
          onAdd(values);
        } else {
          onEdit({ ...tableRecord, ...values });
        }
      }
    });
  }

  render() {
    const { visible, onCancel, saving, anchor, tableRecord, isCreate } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        width={520}
        title={
          isCreate
            ? intl.get('hwfl.categories.view.message.create').d('新建流程分类')
            : intl.get('hwfl.categories.view.message.edit').d('编辑流程分类')
        }
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem
            label={intl.get('hwfl.categories.model.categories.code').d('流程分类编码')}
            {...formLayout}
          >
            {getFieldDecorator('code', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.categories.model.categories.code').d('流程分类编码'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.code : '',
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.categories.model.categories.description').d('流程分类描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfl.categories.model.categories.description')
                      .d('流程分类描述'),
                  }),
                },
              ],
              initialValue: tableRecord.description ? tableRecord.description : '',
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
