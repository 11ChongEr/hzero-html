import React from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class Drawer extends React.PureComponent {
  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const { form, initData, title, loading, modalVisible, onCancel } = this.props;
    const { getFieldDecorator } = form;
    const { regionCode, regionName, quickIndex, _token } = initData;
    const formLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOK}
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.region.model.region.regionCode').d('区域代码')}
          >
            {getFieldDecorator('regionCode', {
              initialValue: regionCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.region.model.region.regionCode').d('区域代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input trim inputChinese={false} typeCase="upper" disabled={!!regionCode} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.region.model.region.regionName').d('区域名称')}
          >
            {getFieldDecorator('regionName', {
              initialValue: regionName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.region.model.region.regionName').d('区域名称'),
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
                label={intl.get('hpfm.region.model.region.regionName').d('区域名称')}
                field="regionName"
                token={_token}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hpfm.region.model.region.quickIndex').d('快速索引')}
          >
            {getFieldDecorator('quickIndex', {
              initialValue: quickIndex,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.region.model.region.quickIndex').d('快速索引'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('hpfm.region.model.region.quickIndex').d('快速索引')}
                field="quickIndex"
                token={_token}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
