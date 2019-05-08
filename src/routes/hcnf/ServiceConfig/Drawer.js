import React from 'react';
import { Form, Input, Modal, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';
import CodeMirror from 'components/CodeMirror';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

@Form.create({ fieldNameProp: null })
export default class ServiceConfigForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      configYamls: '',
    };
  }

  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
        this.setState({ configYamls: '' });
      }
    });
  }

  @Bind()
  handleCancel() {
    const { onCancel } = this.props;
    this.setState({ configYamls: '' });
    onCancel();
  }

  /**
   * 编辑代码后更新数据
   * @param {object} editor - 编辑器对象
   * @param {object} data - 数据对象
   * @param {string} value - 编辑后的代码
   */
  @Bind()
  handleCodeChange(editor, data, value) {
    const { form } = this.props;
    this.setState({ configYamls: value });
    form.setFieldsValue({ configYaml: value });
  }

  render() {
    const { form, title, modalVisible, loading, initData = {}, initLoading = false } = this.props;
    const { configYamls } = this.state;
    const { getFieldDecorator } = form;
    const { serviceCode, configVersion, defaultFlag = 1, configYaml = '' } = initData;
    const codeMirrorProps = {
      value: configYamls || configYaml,
      options: {
        mode: 'yaml',
      },
      onChange: this.handleCodeChange,
    };
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        width={720}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={this.handleCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={initLoading}>
          <Form>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.serviceCode').d('服务编码')}
            >
              {getFieldDecorator('serviceCode', {
                initialValue: serviceCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code={isTenantRoleLevel() ? 'HCNF.SERVICE.ORG' : 'HCNF.SERVICE'}
                  textValue={serviceCode}
                  disabled={!!serviceCode}
                  onChange={(val, record) => {
                    form.getFieldDecorator('serviceId', { initialValue: record.serviceId });
                  }}
                />
              )}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.common.model.common.configVersion').d('配置版本')}
            >
              {getFieldDecorator('configVersion', {
                initialValue: configVersion,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.common.model.common.configVersion').d('配置版本'),
                    }),
                  },
                ],
              })(<Input disabled={!!configVersion} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hcnf.serviceConfig.model.serviceConfig.retryable').d('默认')}
            >
              {getFieldDecorator('defaultFlag', {
                initialValue: defaultFlag,
              })(<Switch />)}
            </FormItem>
            <FormItem
              label={intl.get('hsgp.serviceConfig.view.editor.configInfo').d('配置信息')}
              {...formLayout}
            >
              {getFieldDecorator('configYaml', {
                initialValue: configYaml,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hsgp.serviceConfig.view.editor.configInfo').d('配置信息'),
                    }),
                  },
                ],
              })(<CodeMirror codeMirrorProps={codeMirrorProps} />)}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
