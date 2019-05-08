/**
 * Detail - 报表平台/报表查询-详情
 * @date: 2018-11-28
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Tooltip, Icon, Switch, Row, Col, Pagination } from 'hzero-ui';
import { connect } from 'dva';
import { map, isArray, join, isUndefined, forEach, filter, isEmpty, isObject } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { Header } from 'components/Page';
import Lov from 'components/Lov';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  getDateTimeFormat,
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_RPT } from 'utils/config';
// import request from 'utils/request';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import ParamsForm from './ParamsForm';
import Drawer from './Drawer';
import { downloadFile } from '../../../../services/api';

import styles from './index.less';

const currentTenantId = getCurrentOrganizationId();

/**
 * 审批规则头-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} reportQuery - 数据源
 * @reactProps {!Object} fetchApproveHeaderLoading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hrpt.reportQuery'] })
@Form.create({ fieldNameProp: null })
@connect(({ reportQuery, loading }) => ({
  reportQuery,
  fetchParamsLoading: loading.effects['reportQuery/fetchParams'],
  buildReportLoading: loading.effects['reportQuery/buildReport'],
  createRequestLoading: loading.effects['reportQuery/createRequest'],
  dateFormat: getDateTimeFormat(),
}))
export default class Detail extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    // exportLoading: false,
    reportData: {},
    currentPage: 1,
    drawerVisible: false,
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'reportQuery/fetchParams',
      payload: {
        reportUuid: id,
      },
    });
  }

  // 生成报表
  @Bind()
  buildReport(pageParams = {}) {
    const {
      form,
      dispatch,
      dateFormat,
      reportQuery: { paramsData = {} },
    } = this.props;
    const { reportUuid } = paramsData;
    this.form.validateFields(err1 => {
      if (!err1) {
        const fieldValues = isUndefined(this.form)
          ? {}
          : filterNullValueObject(this.form.getFieldsValue());

        form.validateFields((err, values) => {
          const newValues = filter(values, item => !isUndefined(item));
          let strParam;
          map(fieldValues, (value, key) => {
            if (isArray(value) && value.length > 0) {
              const separator = `&${key}=`;
              strParam = `${separator}${join(value, separator)}`;
              if (isEmpty(newValues)) {
                strParam = strParam.substring(1);
              }
              // eslint-disable-next-line no-param-reassign
              delete fieldValues[key];
            } else if (isArray(value) && value.length === 0) {
              // eslint-disable-next-line no-param-reassign
              delete fieldValues[key];
            }
          });
          const formatFieldValues = { ...fieldValues };
          for (const key of Object.keys(fieldValues)) {
            if (isObject(fieldValues[key]) && moment(fieldValues[key]).isValid()) {
              formatFieldValues[key] = moment(fieldValues[key]).format(dateFormat);
            }
          }
          if (!err) {
            dispatch({
              type: 'reportQuery/buildReport',
              payload: {
                // type: reportTypeCode,
                strParam,
                reportUuid,
                ...formatFieldValues,
                ...values,
                ...pageParams,
              },
            }).then(res => {
              if (res) {
                this.setState({ reportData: res });
              }
            });
          }
        });
      }
    });
  }

  // 定时报表
  @Bind()
  handleCreateRequest(fieldsValue = {}) {
    const {
      form,
      dispatch,
      reportQuery: { paramsData = {} },
    } = this.props;
    const { reportUuid } = paramsData;
    const { startDate, endDate, ...others } = fieldsValue;
    this.form.validateFields(err1 => {
      if (!err1) {
        const fieldValues = isUndefined(this.form)
          ? {}
          : filterNullValueObject(this.form.getFieldsValue());

        form.validateFields((err, values) => {
          const newValues = filter(values, item => !isUndefined(item));
          let strParam;
          map(fieldValues, (value, key) => {
            if (isArray(value) && value.length > 0) {
              const separator = `&${key}=`;
              strParam = `${separator}${join(value, separator)}`;
              if (isEmpty(newValues)) {
                strParam = strParam.substring(1);
              }
              // eslint-disable-next-line no-param-reassign
              delete fieldValues[key];
            } else if (isArray(value) && value.length === 0) {
              // eslint-disable-next-line no-param-reassign
              delete fieldValues[key];
            }
          });
          if (!err) {
            dispatch({
              type: 'reportQuery/createRequest',
              payload: {
                strParam,
                reportUuid,
                ...fieldValues,
                ...values,
                startDate: startDate ? moment(startDate).format(DEFAULT_DATETIME_FORMAT) : null,
                endDate: endDate ? moment(endDate).format(DEFAULT_DATETIME_FORMAT) : null,
                tenantId: currentTenantId,
                ...others,
              },
            }).then(res => {
              if (res) {
                notification.success();
                this.handleCloseDrawer();
              }
            });
          }
        });
      }
    });
  }

  @Bind()
  handleBuildReport() {
    this.buildReport();
    this.setState({
      currentPage: 1,
    });
  }

  @Bind()
  handleOpenDrawer() {
    this.setState({ drawerVisible: true });
  }

  @Bind()
  handleCloseDrawer() {
    this.setState({ drawerVisible: false });
  }

  // @Bind()
  // handleCreateRequest(fieldsValue) {
  //   const { dispatch, reportQuery: { paramsData = {} } } = this.props;
  //   const { reportUuid } = paramsData;
  //   const { startDate, endDate, ...others} = fieldsValue;
  //   // const { enabledFlag } = fieldsValue;
  //   dispatch({
  //     type: 'reportQuery/createRequest',
  //     payload: {
  //       reportUuid,
  //       startDate: startDate ? moment(startDate).format(DEFAULT_DATETIME_FORMAT) : null,
  //       endDate: endDate ? moment(endDate).format(DEFAULT_DATETIME_FORMAT) : null,
  //       ...others,
  //     },
  //   }).then(res => {
  //     if (res) {
  //       notification.success();
  //       this.handleCloseDrawer();
  //       // this.handleSearch(pagination);
  //     }
  //   });
  // }

  // 导出成excel
  @Bind()
  handleExport(outputType) {
    const {
      form,
      reportQuery: { paramsData = {} },
    } = this.props;
    const { reportUuid } = paramsData;
    this.form.validateFields(err1 => {
      if (!err1) {
        const fieldValues = isUndefined(this.form)
          ? {}
          : filterNullValueObject(this.form.getFieldsValue());
        let newParams = [];
        let params = [];
        // 将是多选的参数分离出来，多个数组元素拆分成多个独立的对象
        map(fieldValues, (value1, key1) => {
          if (isArray(value1) && value1.length > 0) {
            newParams = map(value1, value => {
              return { key: key1, value };
            });
            params = newParams.map(item => {
              return { name: item.key, value: item.value };
            });
            // eslint-disable-next-line no-param-reassign
            delete fieldValues[key1];
          } else if (isArray(value1) && value1.length === 0) {
            // eslint-disable-next-line no-param-reassign
            delete fieldValues[key1];
          }
        });
        const othersParams = map(fieldValues, (value, key) => {
          return { key, value };
        });
        forEach(othersParams, item => {
          params.push({ name: item.key, value: item.value });
        });

        const requestUrl = `${HZERO_RPT}/v1/${
          isTenantRoleLevel() ? `${currentTenantId}/` : ''
        }reports/export/${reportUuid}/${outputType}`;

        form.validateFields((err, values) => {
          const baseParams = map(values, (value, key) => {
            return { key, value };
          });
          forEach(baseParams, item => {
            params.push({ name: item.key, value: item.value });
          });
          const newValues = filter(params, item => !isUndefined(item.value));
          if (!err) {
            // GET方法导出
            downloadFile({
              requestUrl,
              queryParams: newValues,
            }).then(res => {
              if (res) {
                // this.setState({ exportPending: false });
              }
            });
          }
        });
      }
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  onShowSizeChange(current, pageSize) {
    this.buildReport({ 'f-page': current - 1, 'f-size': pageSize });
    this.setState({
      currentPage: current,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      fetchParamsLoading = false,
      buildReportLoading = false,
      createRequestLoading = false,
      reportQuery: { paramsData = {}, intervalTypeList = [] },
    } = this.props;
    const {
      reportTypeCode,
      reportId,
      reportName,
      formElements,
      templateTypeCode,
      limitRows,
      pageFlag,
    } = paramsData;
    const {
      // exportLoading,
      reportData: { htmlTable = '', metaDataPageSize = 10, metaDataRowTotal = 0 },
      currentPage,
      drawerVisible,
    } = this.state;

    const paramsProps = {
      fetchParamsLoading,
      formElements,
      reportId,
      reportTypeCode,
      onRef: this.handleBindRef,
    };

    const drawerProps = {
      createRequestLoading,
      intervalTypeList,
      visible: drawerVisible,
      onOk: this.handleCreateRequest,
      onCancel: this.handleCloseDrawer,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('hrpt.reportQuery.view.message.title.detail', {
              reportName,
            })
            .d(`${reportName} - 详情`)}
          backPath="/hrpt/report-query/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.handleBuildReport}
            loading={buildReportLoading}
          >
            {intl.get('hrpt.reportQuery.option.buildReport').d('生成报表')}
          </Button>
          {reportTypeCode === 'T' && (
            <Button icon="clock-circle" onClick={this.handleOpenDrawer}>
              {intl.get('hrpt.reportQuery.option.createRequest').d('定时报表')}
            </Button>
          )}

          {/* {templateTypeCode !== 'pdf' && ( // 只有pdf类型模板报表不能导出Excel */}
          <Tooltip
            className={styles['icon-excel']}
            title={intl.get('hrpt.reportQuery.option.exportExcel').d('导出Excel')}
          >
            {reportTypeCode === 'T' || templateTypeCode === 'html' ? (
              <Icon onClick={() => this.handleExport('XLS')} />
            ) : (
              <Icon onClick={() => this.handleExport('XLSX')} />
            )}
          </Tooltip>
          {/* )} */}

          {templateTypeCode === 'rtf' && ( // 只有rtf类型模板报表能导出PPT和Word
            <React.Fragment>
              <Tooltip
                className={styles['icon-ppt']}
                title={intl.get('hrpt.reportQuery.option.exportPPT').d('导出PPT')}
              >
                <Icon onClick={() => this.handleExport('PPTX')} />
              </Tooltip>
              <Tooltip
                className={styles['icon-word']}
                title={intl.get('hrpt.reportQuery.option.exportWord').d('导出Word')}
              >
                <Icon onClick={() => this.handleExport('DOCX')} />
              </Tooltip>
            </React.Fragment>
          )}

          {(templateTypeCode === 'html' || templateTypeCode === 'rtf') && ( // 只有pdf类型模板报表不能导出Excel
            <React.Fragment>
              <Tooltip
                className={styles['icon-pdf']}
                title={intl.get('hrpt.reportQuery.option.exportPdf').d('导出Pdf')}
              >
                <Icon onClick={() => this.handleExport('PDF')} />
              </Tooltip>
              <Tooltip
                key="notTable"
                className={styles['icon-html']}
                title={intl.get('hrpt.reportQuery.option.exportHTML').d('导出HTML')}
              >
                <Icon onClick={() => this.handleExport('HTML')} />
              </Tooltip>
            </React.Fragment>
          )}
          {reportTypeCode === 'T' && ( // 表格报表可导出HTML
            <Tooltip
              key="isTable"
              className={styles['icon-html']}
              title={intl.get('hrpt.reportQuery.option.exportHTML').d('导出HTML')}
            >
              <Icon onClick={() => this.handleExport('HTML')} />
            </Tooltip>
          )}
        </Header>
        <div className={styles['content-sty']}>
          <Form layout="inline">
            <Row>
              <Col span={8}>
                {reportTypeCode === 'T' && (
                  <Form.Item
                    label={intl
                      .get('hrpt.reportQuery.model.reportQuery.isRowSpan')
                      .d('合并左边相同维度行')}
                  >
                    {form.getFieldDecorator('f-isRowSpan', {
                      initialValue: false,
                    })(<Switch />)}
                  </Form.Item>
                )}
                {reportTypeCode === 'D' && (
                  <Form.Item
                    label={intl.get('hrpt.reportQuery.model.reportQuery.template').d('模板')}
                  >
                    {form.getFieldDecorator('f-templateCode', {})(
                      <Lov
                        code="HRPT.REPORT_TEMPLATE"
                        queryParams={{
                          reportId,
                        }}
                        onChange={(text, record) => {
                          form.registerField('f-lang');
                          form.setFieldsValue({ 'f-lang': record.lang });
                        }}
                      />
                    )}
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Form>
          <ParamsForm {...paramsProps} />
          {htmlTable && (
            <div className={styles['model-title']}>
              {intl.get('hrpt.reportQuery.view.message.buildResult').d('生成结果')}
            </div>
          )}
          <div
            className={styles['auto-table']}
            style={{ height: reportTypeCode === 'T' ? '450px' : '' }}
          >
            <p className={styles['report-query']} dangerouslySetInnerHTML={{ __html: htmlTable }} />
          </div>
          {reportTypeCode === 'T' && pageFlag === 1 && metaDataRowTotal !== 0 && (
            <div style={{ float: 'right' }}>
              <Pagination
                onShowSizeChange={this.onShowSizeChange}
                defaultPageSize={limitRows}
                current={currentPage}
                pageSize={metaDataPageSize}
                total={metaDataRowTotal}
                onChange={this.onShowSizeChange}
                showSizeChanger
                // hideOnSinglePage
              />
            </div>
          )}
        </div>
        {drawerProps && <Drawer {...drawerProps} />}
      </React.Fragment>
    );
  }
}
