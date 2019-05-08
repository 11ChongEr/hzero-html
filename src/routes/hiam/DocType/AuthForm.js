/**
 * 单据权限 - 采购订单权限维度
 * TODO: 该表格全部给了宽度 所以 通用调整没有调整到
 */
import React from 'react';
import { Form, Input, Row, Col, Table, Divider, Spin } from 'hzero-ui';
import { isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import ModalForm from 'components/Modal/ModalForm';
import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class AuthForm extends ModalForm {
  constructor(props) {
    super(props);
    const { roleAuthScopeTypeCode = [], data = [] } = props;
    const businessList = roleAuthScopeTypeCode.filter(item => item.parentValue === 'BIZ');
    const personalList = roleAuthScopeTypeCode.filter(item => item.parentValue === 'USER');
    this.state = {
      data,
      businessList,
      personalList,
      businessSelectedRowKeys: data
        .map(item => item.authTypeCode)
        .filter(item => businessList.findIndex(e => e.value === item) !== -1),
      personalSelectedRowKeys: data
        .map(item => item.authTypeCode)
        .filter(item => personalList.findIndex(e => e.value === item) !== -1),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data: prevData, roleAuthScopeTypeCode: prevRoleAuthScopeTypeCode } = prevState;
    const { data = [], roleAuthScopeTypeCode = [] } = nextProps;
    if (prevData !== data && roleAuthScopeTypeCode !== prevRoleAuthScopeTypeCode) {
      const businessList = roleAuthScopeTypeCode.filter(item => item.parentValue === 'BIZ');
      const personalList = roleAuthScopeTypeCode.filter(item => item.parentValue === 'USER');
      return {
        data,
        businessList,
        personalList,
        businessSelectedRowKeys: isArray(data)
          ? data
              .map(item => item.authTypeCode)
              .filter(item => businessList.findIndex(e => e.value === item) !== -1)
          : [],
        personalSelectedRowKeys: isArray(data)
          ? data
              .map(item => item.authTypeCode)
              .filter(item => personalList.findIndex(e => e.value === item) !== -1)
          : [],
      };
    } else {
      return null;
    }
  }

  /**
   * 限定业务范围勾选回调
   * @param {Array} selectedRowKeys - 权限维度行 ID
   */
  @Bind()
  businessOnSelectChange(selectedRowKeys) {
    this.setState({
      businessSelectedRowKeys: selectedRowKeys,
    });
  }

  /**
   * 限定个人用户勾选回调
   * @param {Array} selectedRowKeys - 权限维度行 ID
   */
  @Bind()
  personalOnSelectChange(selectedRowKeys) {
    this.setState({
      personalSelectedRowKeys: selectedRowKeys,
    });
  }

  /**
   * 保存提交当前权限维度
   */
  @Bind()
  onOk() {
    const { data = [] } = this.state;
    const { form, docTypeId, handleSave } = this.props;
    form.validateFields({ force: true }, (err, fieldsValue) => {
      if (err) return;
      const deleteAuth = data
        .filter(
          item =>
            Object.keys(fieldsValue)
              .filter(e => e.indexOf('#') === -1)
              .findIndex(e => e === item.authTypeCode) === -1
        )
        .map(item => ({
          ...item,
          actionType: 0,
        }));
      const addAuth = Object.keys(fieldsValue)
        .filter(item => item.indexOf('#') === -1)
        .filter(item => {
          const index = isArray(data) ? data.findIndex(e => e.authTypeCode === item) : null;
          return (
            index === -1 ||
            data[index].sourceMatchField !== fieldsValue[item] ||
            data[index].supSourceMatchField !== fieldsValue[item]
          );
        })
        .map(item => {
          const index = isArray(data) ? data.findIndex(e => e.authTypeCode === item) : null;
          return index === -1
            ? {
                docTypeId,
                authTypeCode: item,
                actionType: 1,
                sourceMatchField: fieldsValue[item],
                sourceMatchTable: fieldsValue[`${item}#sourceMatchTable`],
                supSourceMatchField: fieldsValue[`${item}#supSourceMatchField`],
              }
            : {
                ...data[index],
                actionType: 1,
                sourceMatchField: fieldsValue[item],
                sourceMatchTable: fieldsValue[`${item}#sourceMatchTable`],
                supSourceMatchField: fieldsValue[`${item}#supSourceMatchField`],
              };
        });
      const saveData = [...addAuth, ...deleteAuth];
      handleSave(saveData);
    });
  }

  /**
   * 侧栏隐藏时清除内部状态
   */
  @Bind()
  resetState() {
    this.setState({
      data: [],
      businessList: [],
      personalList: [],
      businessSelectedRowKeys: [],
      personalSelectedRowKeys: [],
    });
  }

  renderForm() {
    const {
      personalSelectedRowKeys,
      businessSelectedRowKeys,
      businessList,
      personalList,
      data = [],
    } = this.state;
    const { form, loading } = this.props;

    const businessColumns = [
      {
        title: intl.get('hiam.docType.model.docType.bizMeaning').d('限定业务范围'),
        dataIndex: 'meaning',
        width: 100,
      },
      {
        title: intl.get('hiam.docType.model.docType.sourceMatchTable').d('来源匹配表'),
        key: 'sourceMatchTable',
        width: 100,
        render: (_, record) => {
          const findSelectedItem = businessSelectedRowKeys.find(e => e === record.value);
          const findDataItem = isArray(data) ? data.find(e => e.authTypeCode === record.value) : {};
          return findSelectedItem ? (
            <Form.Item>
              {form.getFieldDecorator(`${record.value}#sourceMatchTable`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.docType.model.docType.sourceMatchTable').d('来源匹配表'),
                    }),
                  },
                ],
                initialValue: findDataItem ? findDataItem.sourceMatchTable : null,
              })(<Input />)}
            </Form.Item>
          ) : null;
        },
      },
      {
        title: intl.get('hiam.docType.model.docType.value').d('来源匹配字段'),
        dataIndex: 'value',
        width: 100,
        render: value => {
          const findSelectedItem = businessSelectedRowKeys.find(e => e === value);
          const findDataItem = isArray(data) ? data.find(e => e.authTypeCode === value) : {};
          const validaterField = form.getFieldValue(`${value}#supSourceMatchField`);
          return findSelectedItem ? (
            <Form.Item>
              {form.getFieldDecorator(value, {
                rules: [
                  {
                    required: !validaterField,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.docType.model.docType.value').d('来源匹配字段'),
                    }),
                  },
                ],
                initialValue: findDataItem ? findDataItem.sourceMatchField : null,
              })(
                <Input
                  onChange={() => {
                    if (!validaterField) {
                      form.setFieldsValue({
                        [`${value}#supSourceMatchField`]: undefined,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : null;
        },
      },
      {
        key: 'supSourceMatchField',
        title: intl.get('hiam.docType.model.docType.supSourceMatchField').d('供应方匹配字段'),
        width: 100,
        render: (value, record) => {
          const findSelectedItem = businessSelectedRowKeys.find(e => e === record.value);
          const findDataItem = isArray(data) ? data.find(e => e.authTypeCode === record.value) : {};
          const validaterField = form.getFieldValue(`${record.value}`);
          return findSelectedItem ? (
            <Form.Item>
              {form.getFieldDecorator(`${record.value}#supSourceMatchField`, {
                rules: [
                  {
                    required: !validaterField,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docType.model.docType.supSourceMatchField')
                        .d('供应方匹配字段'),
                    }),
                  },
                ],
                initialValue: findDataItem ? findDataItem.supSourceMatchField : null,
              })(
                <Input
                  onChange={() => {
                    if (!validaterField) {
                      form.setFieldsValue({
                        [`${record.value}`]: undefined,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : null;
        },
      },
    ];
    const personalColumns = [
      {
        title: intl.get('hiam.docType.model.docType.userMeaning').d('限定个人用户'),
        dataIndex: 'meaning',
        width: 100,
      },
      {
        key: 'sourceMatchTable',
        title: intl.get('hiam.docType.model.docType.sourceMatchTable').d('来源匹配表'),
        width: 100,
        render: (value, record) => {
          const findSelectedItem = personalSelectedRowKeys.find(e => e === record.value);
          const findDataItem = isArray(data) ? data.find(e => e.authTypeCode === record.value) : {};
          return findSelectedItem ? (
            <Form.Item>
              {form.getFieldDecorator(`${record.value}#sourceMatchTable`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.docType.model.docType.sourceMatchTable').d('来源匹配表'),
                    }),
                  },
                ],
                initialValue: findDataItem ? findDataItem.sourceMatchTable : null,
              })(<Input />)}
            </Form.Item>
          ) : null;
        },
      },
      {
        title: intl.get('hiam.docType.model.docType.value').d('来源匹配字段'),
        dataIndex: 'value',
        width: 100,
        render: value => {
          const findSelectedItem = personalSelectedRowKeys.find(e => e === value);
          const findDataItem = isArray(data) ? data.find(e => e.authTypeCode === value) : {};
          const validaterField = form.getFieldValue(`${value}#supSourceMatchField`);
          return findSelectedItem ? (
            <Form.Item>
              {form.getFieldDecorator(value, {
                rules: [
                  {
                    required: !validaterField,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.docType.model.docType.value').d('来源匹配字段'),
                    }),
                  },
                ],
                initialValue: findDataItem ? findDataItem.sourceMatchField : null,
              })(
                <Input
                  onChange={() => {
                    if (!validaterField) {
                      form.setFieldsValue({
                        [`${value}#supSourceMatchField`]: undefined,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : null;
        },
      },
      {
        key: 'supSourceMatchField',
        title: intl.get('hiam.docType.model.docType.supSourceMatchField').d('供应方匹配字段'),
        width: 100,
        render: (value, record) => {
          const findSelectedItem = personalSelectedRowKeys.find(e => e === record.value);
          const findDataItem = isArray(data) ? data.find(e => e.authTypeCode === record.value) : {};
          const validaterField = form.getFieldValue(`${record.value}`);
          return findSelectedItem ? (
            <Form.Item>
              {form.getFieldDecorator(`${record.value}#supSourceMatchField`, {
                rules: [
                  {
                    required: !validaterField,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.docType.model.docType.supSourceMatchField')
                        .d('供应方匹配字段'),
                    }),
                  },
                ],
                initialValue: findDataItem ? findDataItem.supSourceMatchField : null,
              })(
                <Input
                  onChange={() => {
                    if (!validaterField) {
                      form.setFieldsValue({
                        [`${record.value}`]: undefined,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : null;
        },
      },
    ];

    const businessRowSelection = {
      selectedRowKeys: businessSelectedRowKeys,
      onChange: this.businessOnSelectChange,
    };
    const personalRowSelection = {
      selectedRowKeys: personalSelectedRowKeys,
      onChange: this.personalOnSelectChange,
    };

    return (
      <Spin spinning={loading}>
        <Row gutter={24}>
          <Col span={12}>
            <Divider orientation="left">
              {intl.get('hiam.docType.model.docType.bizMeaning').d('限定业务范围')}
            </Divider>
            <Table
              bordered
              rowKey="value"
              pagination={false}
              dataSource={businessList}
              columns={businessColumns}
              rowSelection={businessRowSelection}
            />
          </Col>
          <Col span={12}>
            <Divider orientation="left">
              {intl.get('hiam.docType.model.docType.userMeaning').d('限定个人用户')}
            </Divider>
            <Table
              bordered
              rowKey="value"
              pagination={false}
              dataSource={personalList}
              columns={personalColumns}
              rowSelection={personalRowSelection}
            />
          </Col>
        </Row>
      </Spin>
    );
  }
}
