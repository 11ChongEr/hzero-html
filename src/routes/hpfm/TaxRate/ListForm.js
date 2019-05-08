import React from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import intl from 'utils/intl';
import ModalForm from 'components/Modal/ModalForm';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';

@Form.create({ fieldNameProp: null })
export default class CreateForm extends ModalForm {
  renderForm() {
    const { form, editValue = {} } = this.props;
    const { taxCode, taxId, description, enabledFlag, taxRate, _token } = editValue;
    const formLayOut = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    };

    return (
      <React.Fragment>
        <Form.Item
          {...formLayOut}
          label={intl.get('hpfm.taxRate.model.taxRate.taxCode').d('税种代码')}
        >
          {form.getFieldDecorator('taxCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hzero.hpfm.taxRate.model.taxRate.taxCode').d('税种代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
            initialValue: taxCode,
          })(<Input trim typeCase="upper" inputChinese={false} disabled={!!taxId} />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hpfm.taxRate.model.taxRate.description').d('描述')}
        >
          {form.getFieldDecorator('description', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hzero.hpfm.taxRate.model.taxRate.description').d('描述'),
                }),
              },
            ],
            initialValue: description,
          })(
            <TLEditor
              label={intl.get('hpfm.taxRate.model.taxRate.description').d('描述')}
              field="description"
              token={_token}
            />
          )}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={`${intl.get('hpfm.taxRate.model.taxRate.taxRate').d('税率')}（%）`}
        >
          {form.getFieldDecorator('taxRate', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hzero.hpfm.taxRate.model.taxRate.taxRate').d('税率'),
                }),
              },
            ],
            initialValue: taxRate,
          })(<InputNumber style={{ width: 150 }} precision={2} max={100} min={0} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 8 }}
          label={intl.get('hzero.common.status.enable').d('启用')}
        >
          {form.getFieldDecorator('enabledFlag', {
            valuePropName: 'checked',
            initialValue: enabledFlag === 0 ? 0 : 1,
          })(<Switch />)}
        </Form.Item>
      </React.Fragment>
    );
  }
}
