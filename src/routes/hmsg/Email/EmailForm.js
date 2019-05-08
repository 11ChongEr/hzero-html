import React from 'react';
import { Form, Input, Row, Col, Table, Button, InputNumber, Modal, Tooltip, Icon } from 'hzero-ui';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Switch from 'components/Switch';

import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import ItemForm from './ItemForm';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
@Form.create({ fieldNameProp: null })
export default class EmailForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      itemFormData: {},
    };
  }

  /**
   * @function showItemModal - 显示新增配置属性模态框
   * @param {object} record - 行数据
   */
  @Bind()
  showItemModal(record = {}) {
    this.setState({
      modalVisible: true,
      itemFormData: record,
    });
  }

  /**
   * @function handleDeleteItem - 删除服务器属性配置
   * @param {object} record - 行数据
   */
  @Bind()
  handleDeleteItem(record) {
    const { deleteItem } = this.props;
    deleteItem(record);
  }

  /**
   * @function hideItemModal - 隐藏新增配置属性模态框
   */
  @Bind()
  hideItemModal() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * @function handleAddItem - 新增一条邮箱服务器配置项
   * @param {object} params - 新增参数
   * @param {string} params.propertyCode - 服务器配置项 - 属性名称
   * @param {string} params.propertyName - 服务器配置项 - 属性值
   */
  @Bind()
  handleAddItem(itemValue) {
    const { addItem } = this.props;
    const { itemFormData } = this.state;
    addItem(itemValue, itemFormData);
    this.hideItemModal();
  }

  @Bind()
  handleEmailOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const {
      form,
      initData,
      itemList,
      title,
      modalVisible,
      loading,
      onCancel,
      tenantRoleLevel,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      tenantId,
      tenantName,
      serverCode,
      serverName,
      username,
      password,
      host,
      port,
      sender,
      tryTimes,
      enabledFlag,
    } = initData;
    const columns = [
      {
        title: intl.get('hmsg.email.model.email.propertyCode').d('属性名称'),
        dataIndex: 'propertyCode',
        width: 150,
      },
      {
        title: intl.get('hmsg.email.model.email.propertyValue').d('属性值'),
        dataIndex: 'propertyValue',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        dataIndex: 'edit',
        render: (text, record) => (
          <span className="action-link">
            <a onClick={() => this.showItemModal(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a onClick={() => this.handleDeleteItem(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        width="1000px"
        confirmLoading={loading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={onCancel}
        onOk={this.handleEmailOk}
      >
        <Row type="flex">
          {!tenantRoleLevel && (
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hmsg.email.model.email.tenantName').d('租户')}
              >
                {getFieldDecorator('tenantId', {
                  initialValue: tenantId === 0 ? 0 : tenantId,
                  rules: [
                    {
                      type: 'number',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.email.model.email.tenantName').d('租户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={!!tenantName}
                    textValue={tenantName}
                    code="HPFM.TENANT"
                    // onChange={(text, record) => {
                    //   form.setFieldsValue({ tenantName: record.tenantName });
                    // }}
                  />
                )}
              </FormItem>
              {/* {getFieldDecorator('tenantName', {
            initialValue: tenantName,
          })(<div />)} */}
            </Col>
          )}
          <Col span={12}>
            <FormItem
              {...formLayout}
              label={intl.get('hmsg.email.model.email.serverCode').d('账户代码')}
            >
              {getFieldDecorator('serverCode', {
                initialValue: serverCode,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.serverCode').d('账户代码'),
                    }),
                  },
                ],
              })(<Input typeCase="upper" trim inputChinese={false} disabled={!!tenantName} />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayout}
              label={intl.get('hmsg.email.model.email.serverName').d('账户名称')}
            >
              {getFieldDecorator('serverName', {
                initialValue: serverName,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.serverName').d('账户名称'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayout}
              label={
                <span>
                  {intl.get('hmsg.email.model.email.userName').d('用户名')}&nbsp;
                  <Tooltip
                    title={intl.get('hmsg.email.model.email.userName.type').d('用户名为邮箱格式')}
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator('username', {
                initialValue: username,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.userName').d('用户名'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hmsg.email.model.validation.userName.error').d('格式不正确'),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...formLayout} label={intl.get('hmsg.email.model.email.password').d('密码')}>
              {getFieldDecorator('password', {
                initialValue: password,
                rules: [
                  {
                    type: 'string',
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.password').d('密码'),
                    }),
                  },
                ],
              })(
                <Input
                  type="password"
                  placeholder={
                    tenantName ? intl.get('hzero.common.validation.notChange').d('未更改') : ''
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayout}
              label={intl.get('hmsg.email.model.email.host').d('邮件服务器')}
            >
              {getFieldDecorator('host', {
                initialValue: host,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.host').d('邮件服务器'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...formLayout} label={intl.get('hmsg.email.model.email.port').d('端口')}>
              {getFieldDecorator('port', {
                initialValue: port,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.port').d('端口'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...formLayout} label={intl.get('hmsg.email.model.email.sender').d('发送人')}>
              {getFieldDecorator('sender', {
                initialValue: sender,
                rules: [
                  {
                    type: 'string',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.sender').d('发送人'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayout}
              label={intl.get('hmsg.email.model.email.tryTimes').d('重试次数')}
            >
              {getFieldDecorator('tryTimes', {
                initialValue: tryTimes,
                rules: [
                  {
                    type: 'number',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.email.model.email.tryTimes').d('重试次数'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max={5} />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag === undefined ? 1 : enabledFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="end" style={{ marginTop: '8px' }}>
          <Col span={23}>
            <Button icon="plus" style={{ marginBottom: 8 }} onClick={this.showItemModal}>
              {intl.get('hmsg.email.view.message.title.modal.server.create').d('新建服务器配置项')}
            </Button>
            <Table
              bordered
              rowKey={record => `${record.propertyId} ${uuid()}`}
              dataSource={itemList}
              columns={columns}
              pagination={false}
            />
          </Col>
        </Row>
        <ItemForm
          title={`${
            this.state.itemFormData.propertyId
              ? intl.get('hmsg.email.view.message.title.modal.server.edit').d('编辑服务器配置项')
              : intl.get('hmsg.email.view.message.title.modal.server.create').d('新建服务器配置项')
          }`}
          modalVisible={this.state.modalVisible}
          initData={this.state.itemFormData}
          onCancel={this.hideItemModal}
          onOk={this.handleAddItem}
        />
      </Modal>
    );
  }
}
