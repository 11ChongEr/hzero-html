/**
 * Event - 事件创建窗口
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input } from 'hzero-ui';

import ModalForm from 'components/Modal/ModalForm';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class EventCreateForm extends ModalForm {
  renderForm() {
    const { form } = this.props;
    return (
      <React.Fragment>
        <Form.Item
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.event.model.event.code').d('事件编码')}
        >
          {form.getFieldDecorator('eventCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.event.model.event.code').d('事件编码'),
                }),
              },
            ],
          })(<Input typeCase="upper" trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.event.model.event.description').d('事件描述')}
        >
          {form.getFieldDecorator('eventDescription', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.event.model.event.description').d('事件描述'),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
      </React.Fragment>
    );
  }
}
