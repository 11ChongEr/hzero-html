import React from 'react';
import { Form, Input, Modal, DatePicker, Spin, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

@Form.create({ fieldNameProp: null })
export default class VersionManageForm extends React.PureComponent {
  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const { releaseDate, ...other } = fieldsValue;
        onOk({ releaseDate: moment(releaseDate).format('YYYY-MM-DD HH:mm:ss'), ...other });
      }
    });
  }

  @Bind()
  handleChangeVersion(value, options) {
    const { form } = this.props;
    form.registerField('appVersionNumber');
    form.setFieldsValue({ appVersionNumber: options.props.children });
  }

  @Bind()
  renderSourceKey() {
    const {
      match: {
        params: { sourceKey },
      },
      form,
      initData,
      appVersionList = [],
    } = this.props;
    const { getFieldDecorator = e => e } = form;
    const { config = {} } = initData;
    const { repoUrl, appVersionId } = config;
    switch (sourceKey) {
      case 'docker':
        return (
          <FormItem
            {...formLayout}
            label={intl.get('hsgp.serviceCollect.model.serviceCollect.repositoryUrl').d('镜像地址')}
          >
            {getFieldDecorator('repoUrl', {
              initialValue: repoUrl,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hsgp.serviceCollect.model.serviceCollect.repositoryUrl')
                      .d('镜像地址'),
                  }),
                },
              ],
            })(<Input disabled={!!repoUrl} />)}
          </FormItem>
        );
      case 'choerodon':
        return (
          <FormItem
            {...formLayout}
            label={intl.get('hsgp.serviceCollect.model.serviceCollect.appVersionId').d('应用版本')}
          >
            {getFieldDecorator('appVersionId', {
              initialValue: appVersionId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hsgp.serviceCollect.model.serviceCollect.appVersionId')
                      .d('应用版本'),
                  }),
                },
              ],
            })(
              <Select disabled={!!appVersionId} onChange={this.handleChangeVersion}>
                {appVersionList.map(item => {
                  return (
                    <Option key={item.appVersionId} value={item.appVersionId}>
                      {item.appVersionNumber}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        );
      default:
        break;
    }
  }

  render() {
    const {
      form,
      initData = {},
      title,
      modalVisible,
      loading,
      onCancel,
      releaseDateValidator,
      initLoading = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const { versionNumber, metaVersion, releaseDate = '', updateLog } = initData;
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={initLoading}>
          <Form>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.versionNumber').d('版本号')}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: versionNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.versionNumber')
                        .d('版本号'),
                    }),
                  },
                  {
                    pattern: /^[A-Za-z0-9][A-Za-z0-9-_.]*$/,
                    message: intl
                      .get('hsgp.serviceCollect.validation.versionNumber')
                      .d('版本号格式不正确'),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input disabled={!!versionNumber} inputChinese={false} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.mateVersion').d('标记版本')}
            >
              {getFieldDecorator('metaVersion', {
                initialValue: metaVersion,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.mateVersion')
                        .d('标记版本'),
                    }),
                  },
                  {
                    pattern: /^[A-Za-z0-9][A-Za-z0-9-_.]*$/,
                    message: intl
                      .get('hsgp.serviceCollect.validation.mateVersion')
                      .d('标记版本不正确'),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input disabled={!!metaVersion} typeCase="upper" />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.releaseDate').d('发布时间')}
            >
              {getFieldDecorator('releaseDate', {
                initialValue: releaseDate && moment(releaseDate, DEFAULT_DATETIME_FORMAT),
                rules: [
                  {
                    type: 'object',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.releaseDate')
                        .d('发布时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  allowClear={false}
                  disabled={!!releaseDate}
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  disabledDate={currentDate =>
                    releaseDateValidator && moment(releaseDateValidator).isAfter(currentDate, 'day')
                  }
                  // disabledTime={(date) => {
                  //   if (date < moment(releaseDateValidator)) {
                  //     return {
                  //       disabledHours: () => this.range(0, moment(releaseDateValidator).hours()),
                  //       disabledMinutes: () => this.range(0, moment(releaseDateValidator).minutes()),
                  //       disabledSeconds: () => this.range(0, moment(releaseDateValidator).seconds()),
                  //     };
                  //   }
                  // }}
                />
              )}
            </FormItem>
            {this.renderSourceKey()}
            <FormItem
              {...formLayout}
              label={intl.get('hsgp.serviceCollect.model.serviceCollect.updateLog').d('更新日志')}
            >
              {getFieldDecorator('updateLog', {
                initialValue: updateLog,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hsgp.serviceCollect.model.serviceCollect.updateLog')
                        .d('更新日志'),
                    }),
                  },
                ],
              })(<TextArea autosize={{ minRows: 3, maxRows: 14 }} />)}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
