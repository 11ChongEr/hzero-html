import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Button, Icon, Col, Row } from 'hzero-ui';
import PropTypes from 'prop-types';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import styles from './index.less';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 },
};
const formParamsLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
/**
 * 发送配置-数据修改滑窗(抽屉)
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
   * state初始化
   */
  state = {
    recipientKey: [0], // 接收人
    recipientUuid: 1,
  };
  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (!visible) {
      this.setState({
        recipientKey: [0],
        recipientUuid: 1,
      });
    }
  }

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
    const { form, onOk, onSendOk } = this.props;
    const { recipientKey } = this.state;
    if (onOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          let newValues = {};
          let receiverAddressList = [];
          let newReceiverAddressList = [];
          let newTypeCodeList = [];
          newReceiverAddressList = recipientKey.map(item => ({
            [values[`recipientKey${item}`]]: values[`recipientValue${item}`],
          }));
          receiverAddressList = newReceiverAddressList.map(item => {
            return {
              email: item.EMAIL ? item.EMAIL : undefined,
              phone: item.SMS ? item.SMS : undefined,
              userId: item.WEB ? item.WEB : undefined,
              targetUserTenantId: item.WEB ? 0 : undefined,
            };
          });
          newTypeCodeList = recipientKey.map(item => values[`recipientKey${item}`]);
          const typeCodeList = [...new Set(newTypeCodeList)];
          const args = {};
          const recipientParams = {};
          const { lang, messageCode, tenantId, ...otherValues } = values;
          Object.keys(otherValues).forEach(item => {
            if (item.startsWith('recipientKey') || item.startsWith('recipientValue')) {
              recipientParams[item] = otherValues[item];
            } else {
              args[item] = otherValues[item];
            }
          });
          newValues = {
            lang,
            messageCode,
            tenantId,
            receiverAddressList,
            typeCodeList,
            args,
          };
          onSendOk(newValues);
        }
      });
    }
  }

  /**
   * 添加接收者参数
   *
   * @memberof Drawer
   */
  @Bind()
  addRecipient() {
    const { recipientKey, recipientUuid } = this.state;
    const nextKeys = recipientKey.concat(recipientUuid);
    this.setState({
      recipientKey: nextKeys,
      recipientUuid: recipientUuid + 1,
    });
  }

  /**
   * 移除接收者键，值
   * @param {*}
   */
  @Bind()
  removeRecipient(k) {
    const { recipientKey } = this.state;
    if (recipientKey.length === 1) {
      return;
    }
    this.setState({
      recipientKey: recipientKey.filter(key => key !== k),
    });
  }

  /**
   * 改变语言，获取参数
   */
  @Bind()
  changeLang(value) {
    const { onGetParams, tableRecord } = this.props;
    const { tenantId, messageCode } = tableRecord;
    const langParams = {
      lang: value,
      tenantId,
      messageCode,
    };
    onGetParams(langParams);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      visible,
      form,
      tableRecord,
      langType,
      enableService,
      saving,
      onCancel,
      paramsName,
      tenantRoleLevel,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { recipientKey } = this.state;
    const recipientFormItems = recipientKey.map(k => {
      return (
        <React.Fragment key={k}>
          <Row>
            <Col span={10}>
              <FormItem
                required={false}
                label={intl.get('hmsg.sendConfig.model.sendConfig.recipientType').d('类型')}
                {...formItemLayout}
              >
                {getFieldDecorator(`recipientKey${k}`, {
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.sendConfig.model.sendConfig.recipientType').d('类型'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear>
                    {enableService &&
                      enableService.map(item => (
                        <Option value={item.typeCode} key={item.typeCode}>
                          {item.typeMeaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={10} offset={1}>
              <FormItem
                required={false}
                label={intl.get('hmsg.sendConfig.model.sendConfig.recipient').d('接收人')}
                {...formItemLayout}
              >
                {getFieldDecorator(`recipientValue${k}`, {
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.sendConfig.model.sendConfig.recipient').d('接收人'),
                      }),
                    },
                  ],
                })(
                  getFieldValue(`recipientKey${k}`) === 'WEB' ? (
                    <Input type="number" min={0} />
                  ) : (
                    <Input />
                  )
                )}
              </FormItem>
            </Col>
            <Col span={1}>
              {recipientKey.length > 1 ? (
                <Icon
                  className={styles.iconButton}
                  type="minus-circle-o"
                  onClick={() => this.removeRecipient(k)}
                />
              ) : null}
            </Col>
          </Row>
        </React.Fragment>
      );
    });
    return (
      <Modal
        destroyOnClose
        width={520}
        title={intl.get('hmsg.sendConfig.view.title.testSend').d('测试发送')}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        confirmLoading={saving}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          {!tenantRoleLevel && (
            <FormItem
              label={intl.get('hmsg.sendConfig.model.sendConfig.tenantId').d('租户')}
              {...formLayout}
            >
              {getFieldDecorator('tenantId', {
                initialValue: tableRecord.tenantId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.sendConfig.model.sendConfig.tenantId').d('租户'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HPFM.TENANT"
                  disabled={!isUndefined(tableRecord.tenantId)}
                  textValue={tableRecord.tenantName}
                />
              )}
            </FormItem>
          )}
          <FormItem
            label={intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码')}
            {...formLayout}
          >
            {getFieldDecorator('messageCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码'),
                  }),
                },
              ],
              initialValue: tableRecord.messageCode,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('hmsg.sendConfig.model.sendConfig.lang').d('语言')}
            {...formLayout}
          >
            {getFieldDecorator('lang', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.sendConfig.model.sendConfig.lang').d('语言'),
                  }),
                },
              ],
            })(
              <Select allowClear onChange={this.changeLang}>
                {langType &&
                  langType.map(item => (
                    <Option value={item.lang} key={item.lang}>
                      {item.langMeaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          {!isEmpty(paramsName) ? (
            <FormItem
              labelCol={{ span: 2 }}
              label={intl.get('hrpt.reportDataSource.model.reportDataSource.params').d('参数')}
            />
          ) : (
            ''
          )}
          {!isEmpty(paramsName)
            ? paramsName &&
              paramsName.map(item => (
                <FormItem label={`${item}`} key={`${item}`} {...formParamsLayout}>
                  {getFieldDecorator(`${item}`, {})(<Input />)}
                </FormItem>
              ))
            : ''}
          <FormItem>
            <Button icon="plus" type="primary" onClick={this.addRecipient}>
              {intl.get('hmsg.sendConfig.view.button.addRecipient').d('添加接收人')}
            </Button>
          </FormItem>
          {recipientFormItems}
        </Form>
      </Modal>
    );
  }
}
