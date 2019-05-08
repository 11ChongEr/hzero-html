/**
 * reportDefinition - 报表平台/报表定义
 * @date: 2018-11-19
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Tabs, Row, Col, Select, Modal, InputNumber, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, filter, isEmpty, isFinite } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { onBeforeMenuTabRemove, deleteBeforeMenuTabRemove } from 'utils/menuTab';
import MetaColumnsTable from './MetaColumnsTable';
import MetaColumnsDrawer from './MetaColumnsDrawer';
import TemplateTable from './TemplateTable';
import TemplateDrawer from './TemplateDrawer';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
/**
 * 报表定义-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} reportDefinition - 数据源
 * @reactProps {!Object} fetchApproveHeaderLoading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hrpt.reportDefinition', 'entity.tenant', 'entity.lang', 'entity.template'],
})
@Form.create({ fieldNameProp: null })
@connect(({ reportDefinition, loading }) => ({
  reportDefinition,
  tenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
  fetchDefinitionDetailLoading: loading.effects['reportDefinition/fetchReportDefinitionDetail'],
  getMetaColumnsLoading: loading.effects['reportDefinition/getMetaMetaColumns'],
  getTemplateListLoading: loading.effects['reportDefinition/fetchInitTemplate'],
  fetchTemplateDetailLoading: loading.effects['reportDefinition/fetchTemplateDetail'],
  createTemplateLoading: loading.effects['reportDefinition/createTemplate'],
  saving:
    loading.effects['reportDefinition/createReportDefinition'] ||
    loading.effects['reportDefinition/updateReportDefinition'],
}))
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {
    metaColumnsItem: {}, // 列信息表格中的一条数据
    metaColumnsDrawerVisible: false, // 列信息模态框
    templateDrawerVisible: false, // 模板模态框
    metaColumnsSelectedRowKeys: [], // 列信息选中行
    templateSelectedRowKeys: [], // 模板选中行
    templateListSelectedRowKeys: [], // 模板列表选中行
    isTemplateTab: false, // 标签页
    isCreateMetaColumn: false, // 是否新建列信息
    isChangeContent: false, // 是否改变内容
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
    onBeforeMenuTabRemove('/hrpt/report-definition', () => {
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
    deleteBeforeMenuTabRemove('/hrpt/report-definition');
    this.props.dispatch({
      type: 'reportDefinition/updateState',
      payload: {
        header: {},
        template: [],
      },
    });
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'reportDefinition/fetchReportDefinitionDetail',
        payload: {
          reportId: id,
        },
      });
    } else {
      dispatch({
        type: 'reportDefinition/updateState',
        payload: {
          header: {},
          template: [],
        },
      });
    }
    const lovCodes = {
      reportTypeCode: 'HRPT.REPORT_TYPE', // 报表类型
      layout: 'HRPT.LAYOUT_TYPE', // 布局位置
      type: 'HRPT.COLUMN_TYPE', // 布局类型
      sortType: 'HRPT.COLUMN_SORT_TYPE', // 排序类型
      templateTypeCode: 'HRPT.TEMPLATE_TYPE', // 模板类型
    };
    // 初始化 值集
    dispatch({
      type: 'reportDefinition/batchCode',
      payload: {
        lovCodes,
      },
    });
    this.setState({ isChangeContent: false });
  }

  /**
   * 初始化列信息
   */
  @Bind()
  getMetaMetaColumns() {
    const {
      form,
      dispatch,
      match,
      reportDefinition: { header = {} },
    } = this.props;
    const { id } = match.params;
    form.validateFields(['datasetId', 'tenantId', 'reportTypeCode'], (err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDefinition/getMetaMetaColumns',
          payload: { ...values, reportId: id, header },
        }).then(res => {
          if (res) {
            this.handleUpdateState();
          }
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form,
      match,
      reportDefinition: { header = {} },
    } = this.props;
    const { metaColumns = [] } = header;
    form.validateFields((err, values) => {
      const { layout = undefined, statColumnLayout = undefined, ...otherValues } = values;
      const options = { layout, statColumnLayout };
      if (!err) {
        if (isUndefined(match.params.id)) {
          dispatch({
            type: 'reportDefinition/createReportDefinition', // 新增逻辑
            payload: {
              metaColumns: JSON.stringify(metaColumns),
              options: JSON.stringify(options),
              ...otherValues,
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hrpt/report-definition/detail/${res.reportId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'reportDefinition/updateReportDefinition', // 更新逻辑
            payload: {
              ...header,
              metaColumns: JSON.stringify(metaColumns),
              options: JSON.stringify(options),
              ...otherValues,
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
   * 列信息-新建打开滑窗
   */
  @Bind()
  handleAddMetaColumns() {
    this.getInitMetaColumn();
  }

  /**
   * 列信息-新建打开模态框初始化滑窗数据
   */
  @Bind()
  getInitMetaColumn() {
    const {
      dispatch,
      reportDefinition: { header },
    } = this.props;
    const { metaColumns = [] } = header;
    const ordinalList = metaColumns && metaColumns.map(item => item.ordinal);
    const ordinalMax = Math.max(...ordinalList);
    dispatch({
      type: 'reportDefinition/getInitMetaColumn',
    }).then(res => {
      if (res) {
        const anotherRes = { ...res, ordinal: isFinite(ordinalMax) ? ordinalMax + 1 : 0 };
        this.setState({
          metaColumnsItem: { ...anotherRes },
          metaColumnsDrawerVisible: true,
          isCreateMetaColumn: true,
        });
      }
    });
  }

  /**
   * 列信息-关闭滑窗
   */
  @Bind()
  handleCancelMetaColumns() {
    this.setState({
      metaColumnsDrawerVisible: false,
      metaColumnsItem: {},
      isCreateMetaColumn: false,
    });
  }

  /**
   * 列信息-新增滑窗保存操作
   */
  @Bind()
  handleSaveMetaColumnsContent(values) {
    const {
      dispatch,
      reportDefinition: { header = {} },
    } = this.props;
    const { metaColumns = [], ...otherValues } = header;
    dispatch({
      type: 'reportDefinition/updateState',
      payload: {
        header: { metaColumns: [...metaColumns, values], ...otherValues },
      },
    });
    this.setState({ metaColumnsDrawerVisible: false, metaColumnsItem: {} });
    this.handleUpdateState();
  }

  /**
   * 列信息-编辑打开滑窗
   */
  @Bind()
  handleEditMetaColumnsContent(record) {
    this.setState({
      metaColumnsDrawerVisible: true,
      metaColumnsItem: { ...record },
      isCreateMetaColumn: false,
    });
  }

  /**
   * 列信息-编辑保存滑窗
   */
  @Bind()
  handleEditMetaColumnsOk(values) {
    const {
      dispatch,
      reportDefinition: { header = {} },
    } = this.props;
    const { metaColumns = [], ...otherValues } = header;
    const newList = metaColumns.map(item => {
      if (item.ordinal === values.ordinal) {
        return values;
      }
      return item;
    });
    dispatch({
      type: 'reportDefinition/updateState',
      payload: { header: { metaColumns: newList, ...otherValues } },
    });
    this.setState({ metaColumnsDrawerVisible: false, metaColumnsItem: {} });
    this.handleUpdateState();
  }

  /**
   * 列信息-获取删除选中行
   */
  @Bind()
  handleMetaColumnsRowSelectChange(selectedRowKeys) {
    this.setState({ metaColumnsSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 列信息-批量删除
   */
  @Bind()
  handleDeleteMetaColumns() {
    const {
      dispatch,
      reportDefinition: { header = {} },
    } = this.props;
    const { metaColumns = [], ...otherValues } = header;
    const { metaColumnsSelectedRowKeys } = this.state;
    const newParameters = filter(metaColumns, item => {
      return metaColumnsSelectedRowKeys.indexOf(item.ordinal) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        for (let i = 0; i < newParameters.length; i++) {
          newParameters[i].ordinal = i + 1;
        }
        dispatch({
          type: 'reportDefinition/updateState',
          payload: {
            header: { metaColumns: [...newParameters], ...otherValues },
          },
        });
        this.setState({ metaColumnsSelectedRowKeys: [] });
        this.handleUpdateState();
      },
    });
  }

  /**
   * 列信息-序号唯一性校验
   */
  @Bind()
  checkUniqueMetaColumns(rule, value, callback) {
    const {
      reportDefinition: { header },
    } = this.props;
    const { metaColumns = [] } = header;
    const metaColumnsId = metaColumns.map(item => item.ordinal);
    if (!isEmpty(metaColumnsId)) {
      if (metaColumnsId.some(item => item === +value)) {
        callback(
          intl
            .get('hrpt.reportDefinition.view.reportDefinition.validateOrdinal')
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
   * 模板-新建弹框打开
   */
  @Bind()
  handleInitTemplate() {
    this.setState({ templateDrawerVisible: true });
    this.fetchInitTemplate();
  }

  /**
   * 模板-初始化数据
   */
  @Bind()
  fetchInitTemplate(fields = {}) {
    const {
      dispatch,
      reportDefinition: { header = {} },
      form,
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    form.validateFields(['templateTypeCode'], (err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'reportDefinition/fetchInitTemplate',
          payload: {
            page: isEmpty(fields) ? {} : fields,
            tenantId: header.tenantId,
            reportId: header.reportId,
            templateTypeCode: values.templateTypeCode,
            ...fieldValues,
          },
        });
      }
    });
  }

  /**
   * 模板-选择模板列表数据
   */
  @Bind()
  templateListRowSelectChange(selectedRowKeys) {
    this.setState({ templateListSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 模板-弹窗取消操作
   */
  @Bind()
  handleCancelTemplate() {
    this.setState({
      templateDrawerVisible: false,
    });
  }

  /**
   * 模板-新增
   * @param {object} values - 保存数据
   */
  @Bind()
  handleAddTemplate() {
    const {
      dispatch,
      match,
      reportDefinition: { templateList = [], header = {} },
    } = this.props;
    const { templateListSelectedRowKeys } = this.state;
    const parameters = filter(templateList, item => {
      return templateListSelectedRowKeys.indexOf(item.templateId) >= 0;
    });
    const newParams = parameters.map(item => {
      return {
        templateId: item.templateId,
        tenantId: header.tenantId,
        reportId: header.reportId,
      };
    });
    dispatch({
      type: 'reportDefinition/createTemplate',
      payload: { newParams },
    }).then(res => {
      if (res) {
        this.setState({ templateDrawerVisible: false });
        dispatch({
          type: 'reportDefinition/fetchTemplateDetail',
          payload: { reportId: match.params.id },
        });
      }
    });
  }

  /**
   * 模板-单选删除
   */
  @Bind()
  handleDeleteTemplate() {
    const {
      dispatch,
      match,
      reportDefinition: { template = [] },
    } = this.props;
    const { templateSelectedRowKeys } = this.state;
    let reportTemplate = {};
    const parameters = filter(template, item => {
      return templateSelectedRowKeys.indexOf(item.reportTemplateId) >= 0;
    });
    parameters.forEach(item => {
      reportTemplate = { ...reportTemplate, ...item };
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'reportDefinition/deleteTemplate',
          payload: reportTemplate,
        }).then(res => {
          if (res) {
            dispatch({
              type: 'reportDefinition/fetchTemplateDetail',
              payload: { reportId: match.params.id },
            });
            this.setState({ templateSelectedRowKeys: [] });
          }
        });
      },
    });
  }

  /**
   * 模板-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleTemplateRowSelectChange(selectedRowKeys) {
    this.setState({ templateSelectedRowKeys: selectedRowKeys });
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - TemplateDrawer组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * tab标签页-改变
   */
  @Bind()
  changeTabs(activeKey) {
    const { match, dispatch } = this.props;
    if (activeKey === 'template') {
      if (!isUndefined(match.params.id)) {
        dispatch({
          type: 'reportDefinition/fetchTemplateDetail',
          payload: { reportId: match.params.id },
        });
      }
      this.setState({
        isTemplateTab: true,
      });
    } else {
      this.setState({
        isTemplateTab: false,
      });
    }
  }

  /**
   * 改变默认模板
   */
  @Bind()
  changeDefaultTemplate(record) {
    const {
      dispatch,
      match,
      reportDefinition: { template = [] },
    } = this.props;
    const recordReportTemplateId = record.reportTemplateId;
    const newTemplate = template.map(item => {
      if (item.defaultFlag === 1) {
        return {
          ...item,
          defaultFlag: 0,
        };
      } else {
        if (item.reportTemplateId === recordReportTemplateId) {
          return {
            ...item,
            defaultFlag: 1,
          };
        }
        return {
          ...item,
        };
      }
    });
    dispatch({
      type: 'reportDefinition/updateState',
      payload: { template: newTemplate },
    });
    dispatch({
      type: 'reportDefinition/changeDefaultTemplate',
      payload: { newParams: { ...record, defaultFlag: 1 } },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'reportDefinition/fetchTemplateDetail',
          payload: { reportId: match.params.id },
        });
      }
    });
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
   * 改变报表类型
   */
  @Bind()
  changeReportTypeCode() {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ datasetId: undefined });
    this.handleUpdateState();
  }

  /**
   * 改变租户
   */
  @Bind()
  changeTenantId() {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ datasetId: undefined });
    this.handleUpdateState();
  }

  renderHeaderForm() {
    const {
      form: { getFieldDecorator, getFieldValue },
      reportDefinition: {
        header = {},
        template = [],
        code: { reportTypeCode = [], layout = [], templateTypeCode = [] },
      },
      match,
      tenantId,
      tenantRoleLevel,
    } = this.props;
    const { options = {}, metaColumns = [] } = header;
    const { isTemplateTab } = this.state;
    return (
      <Form>
        <Row type="flex">
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
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.reportCode')
                .d('报表代码')}
              {...formLayout}
            >
              {getFieldDecorator('reportCode', {
                initialValue: header.reportCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.reportCode')
                        .d('报表代码'),
                    }),
                  },
                ], // 校验规则
              })(
                <Input
                  typeCase="upper"
                  trim
                  inputChinese={false}
                  disabled={!isUndefined(header.reportCode)}
                  onChange={this.handleUpdateState}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.reportName')
                .d('报表名称')}
              {...formLayout}
            >
              {getFieldDecorator('reportName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.reportName')
                        .d('报表名称'),
                    }),
                  },
                ],
                initialValue: header.reportName,
              })(<Input onChange={this.handleUpdateState} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.reportTypeCode')
                .d('报表类型')}
              {...formLayout}
            >
              {getFieldDecorator('reportTypeCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.reportTypeCode')
                        .d('报表类型'),
                    }),
                  },
                ],
                initialValue: header.reportTypeCode,
              })(
                <Select
                  allowClear
                  disabled={metaColumns.length !== 0}
                  onChange={this.changeReportTypeCode}
                >
                  {reportTypeCode &&
                    reportTypeCode.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get('hrpt.reportDefinition.model.reportDefinition.datasetId').d('数据集')}
              {...formLayout}
            >
              {getFieldDecorator('datasetId', {
                initialValue: header.datasetId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.datasetId')
                        .d('数据集'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HRPT.DATASET"
                  disabled={
                    metaColumns.length !== 0 ||
                    (isUndefined(getFieldValue('tenantId')) && !tenantRoleLevel) ||
                    isUndefined(getFieldValue('reportTypeCode'))
                  }
                  textValue={header.datasetName}
                  queryParams={
                    getFieldValue('reportTypeCode') === 'T' ||
                    getFieldValue('reportTypeCode') === 'C'
                      ? {
                          sqlType: 'S',
                          enabledFlag: 1,
                          tenantId: tenantRoleLevel ? tenantId : getFieldValue('tenantId'),
                        }
                      : {
                          enabledFlag: 1,
                          tenantId: tenantRoleLevel ? tenantId : getFieldValue('tenantId'),
                        }
                  }
                  onChange={this.handleUpdateState}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.templateTypeCode')
                .d('模板类型')}
              {...formLayout}
            >
              {getFieldDecorator('templateTypeCode', {
                rules: [
                  {
                    required: getFieldValue('reportTypeCode') === 'D',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.templateTypeCode')
                        .d('模板类型'),
                    }),
                  },
                ],
                initialValue: header.templateTypeCode,
              })(
                <Select
                  allowClear
                  disabled={
                    !isUndefined(match.params.id) &&
                    getFieldValue('reportTypeCode') === 'D' &&
                    (!isTemplateTab || (isTemplateTab && template.length !== 0))
                  }
                  onChange={this.handleUpdateState}
                >
                  {templateTypeCode &&
                    templateTypeCode.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.layout')
                .d('布局列位置')}
              {...formLayout}
            >
              {getFieldDecorator('layout', {
                initialValue: options.layout,
              })(
                <Select allowClear onChange={this.handleUpdateState}>
                  {layout &&
                    layout.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.statColumnLayout')
                .d('统计列位置')}
              {...formLayout}
            >
              {getFieldDecorator('statColumnLayout', {
                initialValue: options.statColumnLayout,
              })(
                <Select allowClear onChange={this.handleUpdateState}>
                  {layout &&
                    layout.map(item => (
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
          <Col span={8}>
            <Form.Item
              label={intl.get('hrpt.reportDefinition.model.reportDefinition.orderSeq').d('排序号')}
              {...formLayout}
            >
              {getFieldDecorator('orderSeq', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.orderSeq')
                        .d('排序号'),
                    }),
                  },
                ],
                initialValue: header.orderSeq,
              })(
                <InputNumber min={0} style={{ width: '50%' }} onChange={this.handleUpdateState} />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.limitRows')
                .d('异步阈值')}
              {...formLayout}
            >
              {getFieldDecorator('limitRows', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDefinition.model.reportDefinition.limitRows')
                        .d('异步阈值'),
                    }),
                  },
                ],
                initialValue: header.limitRows,
              })(
                <InputNumber min={0} style={{ width: '50%' }} onChange={this.handleUpdateState} />
              )}
            </Form.Item>
          </Col>
          <Col span={3} offset={1}>
            <Form.Item
              label={intl
                .get('hrpt.reportDefinition.model.reportDefinition.pageFlag')
                .d('分页标识')}
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 12 }}
            >
              {getFieldDecorator('pageFlag', {
                initialValue: isUndefined(match.params.id) ? 1 : header.pageFlag,
              })(<Switch onChange={this.handleUpdateState} />)}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
              {getFieldDecorator('enabledFlag', {
                initialValue: isUndefined(match.params.id) ? 1 : header.enabledFlag,
              })(<Switch onChange={this.handleUpdateState} />)}
            </Form.Item>
          </Col>
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
      dispatch,
      saving,
      match,
      form,
      fetchDefinitionDetailLoading,
      getMetaColumnsLoading,
      getTemplateListLoading,
      fetchTemplateDetailLoading,
      createTemplateLoading,
      reportDefinition: {
        header = {},
        template = [],
        templatePagination = {},
        code: { type = [], sortType = [], templateTypeCode = [] },
        templateList = [],
        templateListPagination = {},
      },
    } = this.props;
    const {
      metaColumnsItem = {},
      templateDrawerVisible = false,
      metaColumnsDrawerVisible = false,
      metaColumnsSelectedRowKeys = [],
      templateSelectedRowKeys = [],
      templateListSelectedRowKeys = [],
      isTemplateTab,
      isCreateMetaColumn,
      isChangeContent,
    } = this.state;
    const metaColumnsRowSelection = {
      selectedRowKeys: metaColumnsSelectedRowKeys,
      onChange: this.handleMetaColumnsRowSelectChange,
    };
    const templateRowSelection = {
      templateSelectedRowKeys,
      type: 'radio',
      onChange: this.handleTemplateRowSelectChange,
    };
    const templateListRowSelection = {
      templateListSelectedRowKeys,
      onChange: this.templateListRowSelectChange,
    };
    const spinning = isUndefined(match.params.id) ? false : fetchDefinitionDetailLoading;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hrpt.reportDefinition.view.message.title.add').d('报表定义 - 添加')
      : intl.get('hrpt.reportDefinition.view.message.title.edit').d('报表定义 - 编辑');
    const metaColumnsTitle = metaColumnsItem.ordinal
      ? intl.get('hrpt.reportDefinition.view.message.metaColumnsDrawer.edit').d('编辑列')
      : intl.get('hrpt.reportDefinition.view.message.metaColumnsDrawer.add').d('添加列');
    const metaColumnsProps = {
      header,
      dispatch,
      type,
      sortType,
      metaColumnsRowSelection,
      loading: getMetaColumnsLoading,
      dataSource: header.metaColumns,
      onEdit: this.handleEditMetaColumnsContent,
    };
    const metaColumnsDrawerProps = {
      metaColumnsTitle,
      type,
      sortType,
      isCreateMetaColumn,
      anchor: 'right',
      visible: metaColumnsDrawerVisible,
      itemData: metaColumnsItem,
      onOk: this.handleSaveMetaColumnsContent,
      onCancel: this.handleCancelMetaColumns,
      onEditOk: this.handleEditMetaColumnsOk,
      onCheckUnique: this.checkUniqueMetaColumns,
    };
    const templateDrawerProps = {
      templateTypeCode,
      templateListPagination,
      templateListRowSelection,
      loading: getTemplateListLoading,
      confirmLoading: createTemplateLoading,
      dataSource: templateList,
      visible: templateDrawerVisible,
      onSearch: this.fetchInitTemplate,
      onRef: this.handleBindRef,
      onChange: this.fetchInitTemplate,
      onOk: this.handleAddTemplate,
      onCancel: this.handleCancelTemplate,
    };
    const templateProps = {
      templateRowSelection,
      templateTypeCode,
      loading: fetchTemplateDetailLoading,
      pagination: templatePagination,
      dataSource: template,
      onChangeDefaultTemplate: this.changeDefaultTemplate,
    };
    return (
      <React.Fragment>
        <Header
          title={headerTitle}
          isChange={isChangeContent}
          backPath="/hrpt/report-definition/list"
        >
          <Button icon="save" type="primary" onClick={this.handleSave} loading={saving}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="hdd"
            onClick={this.getMetaMetaColumns}
            disabled={form.getFieldValue('reportTypeCode') === 'D'}
          >
            {intl.get('hrpt.reportDefinition.view.button.initColumn').d('初始化列')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={spinning}>
            {this.renderHeaderForm()}
            <div className="table-list-operator">
              <Button
                icon="plus"
                onClick={isTemplateTab ? this.handleInitTemplate : this.handleAddMetaColumns}
                disabled={!isTemplateTab && form.getFieldValue('reportTypeCode') === 'D'}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                icon="minus"
                onClick={isTemplateTab ? this.handleDeleteTemplate : this.handleDeleteMetaColumns}
                disabled={
                  isTemplateTab
                    ? templateSelectedRowKeys.length === 0
                    : metaColumnsSelectedRowKeys.length === 0
                }
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </div>
            <Tabs defaultActiveKey="initColumn" onChange={this.changeTabs} animated={false}>
              <Tabs.TabPane
                tab={intl.get('hrpt.reportDefinition.view.tab.initColumn').d('列信息')}
                key="initColumn"
              >
                <MetaColumnsTable {...metaColumnsProps} />
              </Tabs.TabPane>
              {!isUndefined(match.params.id) && form.getFieldValue('reportTypeCode') === 'D' ? (
                <Tabs.TabPane
                  forceRender
                  tab={intl.get('hrpt.reportDefinition.view.tab.template').d('模板分配')}
                  key="template"
                >
                  <TemplateTable {...templateProps} />
                </Tabs.TabPane>
              ) : null}
            </Tabs>
            <MetaColumnsDrawer {...metaColumnsDrawerProps} />
            <TemplateDrawer {...templateDrawerProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
