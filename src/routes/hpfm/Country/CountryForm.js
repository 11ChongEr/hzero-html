import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
@Form.create({ fieldNameProp: null })
export default class CountryForm extends React.PureComponent {
  /**
   * 国家保存
   */
  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const { form, initData, title, loading, onCancel, modalVisible } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.country.model.country.countryCode').d('国家代码')}
          >
            {getFieldDecorator('countryCode', {
              initialValue: initData.countryCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.country.model.country.countryCode').d('国家代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
                {
                  pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_.]*$/,
                  message: intl.get('hzero.common.validation.code').d('格式不正确'),
                },
              ],
            })(
              <Input trim inputChinese={false} typeCase="upper" disabled={!!initData.countryCode} />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.country.model.country.countryName').d('国家名称')}
            {...formLayout}
          >
            {getFieldDecorator('countryName', {
              initialValue: initData.countryName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.country.model.country.countryName').d('国家名称'),
                  }),
                },
                {
                  max: 120,
                  message: intl.get('hzero.common.validation.max', {
                    max: 120,
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('hpfm.country.model.country.countryName').d('国家名称')}
                field="countryName"
                token={initData._token}
                inputSIze={{ zh: 60, en: 120 }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.country.model.country.quickIndex').d('快速索引')}
            {...formLayout}
          >
            {getFieldDecorator('quickIndex', {
              initialValue: initData.quickIndex,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.country.model.country.quickIndex').d('快速索引'),
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('hpfm.country.model.country.quickIndex').d('快速索引')}
                field="quickIndex"
                token={initData._token}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.country.model.country.abbreviation').d('简称')}
            {...formLayout}
          >
            {getFieldDecorator('abbreviation', {
              initialValue: initData.abbreviation,
            })(
              <TLEditor
                label={intl.get('hpfm.country.model.country.abbreviation').d('简称')}
                field="abbreviation"
                token={initData._token}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: initData.enabledFlag === undefined ? 1 : initData.enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
