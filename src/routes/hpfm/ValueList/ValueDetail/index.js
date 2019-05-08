import React, { Component } from 'react';
import { Button, Form, Table, Col, Row, Input, Modal } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';

import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

import { enableRender, dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { createPagination, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

import DetailForm from './DetailForm';

const { TextArea } = Input;

@connect(({ valueList, loading }) => ({
  valueList,
  loading: loading.effects['valueList/queryLovValues'],
  saving: loading.effects['valueList/saveLovValues'],
  saveHeaderLoading: loading.effects['valueList/saveLovHeaders'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: 'hpfm.valueList',
})
@Form.create({ fieldNameProp: null })
export default class EditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      valueListHeader: {},
      valueListLine: {},
      editValue: {},
      selectedRows: [],
    };
  }

  componentDidMount() {
    const { dispatch, match, tenantId } = this.props;
    const { lovId } = match.params;
    dispatch({
      type: 'valueList/queryLovHeader',
      payload: { lovId, tenantId },
    }).then(res => {
      if (res) {
        this.setState({
          valueListHeader: res,
          editValue: {
            parentTenantId: res.parentTenantId,
            parentLovCode: res.parentLovCode,
          },
        });
        if (res.lovTypeCode === 'IDP') {
          this.loadValueListLine(res.lovId);
        }
      }
    });
  }

  /**
   * 添加或保存值集
   * @param {Object} fieldsValue - 值集详情编辑表单值
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch } = this.props;
    const { editValue, valueListHeader } = this.state;
    const { lovId, lovCode, tenantId } = valueListHeader;
    let { startDateActive, endDateActive } = fieldsValue;
    startDateActive = startDateActive
      ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
      : '';
    endDateActive = startDateActive ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT) : '';

    dispatch({
      type: 'valueList/saveLovValues',
      payload: {
        ...editValue,
        ...fieldsValue,
        startDateActive,
        endDateActive,
        lovId,
        lovCode,
        tenantId,
      },
    }).then(response => {
      if (response) {
        this.hideModal();
        this.loadValueListLine(lovId);
        notification.success();
      }
    });
  }

  /**
   * 显示当前值集侧边栏编辑
   * @param {Object} record - 当前行数据
   */
  @Bind()
  showEditModal(record) {
    const { parentLovCode } = this.state.valueListHeader;
    this.setState(
      {
        editValue: {
          ...record,
          parentLovCode,
        },
      },
      this.showModal()
    );
  }

  /**
   * 显示侧边栏
   */
  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  /**
   * 隐藏侧边栏
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 侧边栏显示控制函数
   * @param {Boolean} flag - 侧边栏显示控制参数
   */
  handleModalVisible(flag) {
    const { parentLovCode } = this.state.valueListHeader;

    if (flag === false) {
      this.setState({
        editValue: {
          parentLovCode,
        },
      });
    }
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 根据值集头查询值集行
   * @param {Number} headerId - 值集头 id
   */
  loadValueListLine(headerId) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'valueList/queryLovValues',
      payload: {
        tenantId,
        lovId: headerId,
        page: 0,
        size: 10,
      },
    }).then(res => {
      if (res) {
        this.setState({
          valueListLine: res,
        });
      }
    });
  }

  /**
   * 值集行分页查询
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handleTableChange(pagination) {
    const { dispatch, match, tenantId } = this.props;
    const { lovId } = match.params;

    const params = {
      tenantId,
      lovId,
      page: pagination.current - 1,
      size: pagination.pageSize,
    };

    dispatch({
      type: 'valueList/queryLovValues',
      payload: params,
    }).then(res => {
      if (res) {
        this.setState({
          valueListLine: res,
        });
      }
    });
  }

  /**
   * 保存值集头
   */
  @Bind()
  handleLovHeader() {
    const { form, dispatch, history, tenantId } = this.props;
    const { valueListHeader } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      // 更新或插入值集头参数
      const params = {
        tenantId,
        ...valueListHeader,
        ...fieldsValue,
      };

      dispatch({
        type: 'valueList/saveLovHeaders',
        payload: params,
      }).then(res => {
        if (res) {
          notification.success();
          this.setState({
            valueListHeader: res,
            editValue: {
              parentLovCode: res.parentLovCode,
            },
          });
          if (res.lovTypeCode === 'IDP') {
            this.loadValueListLine(res.lovId);
          } else {
            history.push(`/hpfm/value-list/list`);
          }
        }
      });
    });
  }

  /**
   * 值集行勾选回调
   * @param {*} _
   * @param {*} selectedRows - 勾选的值集行
   */
  @Bind()
  handleSelectRows(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 取消编辑返回值集列表
   */
  @Bind()
  handleCancel() {
    const { history } = this.props;
    history.push(`/hpfm/value-list/list`);
  }

  /**
   * 删除值集
   */
  @Bind()
  handleDeleteValues() {
    const { dispatch, match, tenantId } = this.props;
    const { selectedRows } = this.state;
    // 删除后刷新传参
    const { lovId } = match.params;

    const onOk = () => {
      dispatch({
        type: 'valueList/deleteLovValues',
        payload: { tenantId, deleteRows: selectedRows },
      }).then(() => {
        this.loadValueListLine(lovId);
        this.setState({
          selectedRows: [],
        });
        notification.success();
      });
    };

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk,
    });
  }

  render() {
    const {
      match,
      saving,
      loading,
      form,
      form: { getFieldDecorator },
      tenantId: currentTenantId,
      saveHeaderLoading = false,
    } = this.props;
    const {
      modalVisible,
      valueListHeader = {},
      selectedRows,
      valueListLine,
      editValue,
    } = this.state;
    const { _token, tenantId } = valueListHeader;
    // op改造，通过层级控制平台级功能的使用，租户可编辑通用的功能
    // const tenantDisable = !valueListHeader.tenantId && !!isTenantRoleLevel();
    const tenantDisable = false;
    // 当前租户是否和数据中的租户对应
    const isCurrentTenant = tenantId !== undefined ? tenantId !== currentTenantId : false;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.lovValueId),
      onChange: this.handleSelectRows,
    };
    const columns = [
      {
        title: intl.get('hpfm.valueList.model.line.value').d('值'),
        align: 'left',
        width: 100,
        dataIndex: 'value',
      },
      {
        title: intl.get('hpfm.valueList.model.line.meaning').d('含义'),
        align: 'left',
        width: 100,
        dataIndex: 'meaning',
      },
      {
        title: intl.get('hpfm.common.model.common.orderSeq').d('排序号'),
        align: 'center',
        width: 100,
        dataIndex: 'orderSeq',
      },
      {
        title: intl.get('hpfm.valueList.model.line.parentValue').d('父级值集值'),
        align: 'center',
        width: 100,
        dataIndex: 'parentMeaning',
      },
      {
        title: intl.get('hpfm.valueList.model.line.tag').d('标记'),
        align: 'left',
        dataIndex: 'tag',
      },
      {
        title: intl.get('hpfm.valueList.model.line.description').d('描述'),
        align: 'left',
        dataIndex: 'description',
      },
      {
        title: intl.get('hpfm.valueList.model.line.startDateActive').d('有效期起'),
        align: 'center',
        width: 100,
        dataIndex: 'startDateActive',
        render: dateRender,
      },
      {
        title: intl.get('hpfm.valueList.model.line.endDateActive').d('有效期止'),
        align: 'center',
        width: 100,
        dataIndex: 'endDateActive',
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        render: (_, record) =>
          tenantDisable ? (
            <span style={{ color: '#aaa' }}>{intl.get('hzero.common.button.edit').d('编辑')}</span>
          ) : (
            <a onClick={() => this.showEditModal(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ),
      },
    ];

    const basePath = match.path.substring(0, match.path.indexOf('/detail'));

    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.valueList.view.title.valueDetail').d('值集数据定义')}
          backPath={`${basePath}/list`}
        >
          {isCurrentTenant ? null : (
            <React.Fragment>
              <Button
                type="primary"
                onClick={this.handleLovHeader}
                disabled={isCurrentTenant}
                loading={saveHeaderLoading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                style={{ marginLeft: 12 }}
                onClick={this.handleCancel}
                disabled={isCurrentTenant}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Form layout="vertical" style={{ width: 900 }}>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label={intl.get('hpfm.valueList.model.header.lovCode').d('值集编码')}>
                  {getFieldDecorator('lovCode', {
                    initialValue: valueListHeader.lovCode,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}>
                  {getFieldDecorator('lovName', {
                    initialValue: valueListHeader.lovName,
                  })(
                    <TLEditor
                      disabled={tenantId !== currentTenantId}
                      label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
                      field="lovName"
                      token={_token}
                    />
                  )}
                </Form.Item>
              </Col>
              {!isTenantRoleLevel() && (
                <Col span={6}>
                  <Form.Item
                    label={intl.get('hpfm.valueList.model.header.tenantName').d('所属租户')}
                  >
                    {getFieldDecorator('tenantName', {
                      initialValue: valueListHeader.tenantName,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label={intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型')}
                >
                  {getFieldDecorator('lovTypeCode', {
                    initialValue: valueListHeader.lovTypeCode,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              {form.getFieldsValue().lovTypeCode === 'URL' ||
              form.getFieldsValue().lovTypeCode === 'SQL' ? (
                <Col span={6}>
                  <Form.Item
                    label={intl.get('hpfm.valueList.model.header.routeName').d('目标路由名')}
                  >
                    {getFieldDecorator('routeName', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.valueList.model.header.routeName').d('目标路由名'),
                          }),
                        },
                      ],
                      initialValue: valueListHeader.routeName,
                    })(
                      <Lov
                        code="HCNF.ROUTE.SERVICE_PATH"
                        textValue={valueListHeader.routeName}
                        disabled
                      />
                    )}
                  </Form.Item>
                </Col>
              ) : (
                <Col span={6}>
                  <Form.Item
                    label={intl.get('hpfm.valueList.model.header.parentLovCode').d('父级值集')}
                  >
                    {getFieldDecorator('parentLovCode', {
                      initialValue: valueListHeader.parentLovCode,
                    })(
                      <Lov
                        code={
                          isTenantRoleLevel()
                            ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
                            : 'HPFM.LOV.LOV_DETAIL_CODE'
                        }
                        textValue={valueListHeader.parentLovName}
                        disabled
                      />
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col span={4}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: valueListHeader.enabledFlag,
                  })(<Switch disabled={isCurrentTenant} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="valueField">
                  {getFieldDecorator('valueField', {
                    initialValue: valueListHeader.valueField,
                  })(<Input disabled={isCurrentTenant} />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="displayField">
                  {getFieldDecorator('displayField', {
                    initialValue: valueListHeader.displayField,
                  })(<Input disabled={isCurrentTenant} />)}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={intl.get('hpfm.valueList.model.header.mustPageFlag').d('是否分页')}
                >
                  {getFieldDecorator('mustPageFlag', {
                    initialValue: valueListHeader.mustPageFlag,
                  })(<Switch disabled={isCurrentTenant} />)}
                </Form.Item>
              </Col>
            </Row>
            {form.getFieldsValue().lovTypeCode === 'SQL' ? (
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item
                    label={intl
                      .get('hpfm.valueList.model.header.valueTableAlias')
                      .d('值字段所在表别名')}
                  >
                    {getFieldDecorator('valueTableAlias', {
                      initialValue: valueListHeader.valueTableAlias,
                    })(<Input disabled={isCurrentTenant} />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl
                      .get('hpfm.valueList.model.header.meaningTableAlias')
                      .d('含义字段所在表别名')}
                  >
                    {getFieldDecorator('meaningTableAlias', {
                      initialValue: valueListHeader.meaningTableAlias,
                    })(<Input disabled={isCurrentTenant} />)}
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={intl.get('hpfm.valueList.model.header.description').d('描述')}>
                  {getFieldDecorator('description', {
                    initialValue: valueListHeader.description,
                  })(
                    <TLEditor
                      label={intl.get('hpfm.valueList.model.header.description').d('描述')}
                      field="description"
                      token={_token}
                      disabled={isCurrentTenant}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                {form.getFieldsValue().lovTypeCode === 'URL' ? (
                  <Form.Item
                    label={intl.get('hpfm.valueList.model.header.customUrl').d('查询 URL')}
                  >
                    {getFieldDecorator('customUrl', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.valueList.model.header.customUrl').d('查询 URL'),
                          }),
                        },
                      ],
                      initialValue: valueListHeader.customUrl || '',
                    })(<Input disabled={isCurrentTenant} />)}
                  </Form.Item>
                ) : null}
                {form.getFieldsValue().lovTypeCode === 'SQL' ? (
                  <Form.Item
                    label={intl.get('hpfm.valueList.model.header.customSql').d('查询 SQL')}
                  >
                    {getFieldDecorator('customSql', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.valueList.model.header.customSql').d('查询 SQL'),
                          }),
                        },
                      ],
                      initialValue: valueListHeader.customSql || '',
                    })(<TextArea rows={12} disabled={isCurrentTenant} />)}
                  </Form.Item>
                ) : null}
              </Col>
            </Row>
          </Form>

          {/* 独立值集展示表格 */}
          {form.getFieldsValue().lovTypeCode === 'IDP' ? (
            <React.Fragment>
              {isCurrentTenant ? null : (
                <div className="table-list-operator">
                  <Button icon="plus" onClick={this.showModal}>
                    {intl.get('hpfm.valueList.view.button.add').d('新增值')}
                  </Button>
                  <Button
                    icon="delete"
                    onClick={this.handleDeleteValues}
                    disabled={this.state.selectedRows.length === 0}
                  >
                    {intl.get('hpfm.valueList.view.button.delete').d('删除值')}
                  </Button>
                </div>
              )}
              <Table
                bordered
                style={{
                  margin: '20px 0',
                }}
                rowSelection={rowSelection}
                loading={loading}
                rowKey="lovValueId"
                dataSource={valueListLine.content}
                columns={columns}
                pagination={createPagination(valueListLine)}
                onChange={this.handleTableChange}
              />
            </React.Fragment>
          ) : null}
        </Content>
        <DetailForm
          title={
            editValue.lovValueId
              ? intl.get('hpfm.valueList.view.title.editForm').d('编辑值')
              : intl.get('hpfm.valueList.view.title.createForm').d('创建值')
          }
          editValue={editValue}
          saveLoading={saving}
          modalVisible={modalVisible}
          onOk={this.handleAdd}
          onCancel={this.hideModal}
        />
      </React.Fragment>
    );
  }
}
