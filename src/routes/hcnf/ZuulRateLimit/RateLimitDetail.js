/*
 * EditForm - 限流设置详情
 * @date: 2018/09/11 14:22:13
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Form, Table, Col, Row, Input, Spin, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import { enableRender } from 'utils/renderer';
import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject, tableScrollWidth } from 'utils/utils';

import DetailForm from './DetailForm';
import DetailFilter from './DetailFilter';

const messagePrompt = 'hsgp.zuulRateLimit.view.message';
const modelPrompt = 'hsgp.zuulRateLimit.model.zuulRateLimit';
/**
 * 限流设置详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} zuulRateLimit - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ zuulRateLimit, loading }) => ({
  zuulRateLimit,
  loading: loading.effects['zuulRateLimit/fetchHeaderInformation'],
  saving: loading.effects['zuulRateLimit/detailSave'],
  refreshing: loading.effects['zuulRateLimit/refresh'],
  loadingLines: loading.effects['zuulRateLimit/fetchLines'],
  deletingLines: loading.effects['zuulRateLimit/deleteLines'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hpfm.zuulRateLimit'],
})
@Form.create({ fieldNameProp: null })
export default class EditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      editValue: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询头
   * @param {Object} fields
   */
  @Bind()
  handleSearch(fields) {
    const { dispatch, match } = this.props;
    const { rateLimitId } = match.params;
    dispatch({
      type: 'zuulRateLimit/fetchHeaderInformation',
      payload: { rateLimitId, ...fields },
    });
  }

  /**
   * 查询行
   * @param {Object} page
   */
  @Bind()
  handleSearchLines(page = {}) {
    const { dispatch, match } = this.props;
    const { rateLimitId } = match.params;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue()).option;
    dispatch({
      type: 'zuulRateLimit/fetchLines',
      payload: {
        page,
        ...filterValues,
        rateLimitId,
      },
    });
  }

  /**
   * 新增行
   * @param {Object} fieldsValue
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { editValue } = this.state;
    const {
      dispatch,
      zuulRateLimit: { zuulRateLimitLineList, headerInformation },
    } = this.props;
    const { rateLimitId } = headerInformation;
    if (!editValue.rateLimitLineId) {
      const newZuulRateLimitLineList = [{ ...fieldsValue, rateLimitId }, ...zuulRateLimitLineList];
      dispatch({
        type: 'zuulRateLimit/detailSave',
        payload: {
          ...headerInformation,
          zuulRateLimitLineList: [...newZuulRateLimitLineList],
        },
      }).then(res => {
        if (res) {
          notification.success();
          dispatch({
            type: 'zuulRateLimit/updateState',
            payload: {
              selectedDetailRows: [],
              selectedDetailRowKeys: [],
            },
          });
          this.handleSearch();
        }
      });
    } else {
      const newZuulRateLimitLineList = zuulRateLimitLineList.map(item => {
        if (item.rateLimitLineId === editValue.rateLimitLineId) {
          return { ...editValue, ...fieldsValue };
        }
        return item;
      });
      dispatch({
        type: 'zuulRateLimit/detailSave',
        payload: {
          ...headerInformation,
          zuulRateLimitLineList: [...newZuulRateLimitLineList],
        },
      }).then(res => {
        if (res) {
          notification.success();
          dispatch({
            type: 'zuulRateLimit/updateState',
            payload: {
              selectedDetailRows: [],
              selectedDetailRowKeys: [],
            },
          });
          this.handleSearch();
        }
      });
    }
    this.setState({
      modalVisible: false,
      editValue: {},
    });
  }

  /**
   * 显示编辑框
   * @param {*} record
   */
  @Bind()
  showEditModal(record) {
    this.setState(
      {
        editValue: record,
      },
      this.showModal()
    );
  }

  /**
   * 显示新增弹窗：先重置表单和数据源再显示
   */
  @Bind()
  showAddModal() {
    this.setState(
      {
        editValue: {},
      },
      this.showModal()
    );
  }

  /**
   * 显示弹窗
   */
  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  /**
   * 隐藏弹窗
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 修改弹窗显示状态
   * @param {Boolean} flag
   */
  handleModalVisible(flag) {
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 删除行数据
   */
  @Bind()
  handleDelete() {
    const that = this;
    const {
      zuulRateLimit: { selectedDetailRows },
      dispatch,
    } = this.props;
    if (selectedDetailRows.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示框?'),
        content: intl.get(`${messagePrompt}.title.content`).d('确定删除吗？'),
        onOk() {
          dispatch({
            type: 'zuulRateLimit/deleteLines',
            payload: selectedDetailRows,
          }).then(() => {
            dispatch({
              type: 'zuulRateLimit/updateState',
              payload: {
                selectedDetailRowKeys: [],
                selectedDetailRows: [],
              },
            });
            notification.success();
            that.handleSearch();
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 保存头行
   */
  @Bind()
  handleSave() {
    const {
      form: { validateFields },
      zuulRateLimit: { zuulRateLimitLineList, headerInformation },
      dispatch,
    } = this.props;
    validateFields((errors, values) => {
      if (!errors) {
        const {
          rateLimitType,
          rateLimitKey,
          refreshStatus,
          refreshMessage,
          refreshTime,
          ...newHeaderInformation
        } = values;
        const { rateLimitId } = headerInformation;
        const newZuulRateLimitLineList = zuulRateLimitLineList.map(item => {
          if (item.isNew) {
            const { isNew, rateLimitLineId, ...newItem } = item;
            return { ...newItem, rateLimitId };
          }
          return { ...item, rateLimitId };
        });
        dispatch({
          type: 'zuulRateLimit/detailSave',
          payload: {
            ...headerInformation,
            ...newHeaderInformation,
            zuulRateLimitLineList: [...newZuulRateLimitLineList],
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch();
          }
        });
      }
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectChange(selectedDetailRowKeys, selectedDetailRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'zuulRateLimit/updateState',
      payload: { selectedDetailRowKeys, selectedDetailRows },
    });
  }

  @Bind()
  handleRefresh() {
    const that = this;
    const {
      zuulRateLimit: { headerInformation },
      dispatch,
    } = this.props;
    dispatch({
      type: 'zuulRateLimit/refresh',
      payload: [
        { rateLimitId: headerInformation.rateLimitId, serviceName: headerInformation.serviceName },
      ],
    }).then(res => {
      if (res) {
        notification.success();
        dispatch({
          type: 'zuulRateLimit/updateState',
          payload: {
            selectedDetailRowKeys: [],
          },
        });
        that.handleSearch();
      }
    });
  }

  /**
   * 级联Lov修改
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeServiceName(value, record) {
    const {
      form: { resetFields },
      dispatch,
      zuulRateLimit: { headerInformation },
    } = this.props;
    dispatch({
      type: 'zuulRateLimit/updateState',
      payload: {
        headerInformation: {
          ...headerInformation,
          serviceName: record.name,
          serviceConfLabel: null,
        },
      },
    });
    resetFields(['serviceConfLabel']);
  }

  render() {
    const {
      match,
      saving,
      loading,
      refreshing,
      loadingLines,
      // deletingLines,
      form: { getFieldDecorator, getFieldValue },
      zuulRateLimit: {
        headerInformation,
        zuulRateLimitLineList,
        detailPagination,
        selectedDetailRowKeys,
      },
    } = this.props;
    const { modalVisible, editValue } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedDetailRowKeys,
      onChange: this.handleRowSelectChange,
    };
    let refreshStatus = '';
    if (headerInformation.refreshStatus === 1) {
      refreshStatus = intl.get(`${modelPrompt}.refreshSuccess`).d('刷新成功');
    } else if (headerInformation.refreshStatus === 0) {
      refreshStatus = intl.get(`${modelPrompt}.refreshFailed`).d('刷新失败');
    } else {
      refreshStatus = intl.get(`${modelPrompt}.noRefresh`).d('未刷新');
    }
    const columns = [
      {
        title: intl.get(`${modelPrompt}.routeKey`).d('路由'),
        width: 100,
        dataIndex: 'routeKey',
      },
      {
        title: intl.get(`${modelPrompt}.maxLimit`).d('请求数限制'),
        dataIndex: 'maxLimit',
        width: 150,
      },
      headerInformation.rateLimitType !== 'REDISBUCKET' && {
        title: intl.get(`${modelPrompt}.quota`).d('请求时间限制'),
        dataIndex: 'quota',
        width: 150,
      },
      headerInformation.rateLimitType !== 'REDISBUCKET' && {
        title: intl.get(`${modelPrompt}.refreshInterval`).d('刷新窗口（秒）'),
        dataIndex: 'refreshInterval',
        width: 160,
      },
      headerInformation.rateLimitType === 'REDISBUCKET' && {
        title: intl.get(`${modelPrompt}.rate`).d('令牌产生速率'),
        dataIndex: 'rate',
        width: 150,
      },
      headerInformation.rateLimitType === 'REDISBUCKET' && {
        title: intl.get(`${modelPrompt}.consumeRate`).d('令牌消耗速率'),
        dataIndex: 'consumeRate',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.user`).d('用户维度'),
        dataIndex: 'user',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.tenant`).d('租户维度'),
        dataIndex: 'tenant',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.origin`).d('源请求地址维度'),
        dataIndex: 'origin',
        width: 180,
      },
      {
        title: intl.get(`${modelPrompt}.url`).d('URL维度'),
        dataIndex: 'url',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.enabledFlag`).d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 120,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        width: 120,
        render: (val, record) => (
          <a
            onClick={() => {
              this.showEditModal(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    const newColumns = columns.filter(item => item);
    const basePath = match.path.substring(0, match.path.indexOf('/detail'));

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${messagePrompt}.detail`).d('限流方式定义')}
          backPath={`${basePath}/list`}
        >
          <Button
            icon="save"
            type="primary"
            disabled={loading}
            onClick={this.handleSave}
            loading={saving || loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="sync" onClick={this.handleRefresh} loading={refreshing}>
            {intl.get('hsgp.zuulRateLimit.view.button.refresh').d('刷新配置')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <Form layout="vertical">
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.rateLimitKey`).d('代码')}>
                    {getFieldDecorator('rateLimitKey', {
                      initialValue: headerInformation.rateLimitKey,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.rateLimitType`).d('限流方式')}>
                    {getFieldDecorator('rateLimitType', {
                      initialValue:
                        headerInformation.rateLimitTypeMeaning || headerInformation.rateLimitType,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.remark`).d('说明')}>
                    {getFieldDecorator('remark', {
                      initialValue: headerInformation.remark,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.serviceName`).d('网关服务')}>
                    {getFieldDecorator('serviceName', {
                      initialValue: headerInformation.serviceName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${modelPrompt}.serviceName`).d('网关服务'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="HPFM.DATASOURCE.SERVICE"
                        textValue={headerInformation.serviceName}
                        onChange={this.handleChangeServiceName}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.serviceConfLabel`).d('服务配置标签')}>
                    {getFieldDecorator('serviceConfLabel', {
                      initialValue: headerInformation.serviceConfLabel,
                    })(
                      <Lov
                        code="HSGP.ZUUL.SERVICE_CONFIG"
                        disabled={!headerInformation.serviceName}
                        queryParams={{
                          serviceName:
                            getFieldValue('serviceName') || headerInformation.serviceName,
                        }}
                        textValue={headerInformation.serviceConfLabel}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${modelPrompt}.serviceConfProfile`).d('服务配置Profile')}
                  >
                    {getFieldDecorator('serviceConfProfile', {
                      initialValue: headerInformation.serviceConfProfile,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.refreshStatus`).d('刷新状态')}>
                    {getFieldDecorator('refreshStatus', {
                      initialValue: refreshStatus,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.refreshMessage`).d('刷新消息')}>
                    {getFieldDecorator('refreshMessage', {
                      initialValue: headerInformation.refreshMessage,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.refreshTime`).d('刷新时间')}>
                    {getFieldDecorator('refreshTime', {
                      initialValue: headerInformation.refreshTime,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${modelPrompt}.enabledFlag`).d('是否启用')}>
                    {getFieldDecorator('enabledFlag', {
                      initialValue: headerInformation.enabledFlag === 0 ? 0 : 1,
                    })(<Switch />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <DetailFilter
              onFilterChange={this.handleSearchLines}
              showAddModal={this.showAddModal}
              handleDelete={this.handleDelete}
              onRef={node => {
                this.filterForm = node.props.form;
              }}
            />
            <Table
              rowSelection={rowSelection}
              loading={loadingLines}
              rowKey="rateLimitLineId"
              dataSource={zuulRateLimitLineList}
              columns={newColumns}
              scroll={{ x: tableScrollWidth(newColumns) }}
              bordered
              pagination={detailPagination}
              onChange={this.handleSearchLines}
            />
          </Spin>
        </Content>
        <DetailForm
          title={
            editValue.rateLimitLineId
              ? intl.get(`${messagePrompt}.detailEdit`).d('编辑限流方式')
              : intl.get(`${messagePrompt}.detailAdd`).d('创建限流方式')
          }
          editValue={editValue}
          loading={saving}
          modalVisible={modalVisible}
          headerInformation={headerInformation}
          onOk={this.handleAdd}
          onCancel={this.hideModal}
        />
      </React.Fragment>
    );
  }
}
