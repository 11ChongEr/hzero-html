/**
 * reportDataSet - 报表平台/数据集
 * @date: 2018-11-19
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Tabs, Row, Col, Select, Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, filter, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Lov from 'components/Lov';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { onBeforeMenuTabRemove, deleteBeforeMenuTabRemove } from 'utils/menuTab';

import ParamsTable from './ParamsTable';
import MetadataTable from './MetadataTable';
import MetadataDrawer from './MetadataDrawer';
import ParamsDrawer from './ParamsDrawer';
import SqlDrawer from './SqlDrawer';
import XmlSampleDrawer from './XmlSampleDrawer';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const { TextArea } = Input;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
/**
 * 数据集-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} reportDataSet - 数据源
 * @reactProps {!Object} fetchApproveHeaderLoading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hrpt.reportDataSet', 'entity.tenant'] })
@Form.create({ fieldNameProp: null })
@connect(({ reportDataSet, loading }) => ({
  reportDataSet,
  tenantRoleLevel: isTenantRoleLevel(),
  fetchDataSetDetailLoading: loading.effects['reportDataSet/fetchDataSetDetail'],
  getMetadataLoading: loading.effects['reportDataSet/getMetadata'],
  getParametersLoading: loading.effects['reportDataSet/getParameters'],
  saving:
    loading.effects['reportDataSet/updateDataSet'] ||
    loading.effects['reportDataSet/createDataSet'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {
    paramsItem: {}, // 参数表格中的一条记录
    metadataItem: {}, // 元数据表格中的一条数据
    paramsDrawerVisible: false, // 参数模态框
    metadataDrawerVisible: false, // 元数据模态框
    sqlDrawerVisible: false, // sql模态框
    xmlSampleDrawerVisible: false, // xmlSample示例模态框
    paramsSelectedRowKeys: [], // 参数选中行
    metadataSelectedRowKeys: [], // 元数据选中行
    isQueryParamsTab: false, // 标签页
    enableChangeDataSource: true, // 能否改变数据源
    isChangeContent: false, // 是否改变
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
    onBeforeMenuTabRemove('/hrpt/data-set', () => {
      return new Promise((resolve, reject) => {
        const { isChangeContent } = this.state;
        if (isChangeContent) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              resolve();
            },
            onCancel: () => {
              reject();
            },
          });
        } else {
          resolve();
        }
      });
    });
  }

  componentWillUnmount() {
    deleteBeforeMenuTabRemove('/hrpt/data-set');
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'reportDataSet/fetchDataSetDetail',
        payload: {
          datasetId: id,
        },
      });
    } else {
      dispatch({
        type: 'reportDataSet/updateState',
        payload: {
          header: {},
        },
      });
      this.setState({ enableChangeDataSource: true });
    }
    const lovCodes = {
      sqlTypeMeaning: 'HRPT.DATASET_SQL_TYPE',
      dataSource: 'HRPT.PARAM_DATA_SOURCE',
      formElement: 'HRPT.PARAM_FORM_ELEMENT',
      dataType: 'HRPT.PARAM_DATA_TYPE',
    };
    // 初始化 值集
    dispatch({
      type: `reportDataSet/batchCode`,
      payload: {
        lovCodes,
      },
    });
    this.setState({ isChangeContent: false });
  }

  /**
   * 初始化元数据
   */
  @Bind()
  getMetadata() {
    const {
      form,
      dispatch,
      match,
      reportDataSet: { header = {} },
    } = this.props;
    const { id } = match.params;
    form.validateFields(['sqlText', 'datasourceId', 'tenantId'], (err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDataSet/getMetadata',
          payload: { ...values, datasetId: id, header },
        }).then(res => {
          if (res) {
            this.setState({ enableChangeDataSource: false });
            this.handleUpdateState();
          }
        });
      }
    });
  }

  /**
   * 初始化参数
   */
  @Bind()
  getParameters() {
    const {
      form,
      dispatch,
      match,
      reportDataSet: { header = {} },
    } = this.props;
    const { id } = match.params;
    form.validateFields(['sqlText', 'datasourceId', 'tenantId'], (err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDataSet/getParameters',
          payload: { ...values, datasetId: id, header },
        }).then(res => {
          if (res) {
            this.setState({ enableChangeDataSource: false });
            this.handleUpdateState();
          }
        });
      }
    });
  }

  /**
   * 预览sql
   */
  @Bind()
  previewSql() {
    const { form, dispatch } = this.props;
    form.validateFields(['sqlText', 'datasourceId', 'tenantId'], (err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDataSet/previewSql',
          payload: values,
        }).then(res => {
          if (res) {
            this.setState({
              sqlDrawerVisible: true,
            });
          }
        });
      }
    });
  }

  /**
   * 确定sql模态框回调
   */
  @Bind()
  handleSqlDrawerOk() {
    const { dispatch } = this.props;
    this.setState({ sqlDrawerVisible: false });
    dispatch({
      type: 'reportDataSet/updateState',
      payload: { sqlContent: {} },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      tenantRoleLevel,
      tenantId,
      dispatch,
      form,
      match,
      reportDataSet: { header = {} },
    } = this.props;
    const { queryParams = [], metaColumns = [] } = header;
    form.validateFields((err, values) => {
      if (!err) {
        if (isUndefined(match.params.id)) {
          dispatch({
            type: 'reportDataSet/createDataSet', // 新增逻辑
            payload: {
              queryParams: JSON.stringify(queryParams),
              metaColumns: JSON.stringify(metaColumns),
              tenantId: tenantRoleLevel ? tenantId : values.tenantId,
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hrpt/data-set/detail/${res.datasetId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'reportDataSet/updateDataSet', // 更新逻辑
            payload: {
              ...header,
              queryParams: JSON.stringify(queryParams),
              metaColumns: JSON.stringify(metaColumns),
              tenantId: tenantRoleLevel ? tenantId : values.tenantId,
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
      }
    });
  }

  /**
   * 元数据-新建打开滑窗
   */
  @Bind()
  handleAddMetadata() {
    this.setState({ metadataDrawerVisible: true, metadataItem: {} });
  }

  /**
   * 元数据-关闭滑窗
   */
  @Bind()
  handleCancelMetadata() {
    this.setState({ metadataDrawerVisible: false, metadataItem: {} });
  }

  /**
   * 元数据-新增滑窗保存操作
   */
  @Bind()
  handleSaveMetadataContent(values) {
    const {
      dispatch,
      reportDataSet: { header = {} },
    } = this.props;
    const { metaColumns = [], ...otherValues } = header;
    dispatch({
      type: 'reportDataSet/updateState',
      payload: {
        header: { metaColumns: [...metaColumns, values], ...otherValues },
      },
    });
    this.setState({ metadataDrawerVisible: false, metadataItem: {} });
    this.handleUpdateState();
  }

  /**
   * 元数据-编辑打开滑窗
   */
  @Bind()
  handleEditMetadataContent(record) {
    this.setState({ metadataDrawerVisible: true, metadataItem: { ...record } });
  }

  /**
   * 元数据-编辑保存滑窗
   */
  @Bind()
  handleEditMetadataOk(values) {
    const {
      dispatch,
      reportDataSet: { header = {} },
    } = this.props;
    const { metaColumns = [], ...otherValues } = header;
    const newList = metaColumns.map(item => {
      if (item.ordinal === values.ordinal) {
        return values;
      }
      return item;
    });
    dispatch({
      type: 'reportDataSet/updateState',
      payload: { header: { metaColumns: newList, ...otherValues } },
    });
    this.setState({ metadataDrawerVisible: false, metadataItem: {} });
    this.handleUpdateState();
  }

  /**
   * 元数据-获取删除选中行
   */
  @Bind()
  handleMetadataRowSelectChange(selectedRowKeys) {
    this.setState({ metadataSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 元数据-批量删除
   */
  @Bind()
  handleDeleteMetadata() {
    const {
      dispatch,
      reportDataSet: { header = {} },
    } = this.props;
    const { metaColumns = [], ...otherValues } = header;
    const { metadataSelectedRowKeys } = this.state;
    const newParameters = filter(metaColumns, item => {
      return metadataSelectedRowKeys.indexOf(item.ordinal) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'reportDataSet/updateState',
          payload: {
            header: { metaColumns: [...newParameters], ...otherValues },
          },
        });
        this.setState({ metadataSelectedRowKeys: [] });
        this.handleUpdateState();
      },
    });
  }

  /**
   * 元数据-序号唯一性校验
   */
  @Bind()
  checkUniqueMetadata(rule, value, callback) {
    const {
      reportDataSet: { header },
    } = this.props;
    const { metaColumns = [] } = header;
    const metadataId = metaColumns.map(item => item.ordinal);
    if (!isEmpty(metadataId)) {
      if (metadataId.some(item => item === +value)) {
        callback(
          intl
            .get('hrpt.reportDataSet.view.reportDataSet.validateOrdinal')
            .d('序号已存在，请输入其他序号')
        );
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  /**
   * 参数-新增滑窗保存操作
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveParamsContent(values) {
    const {
      dispatch,
      reportDataSet: { header = {} },
    } = this.props;
    const { queryParams = [], ...otherValues } = header;
    dispatch({
      type: 'reportDataSet/updateState',
      payload: {
        header: { queryParams: [...queryParams, values], ...otherValues },
      },
    });
    this.setState({ paramsDrawerVisible: false, paramsItem: {} });
    this.handleUpdateState();
  }

  // 参数-编辑保存滑窗
  @Bind()
  handleEditParamsOk(values) {
    const {
      dispatch,
      reportDataSet: { header = {} },
    } = this.props;
    const { queryParams = [], ...otherValues } = header;
    const newList = queryParams.map(item => {
      if (item.ordinal === values.ordinal) {
        return values;
      }
      return item;
    });
    dispatch({
      type: 'reportDataSet/updateState',
      payload: { header: { queryParams: newList, ...otherValues } },
    });
    this.setState({ paramsDrawerVisible: false, paramsItem: {} });
    this.handleUpdateState();
  }

  /**
   * 参数-批量删除
   */
  @Bind()
  handleDeleteParams() {
    const {
      dispatch,
      reportDataSet: { header = {} },
    } = this.props;
    const { queryParams = [], ...otherValues } = header;
    const { paramsSelectedRowKeys } = this.state;
    const newParameters = filter(queryParams, item => {
      return paramsSelectedRowKeys.indexOf(item.ordinal) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'reportDataSet/updateState',
          payload: {
            header: { queryParams: [...newParameters], ...otherValues },
          },
        });
        this.setState({ paramsSelectedRowKeys: [] });
        this.handleUpdateState();
      },
    });
  }

  /**
   * 参数-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleParamsRowSelectChange(selectedRowKeys) {
    this.setState({ paramsSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 参数-新建打开滑窗
   */
  @Bind()
  handleAddParams() {
    this.setState({ paramsDrawerVisible: true, paramsItem: {} });
  }

  /**
   * 参数- 行编辑打开滑窗
   * @param {object} record - 参数对象
   */
  @Bind()
  handleEditParamsContent(record) {
    this.setState({ paramsDrawerVisible: true, paramsItem: { ...record } });
  }

  /**
   * 参数-滑窗取消操作
   */
  @Bind()
  handleCancelParams() {
    this.setState({
      paramsDrawerVisible: false,
      paramsItem: {},
    });
  }

  /**
   * 参数-序号唯一性校验
   */
  @Bind()
  checkUniqueParams(rule, value, callback) {
    const {
      reportDataSet: { header },
    } = this.props;
    const { queryParams = [] } = header;
    const paramsId = queryParams.map(item => item.ordinal);
    if (!isEmpty(paramsId)) {
      if (paramsId.some(item => item === +value)) {
        callback(
          intl
            .get('hrpt.reportDataSet.view.reportDataSet.validateOrdinal')
            .d('序号已存在，请输入其他序号')
        );
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  /**
   * xml-打开xml滑窗
   */
  @Bind()
  getXmlSample() {
    const {
      form,
      dispatch,
      match,
      reportDataSet: { header = {} },
    } = this.props;
    const { id } = match.params;
    form.validateFields(['sqlText', 'datasourceId', 'tenantId'], (err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDataSet/getParameters',
          payload: { ...values, datasetId: id, header },
        });
      }
    });
    this.setState({ xmlSampleDrawerVisible: true });
  }

  /**
   * xml-关闭xml滑窗
   */
  @Bind()
  handleXmlSampleDrawerOk() {
    const { dispatch } = this.props;
    this.setState({ xmlSampleDrawerVisible: false });
    dispatch({
      type: 'reportDataSet/updateState',
      payload: { xmlSampleContent: {} },
    });
  }

  /**
   * Xml-获取xml示例数据
   */
  @Bind()
  handleGetXmlSample(queryParams, drawerForm) {
    const { dispatch, form } = this.props;
    form.validateFields(['sqlText', 'datasourceId'], (err, fieldValues) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDataSet/handleGetXmlSample',
          payload: { ...fieldValues, queryParams: JSON.stringify(queryParams) },
        }).then(res => {
          if (res) {
            drawerForm.setFieldsValue({ xmlSample: res.content });
          }
        });
      }
    });
  }

  /**
   * tab标签页-改变
   */
  @Bind()
  changeTabs(activeKey) {
    if (activeKey === 'queryParams') {
      this.setState({
        isQueryParamsTab: true,
      });
    } else {
      this.setState({
        isQueryParamsTab: false,
      });
    }
  }

  /**
   * 改变表单时
   */
  @Bind()
  handleUpdateState() {
    const { isChangeContent } = this.state;
    if (isChangeContent === false) {
      this.setState({ isChangeContent: true });
    }
  }

  /**
   * 改变租户
   */
  @Bind()
  changeTenantId() {
    const { form } = this.props;
    form.setFieldsValue({ datasourceId: undefined });
    this.handleUpdateState();
  }

  renderHeaderForm() {
    const {
      form: { getFieldDecorator, getFieldValue },
      reportDataSet: {
        header = {},
        code: { sqlTypeMeaning = [] },
      },
      match,
      tenantRoleLevel,
      tenantId,
    } = this.props;
    const { enableChangeDataSource } = this.state;
    const { metaColumns = [] } = header;
    return (
      <Form>
        <Row>
          {!tenantRoleLevel && (
            <Col span={8}>
              <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                {getFieldDecorator('tenantId', {
                  initialValue: header.tenantId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.tenant.tag').d('租户'),
                      }),
                    },
                  ], // 校验规则
                })(
                  <Lov
                    code="HPFM.TENANT"
                    textValue={header.tenantName}
                    disabled={!isUndefined(header.tenantId)}
                    onChange={this.changeTenantId}
                  />
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item
              label={intl.get('hrpt.reportDataSet.model.reportDataSet.datasetCode').d('数据集代码')}
              {...formLayout}
            >
              {getFieldDecorator('datasetCode', {
                initialValue: header.datasetCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDataSet.model.reportDataSet.datasetCode')
                        .d('数据集代码'),
                    }),
                  },
                ], // 校验规则
              })(
                <Input
                  typeCase="upper"
                  trim
                  inputChinese={false}
                  disabled={!isUndefined(header.datasetCode)}
                  onChange={this.handleUpdateState}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称')}
              {...formLayout}
            >
              {getFieldDecorator('datasetName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDataSet.model.reportDataSet.datasetName')
                        .d('数据集名称'),
                    }),
                  },
                ],
                initialValue: header.datasetName,
              })(<Input onChange={this.handleUpdateState} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get('hrpt.reportDataSet.model.reportDataSet.datasourceId').d('数据源')}
              {...formLayout}
            >
              {getFieldDecorator('datasourceId', {
                initialValue: header.datasourceId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDataSet.model.reportDataSet.datasourceId')
                        .d('数据源'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HPFM.DATASOURCE"
                  textValue={header.datasourceName}
                  disabled={
                    !enableChangeDataSource ||
                    !isUndefined(header.datasourceId) ||
                    (isUndefined(getFieldValue('tenantId')) && !tenantRoleLevel)
                  }
                  queryParams={{
                    enabledFlag: 1,
                    tenantId: tenantRoleLevel ? tenantId : getFieldValue('tenantId'),
                    dsPurposeCode: 'DR',
                  }}
                  onChange={this.handleUpdateState}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get('hrpt.reportDataSet.model.reportDataSet.sqlType').d('sql类型')}
              {...formLayout}
            >
              {getFieldDecorator('sqlType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hrpt.reportDataSet.model.reportDataSet.sqlType').d('sql类型'),
                    }),
                  },
                ],
                initialValue: header.sqlType,
              })(
                <Select
                  allowClear
                  onChange={this.handleUpdateState}
                  disabled={!isUndefined(getFieldValue('sqlType')) && metaColumns.length !== 0}
                >
                  {sqlTypeMeaning &&
                    sqlTypeMeaning.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
              {getFieldDecorator('remark', {
                initialValue: header.remark,
              })(<Input onChange={this.handleUpdateState} />)}
            </Form.Item>
          </Col>
          {!tenantRoleLevel ? (
            <React.Fragment>
              <Col span={16}>
                <Form.Item
                  label={intl.get('hrpt.reportDataSet.model.reportDataSet.sqlText').d('SQL语句')}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 19 }}
                >
                  {getFieldDecorator('sqlText', {
                    initialValue: header.sqlText,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hrpt.reportDataSet.model.reportDataSet.sqlText')
                            .d('SQL语句'),
                        }),
                      },
                    ],
                  })(
                    <TextArea
                      autosize={{ minRows: 4, maxRows: 8 }}
                      onChange={this.handleUpdateState}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: isUndefined(match.params.id) ? 1 : header.enabledFlag,
                  })(<Switch onChange={this.handleUpdateState} />)}
                </Form.Item>
              </Col>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Col span={8}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: isUndefined(match.params.id) ? 1 : header.enabledFlag,
                  })(<Switch onChange={this.handleUpdateState} />)}
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  label={intl.get('hrpt.reportDataSet.model.reportDataSet.sqlText').d('SQL语句')}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 19 }}
                >
                  {getFieldDecorator('sqlText', {
                    initialValue: header.sqlText,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hrpt.reportDataSet.model.reportDataSet.sqlText')
                            .d('SQL语句'),
                        }),
                      },
                    ],
                  })(
                    <TextArea
                      autosize={{ minRows: 4, maxRows: 8 }}
                      onChange={this.handleUpdateState}
                    />
                  )}
                </Form.Item>
              </Col>
            </React.Fragment>
          )}
        </Row>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchDataSetDetailLoading,
      getMetadataLoading,
      getParametersLoading,
      saving,
      match,
      form,
      reportDataSet: {
        header = {},
        code: { dataSource = [], formElement = [], dataType = [] },
        sqlContent = {},
        xmlSampleContent = {},
      },
    } = this.props;
    const {
      paramsItem = {},
      metadataItem = {},
      paramsDrawerVisible = false,
      metadataDrawerVisible = false,
      sqlDrawerVisible = false,
      xmlSampleDrawerVisible = false,
      paramsSelectedRowKeys = [],
      metadataSelectedRowKeys = [],
      isQueryParamsTab,
      isChangeContent,
    } = this.state;
    const paramsRowSelection = {
      paramsSelectedRowKeys,
      onChange: this.handleParamsRowSelectChange,
    };
    const metadataRowSelection = {
      metadataSelectedRowKeys,
      onChange: this.handleMetadataRowSelectChange,
    };
    const datasetCode = form.getFieldValue('datasetCode');
    const spinning = isUndefined(match.params.id) ? false : fetchDataSetDetailLoading;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hrpt.reportDataSet.view.message.title.add').d('数据集 - 添加')
      : intl.get('hrpt.reportDataSet.view.message.title.edit').d('数据集 - 编辑');
    const metadataTitle = metadataItem.ordinal
      ? intl.get('hrpt.reportDataSet.view.message.metadataDrawer.edit').d('编辑元数据')
      : intl.get('hrpt.reportDataSet.view.message.metadataDrawer.add').d('添加元数据');
    const paramsTitle = paramsItem.ordinal
      ? intl.get('hrpt.reportDataSet.view.message.paramsDrawer.edit').d('编辑参数')
      : intl.get('hrpt.reportDataSet.view.message.paramsDrawer.add').d('添加参数');
    const metadataProps = {
      metadataRowSelection,
      loading: getMetadataLoading,
      dataSource: header.metaColumns,
      onEdit: this.handleEditMetadataContent,
    };
    const paramsProps = {
      formElement,
      dataType,
      paramsRowSelection,
      dataSourceType: dataSource,
      loading: getParametersLoading,
      dataSource: header.queryParams,
      onEdit: this.handleEditParamsContent,
    };
    const metadataDrawerProps = {
      metadataTitle,
      anchor: 'right',
      visible: metadataDrawerVisible,
      itemData: metadataItem,
      onOk: this.handleSaveMetadataContent,
      onCancel: this.handleCancelMetadata,
      onEditOk: this.handleEditMetadataOk,
      onCheckUnique: this.checkUniqueMetadata,
    };
    const paramsDrawerProps = {
      paramsTitle,
      formElement,
      dataType,
      dataSourceType: dataSource,
      anchor: 'right',
      visible: paramsDrawerVisible,
      itemData: paramsItem,
      onOk: this.handleSaveParamsContent,
      onCancel: this.handleCancelParams,
      onEditOk: this.handleEditParamsOk,
      onCheckUnique: this.checkUniqueParams,
    };
    const sqlDrawerProps = {
      sqlDrawerVisible,
      sqlContent,
      onOk: this.handleSqlDrawerOk,
    };
    const xmlSampleProps = {
      dataType,
      xmlSampleContent,
      datasetCode,
      visible: xmlSampleDrawerVisible,
      anchor: 'right',
      loading: getParametersLoading,
      onCancel: this.handleXmlSampleDrawerOk,
      onOk: this.handleXmlSampleDrawerOk,
      queryParams: header.queryParams,
      onGetXmlSample: this.handleGetXmlSample,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} isChange={isChangeContent} backPath="/hrpt/data-set/list">
          <Button icon="save" type="primary" onClick={this.handleSave} loading={saving}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="hdd"
            onClick={this.getMetadata}
            disabled={form.getFieldValue('sqlType') === 'C'}
          >
            {intl.get('hrpt.reportDataSet.view.button.metaColumns').d('初始化元数据')}
          </Button>
          <Button icon="hdd" onClick={this.getParameters}>
            {intl.get('hrpt.reportDataSet.view.button.queryParams').d('初始化参数')}
          </Button>
          <Button icon="search" onClick={this.previewSql}>
            {intl.get('hrpt.reportDataSet.view.button.sqlValidate').d('SQL预览')}
          </Button>
          <Button icon="hdd" onClick={this.getXmlSample}>
            {intl.get('hrpt.reportDataSet.view.button.xmlSample').d('XML示例')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={spinning}>
            {this.renderHeaderForm()}
            <div className="table-list-operator">
              <Button
                icon="plus"
                onClick={isQueryParamsTab ? this.handleAddParams : this.handleAddMetadata}
                disabled={!isQueryParamsTab && form.getFieldValue('sqlType') === 'C'}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                icon="minus"
                onClick={isQueryParamsTab ? this.handleDeleteParams : this.handleDeleteMetadata}
                disabled={
                  isQueryParamsTab
                    ? paramsSelectedRowKeys.length === 0
                    : metadataSelectedRowKeys.length === 0
                }
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </div>
            <Tabs defaultActiveKey="metaData" onChange={this.changeTabs} animated={false}>
              <Tabs.TabPane
                tab={intl.get('hrpt.reportDataSet.view.tab.metaColumns').d('元数据信息')}
                key="metaData"
              >
                <MetadataTable {...metadataProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('hrpt.reportDataSet.view.tab.queryParams').d('参数信息')}
                key="queryParams"
              >
                <ParamsTable {...paramsProps} />
              </Tabs.TabPane>
            </Tabs>
            <MetadataDrawer {...metadataDrawerProps} />
            <ParamsDrawer {...paramsDrawerProps} />
            <SqlDrawer {...sqlDrawerProps} />
            <XmlSampleDrawer {...xmlSampleProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
