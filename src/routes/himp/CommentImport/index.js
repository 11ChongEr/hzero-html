/**
 * 通用导入模块
 * 由于 需要被几个页面用到, 所以需要将 model 换成 state
 * @since 2018-9-12
 * @version 0.0.1
 * @author  fushi.wang <fushi.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import { Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'dva/router';

import { Content, Header } from 'components/Page';

import { API_HOST, HZERO_IMP } from 'utils/config';
import notification from 'utils/notification';
import { updateTab } from 'utils/menuTab';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { downloadFile } from '../../../services/api';
import {
  importData,
  loadDataSource,
  loadTemplate,
  queryStatus,
  updateOne,
  validateData,
} from '../../../services/himp/commentImportService';

import UploadExcel from './UploadExcel';
import List from './List';
import './index.less';

const viewButtonPrompt = 'himp.comment.view.button';
const viewMessagePrompt = 'himp.comment.view.message';
const commonPrompt = 'hzero.common';

@withRouter
export default class CommentImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dynamicColumns: [], // 动态列
      dataSource: [], // 数据源
      prefixPatch: null, // 客户端路径前缀
      batch: null, // 批次号
      status: null, // 状态
      defaultSheet: '', // 默认sheet
      templateTargetList: [], // 模板sheet数据
    };
  }

  componentDidMount() {
    const { match = {}, location } = this.props;
    const { params } = match;
    if (params.code) {
      this.getTemplate();
    }
    const { search } = location;
    const { title } = queryString.parse(search);
    // 更新 tab 的标题
    updateTab({
      // FIXME: 如果其他地方也需要通用导入
      key: `/hiam/sub-account-org/data-import/${params.code}`,
      title,
    });
  }

  /**
   * 获取模板(动态列, 客户端前缀)
   */
  @Bind()
  getTemplate() {
    const { match } = this.props;
    const { params } = match;
    this.showLoading('loadTemplateLoading');
    loadTemplate({ code: params.code })
      .then(res => {
        const parsedRes = getResponse(res);
        if (parsedRes) {
          const { prefixPatch = '', templateTargetList = [] } = res;
          const { templateLineList = [] } = templateTargetList[0];
          const defaultSheet = templateTargetList[0] && templateTargetList[0].sheetIndex;
          this.setState({
            prefixPatch,
            templateTargetList,
            defaultSheet,
            dynamicColumns: templateLineList.map(n => ({
              title: n.columnName,
              dataIndex: n.columnCode,
              width: n.columnName.length * 25,
              columnType: n.columnType,
              required: n.nullable,
              editable: true, // 可编辑控制
            })),
          });
        }
      })
      .finally(() => {
        this.hiddenLoading('loadTemplateLoading');
      });
  }

  /**
   * 切换sheet页
   * @param {string} value - sheet页code
   */
  @Bind()
  handleChangeSheet(value) {
    const { templateTargetList = [] } = this.state;
    const selectSheet =
      templateTargetList.find(item => {
        return item.sheetIndex === value;
      }) || {};
    const { templateLineList = [] } = selectSheet;
    this.setState({
      defaultSheet: value,
    });
    // 获取不同sheet页的模板列
    if (templateLineList) {
      this.setState({
        dynamicColumns: templateLineList.map(n => ({
          title: n.columnName,
          dataIndex: n.columnCode,
          width: n.columnName.length * 25,
          columnType: n.columnType,
          required: n.nullable,
          editable: true, // 可编辑控制
        })),
      });
    } else {
      this.setState({
        dynamicColumns: [],
      });
    }
    this.getDataSource({ sheetIndex: value });
  }

  /**
   * 设置loading
   * 将 [loadingStateStr] 置为 true
   * @param {string} loadingStateStr
   */
  @Bind()
  showLoading(loadingStateStr) {
    this.setState({
      [loadingStateStr]: true,
    });
  }

  /**
   * 取消loading
   * 将 [loadingStateStr] 置为 false
   * @param {string} loadingStateStr
   */
  @Bind()
  hiddenLoading(loadingStateStr) {
    this.setState({
      [loadingStateStr]: false,
    });
  }

  /**
   * 上传excel成功后设置批次号
   * 成功后自动刷新状态 和 数据
   * @param {string} batch - 批次号
   */
  @Bind()
  uploadSuccess(batch) {
    this.setState({ batch });
    notification.success({ message: '上传成功，请稍后刷新数据' });
  }

  /**
   * 获取导入的数据
   * @param {object} [params={}] 查询参数
   */
  @Bind()
  getDataSource(params = {}) {
    const { match } = this.props;
    const { prefixPatch, batch } = this.state;
    this.showLoading('loadDataSourceLoading');
    loadDataSource(match.params.code, batch, prefixPatch, params)
      .then(res => {
        const dataSource = getResponse(res);
        if (dataSource) {
          const { content = [] } = dataSource;
          const formatData = content.map(item => {
            const { data = '{}', ...reset } = item;
            const newData = JSON.parse(data);
            return { ...newData, ...reset };
          });
          this.setState({
            dataSource: formatData,
          });
        }
      })
      .finally(() => {
        this.hiddenLoading('loadDataSourceLoading');
      });
  }

  /**
   * 获取当前状态
   * @param {object} params
   */
  @Bind()
  fetchStatus(params = {}) {
    const { prefixPatch, defaultSheet } = this.state;
    queryStatus(prefixPatch, params)
      .then(res => {
        this.showLoading('queryStatusLoading');
        const statusRes = getResponse(res);
        if (statusRes) {
          this.setState({
            status: statusRes.status,
          });
          notification.success({
            message: intl.get(`${viewMessagePrompt}.title.refreshSuccess`).d('刷新成功'),
            description: `当前数据状态：${res.statusMeaning}`,
          });
        }
        // 当状态是数据导入完成时，获取导入数据
        if (statusRes.status === 'IMPORTED') {
          this.getDataSource({ sheetIndex: defaultSheet });
        }
      })
      .finally(() => {
        this.hiddenLoading('queryStatusLoading');
      });
  }

  /**
   * 下载模板
   */
  @Bind()
  exportOption() {
    const { params } = this.props.match;
    const organizationId = getCurrentOrganizationId();
    const api = `${API_HOST}${HZERO_IMP}/v1/${organizationId}/template/${params.code}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'type', value: 'bpmn20' }] });
  }

  /**
   * 校验数据
   */
  @Bind()
  validateData() {
    const { match } = this.props;
    const { prefixPatch, batch } = this.state;
    const { params } = match;
    if (batch) {
      if (!isEmpty(prefixPatch)) {
        this.showLoading('validateDataLoading');
        validateData({
          templateCode: params.code,
          batch,
          prefixPatch,
        })
          .then(res => {
            const validateRes = getResponse(res);
            if (validateRes) {
              this.refresh();
            }
          })
          .finally(() => {
            this.hiddenLoading('validateDataLoading');
          });
      } else {
        notification.error({
          description: intl
            .get(`${viewMessagePrompt}.error.templateClientPathPrefixIsNotConfigured`)
            .d('模板客户端路径前缀未配置'),
        });
      }
    } else {
      notification.error({
        description: intl
          .get(`${viewMessagePrompt}.error.pleaseUploadAnImportFile`)
          .d('请上传导入文件'),
      });
    }
  }

  /**
   * 导入数据
   */
  @Bind()
  importData() {
    const { match } = this.props;
    const { prefixPatch, batch } = this.state;
    const { params } = match;
    if (batch) {
      if (!isEmpty(prefixPatch)) {
        this.showLoading('importDataLoading');
        importData({
          templateCode: params.code,
          batch,
          prefixPatch,
        })
          .then(res => {
            const importDataRes = getResponse(res);
            if (importDataRes) {
              this.refresh();
            }
          })
          .finally(() => {
            this.hiddenLoading('importDataLoading');
          });
      } else {
        notification.error({
          message: intl
            .get(`${viewMessagePrompt}.error.templateClientPathPrefixIsNotConfigured`)
            .d('模板客户端路径前缀未配置'),
        });
      }
    } else {
      notification.error({
        message: intl
          .get(`${viewMessagePrompt}.error.pleaseUploadAnImportFile`)
          .d('请上传导入文件'),
      });
    }
  }

  /**
   * 保存单条编辑数据
   * @param {object} form - 表单
   * @param {id} id - 导入数据记录的id
   * @param {Function} cb - 关闭编辑模式
   */
  @Bind()
  save(form, id, cb = e => e) {
    const { prefixPatch } = this.state;
    this.showLoading('updateOneLoading');
    form.validateFields((error, row) => {
      if (!isEmpty(error)) {
        this.hiddenLoading('updateOneLoading');
        return;
      }
      updateOne({
        id,
        prefixPatch,
        data: row,
      })
        .then(res => {
          const updateOneRes = getResponse(res);
          if (updateOneRes) {
            cb();
            this.refresh();
          }
        })
        .finally(() => {
          this.hiddenLoading('updateOneLoading');
        });
    });
  }

  /**
   * 刷行状态和数据
   */
  @Bind()
  refresh() {
    const { batch } = this.state;
    if (batch) {
      this.fetchStatus({ batch });
      this.getDataSource();
    }
  }

  render() {
    const { match = {}, location } = this.props;
    const { params } = match;
    const { search } = location;
    const { action } = queryString.parse(search);
    const {
      defaultSheet,
      dynamicColumns = [],
      templateTargetList = [],
      dataSource = [],
      prefixPatch,
      batch,
      status,
      loadTemplateLoading,
      validateDataLoading,
      importDataLoading,
      queryStatusLoading,
      loadDataSourceLoading,
    } = this.state;
    const uploadExcelProps = {
      prefixPatch,
      templateCode: params.code,
      success: this.uploadSuccess,
    };
    const listProps = {
      dynamicColumns,
      dataSource,
      processing: {
        queryColumns: loadTemplateLoading,
        loading:
          loadTemplateLoading || validateDataLoading || importDataLoading || loadDataSourceLoading,
      },
      save: this.save,
    };
    return (
      <React.Fragment>
        <Header title={action}>
          <Button type="primary" onClick={this.exportOption} icon="download">
            {intl.get(`${viewButtonPrompt}.downloadTemplate`).d('下载模板')}
          </Button>
          <UploadExcel {...uploadExcelProps} disabled={!!batch} />
          <Button
            icon="check-circle-o"
            onClick={this.validateData}
            disabled={status !== 'UPLOADED'}
            loading={validateDataLoading}
          >
            {intl.get(`${viewButtonPrompt}.validateData`).d('数据验证')}
          </Button>
          <Button
            icon="to-top"
            onClick={this.importData}
            disabled={status !== 'CHECKED'}
            loading={importDataLoading}
          >
            {intl.get(`${viewButtonPrompt}.importData`).d('数据导入')}
          </Button>
          <Button icon="sync" onClick={this.refresh} disabled={!batch} loading={queryStatusLoading}>
            {intl.get(`${commonPrompt}.button.reload`).d('刷新')}
          </Button>
        </Header>
        <Content>
          <div style={{ marginBottom: 10 }}>
            <Select style={{ width: 100 }} value={defaultSheet} onChange={this.handleChangeSheet}>
              {templateTargetList.map(item => {
                return (
                  <Select.Option value={item.sheetIndex} key={item.sheetIndex}>
                    {item.sheetIndexMeaning}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
          {/* <DataDetail {...props} /> */}
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
