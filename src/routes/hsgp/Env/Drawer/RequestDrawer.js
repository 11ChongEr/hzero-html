/*
 * 环境管理-新建通用请求参数
 * @date: 2018/10/7
 * @author: 周邓 <deng.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ loading, env }) => ({
  confirm: loading.effects['env/updateState'],
  env,
}))
export default class RequestDrawer extends React.PureComponent {
  @Bind()
  handleSaveRequest() {
    const {
      handleCancel,
      form,
      dispatch,
      env: { requestParams = [], currentRequestParam = [] },
      isUpdate,
    } = this.props;
    if (isUpdate) {
      const newRequestParams = requestParams; // 复制RequestParams
      const { index } = currentRequestParam; // 获取当前编辑项在数组中的位置
      form.validateFields((err, fieldsValue) => {
        if (!err) {
          const flag = requestParams.every(element => {
            return (
              element.paramsName !== fieldsValue.paramsName ||
              element.paramsValue !== fieldsValue.paramsValue
            );
          }); // 判断当前对象数组中是否已存在该对象
          if (flag) {
            newRequestParams[index] = fieldsValue;
            dispatch({
              type: 'env/updateState',
              payload: {
                requestParams: [...newRequestParams],
              },
            });
            // 关闭modal
            handleCancel();
          } else {
            notification.error({
              message: intl
                .get('hsgp.env.view.message.alreadyExit')
                .d('操作失败！当前参数已存在！'),
            });
          }
        }
      });
    } else {
      // 非编辑状态验重后直接保存
      form.validateFields((err, fieldsValue) => {
        if (!err) {
          const flag = requestParams.every(element => {
            return (
              element.paramsName !== fieldsValue.paramsName ||
              element.paramsValue !== fieldsValue.paramsValue
            );
          }); // 判断当前对象数组中是否已存在该对象
          if (flag) {
            dispatch({
              type: 'env/updateState',
              payload: {
                requestParams: [...requestParams, fieldsValue],
              },
            });
            // 关闭modal
            handleCancel();
          } else {
            notification.error({
              message: intl
                .get('hsgp.env.view.message.alreadyExit')
                .d('操作失败！当前参数已存在！'),
            });
          }
        }
      });
    }
  }

  render() {
    const {
      handleCancel,
      RequestModalVisible,
      form,
      env: { currentRequestParam },
      isUpdate,
      confirm,
    } = this.props;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal
        destroyOnClose
        title={
          isUpdate
            ? intl.get('hsgp.env.view.message.updateRequestParams').d('编辑通用请求参数')
            : intl.get('hsgp.env.view.message.createRequestParams').d('新建通用请求参数')
        }
        onCancel={handleCancel}
        onOk={this.handleSaveRequest}
        visible={RequestModalVisible}
        confirmLoading={confirm}
      >
        <Form>
          <FormItem label={intl.get('hsgp.env.model.env.paramsName').d('参数名称')} {...formLayout}>
            {getFieldDecorator('paramsName', {
              initialValue: currentRequestParam.paramsName,
              rules: [
                {
                  required: true,
                  message: intl.get('hsgp.env.view.message.inputParamsName').d('请输入参数名称'),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hsgp.env.model.env.paramsValue').d('参数值')} {...formLayout}>
            {getFieldDecorator('paramsValue', {
              initialValue: currentRequestParam.paramsValue,
              rules: [
                {
                  required: true,
                  message: intl.get('hsgp.env.view.message.inputParamsValue').d('请输入参数值'),
                },
              ],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
