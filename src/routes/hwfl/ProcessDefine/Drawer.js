import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { trim } from 'lodash';
import { Modal, Form, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 流程定义-数据添加滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: e => e,
    onCancel: e => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          const key = trim(values.key);
          const mateInfo = {
            name: values.name,
            description: values.description,
          };
          form.resetFields();
          onOk({ ...values, key, mateInfo });
        }
      });
    }
  }

  @Bind()
  checkUnique(rule, value, callback) {
    const { onCheck } = this.props;
    onCheck({ key: value }).then(res => {
      if (res && res.failed) {
        callback(
          intl.get('hwfl.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, title, visible, form, onCancel, category, saving } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={saving}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get('hwfl.common.model.process.code').d('流程编码')}
            {...formLayout}
          >
            {getFieldDecorator('key', {
              validateFirst: true,
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.process.code').d('流程编码'),
                  }),
                },
                {
                  validator: this.checkUnique,
                },
              ],
            })(<Input typeCase="upper" trim inputChinese={false} />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.process.name').d('流程名称')}
            {...formLayout}
          >
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.process.name').d('流程名称'),
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.process.class').d('流程分类')}
            {...formLayout}
          >
            {getFieldDecorator('category', {
              // rules: [
              //   {
              //     required: true,
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl.get('hwfl.common.model.process.class').d('流程分类'),
              //     }),
              //   },
              // ],
            })(
              <Select allowClear style={{ width: '100%' }}>
                {category &&
                  category.map(item => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.common.description').d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {})(
              <Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
