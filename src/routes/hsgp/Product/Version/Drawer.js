import React from 'react';
import { Form, Input, Modal, Spin, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { getDateTimeFormat } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const { TextArea } = Input;

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

  // @Bind()
  // range(start, end) {
  //   const result = [];
  //   for (let i = start; i < end; i++) {
  //     result.push(i);
  //   }
  //   return result;
  // }

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
    const { versionNumber, description, releaseDate = '' } = initData;
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
            <FormItem {...formLayout} label="版本号">
              {getFieldDecorator('versionNumber', {
                initialValue: versionNumber,
                rules: [
                  {
                    required: true,
                    message: '请输入版本号',
                  },
                  {
                    pattern: /^[A-Za-z0-9][A-Za-z0-9-_.]*$/,
                    message: '版本号格式不正确',
                  },
                  {
                    max: 60,
                    message: '长度不能超过60',
                  },
                ],
              })(<Input disabled={!!versionNumber} inputChinese={false} />)}
            </FormItem>
            <FormItem {...formLayout} label="发布时间">
              {getFieldDecorator('releaseDate', {
                initialValue: releaseDate && moment(releaseDate, DEFAULT_DATETIME_FORMAT),
                rules: [
                  {
                    required: true,
                    message: '发布时间',
                  },
                ],
              })(
                <DatePicker
                  showTime
                  disabled={!!releaseDate}
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  disabledDate={currentDate =>
                    releaseDateValidator && moment(releaseDateValidator).isAfter(currentDate, 'day')
                  }
                  // disabledTime={() => {
                  //   return {
                  //     disabledHours: () => this.range(0, moment(releaseDateValidator).hours()),
                  //     disabledMinutes: () => this.range(0, moment(releaseDateValidator).minutes()),
                  //     disabledSeconds: () => this.range(0, moment(releaseDateValidator).seconds()),
                  //   };
                  // }}
                />
              )}
            </FormItem>
            <FormItem {...formLayout} label="描述">
              {getFieldDecorator('description', {
                initialValue: description,
                rules: [
                  {
                    required: true,
                    message: '请输入更新描述',
                  },
                  {
                    max: 240,
                    message: '长度不能超过240',
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
