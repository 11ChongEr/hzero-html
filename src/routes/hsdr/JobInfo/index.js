/**
 * jobInfo - 调度任务
 * @date: 2018-9-7
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import {
  Form,
  Input,
  Button,
  Table,
  Popconfirm,
  Select,
  Icon,
  Menu,
  Dropdown,
  Row,
  Col,
} from 'hzero-ui';

import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { TagRender } from 'utils/renderer';

import Drawer from './Drawer';
import LogDrawer from './LogDrawer';
import LogErrorDrawer from './LogErrorDrawer';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@cacheComponent({ cacheKey: ['/hsdr/job-info/list'] })
@connect(({ loading, jobInfo }) => ({
  fetchList: loading.effects['jobInfo/fetchJobInfo'],
  creating: loading.effects['jobInfo/createJobInfo'],
  updating: loading.effects['jobInfo/updateJobInfo'],
  fetchJobError: loading.effects['jobInfo/fetchJobLogError'],
  fetchJogLoading: loading.effects['jobInfo/fetchJobLog'],
  checkLoading: loading.effects['jobInfo/checkJobInfo'],
  jobInfo,
  tenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hsdr.jobInfo', 'hsdr.jobLog'] })
@Form.create({ fieldNameProp: null })
export default class JobInfo extends React.PureComponent {
  state = {
    jobModalVisible: false,
    jobErrorModalVisible: false,
    jobLogId: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchJobInfo();
    dispatch({
      type: 'jobInfo/init',
    });
  }

  @Bind()
  queryGroups() {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/fetchGroupsList',
    });
  }

  /**
   * @function fetchJobInfo - 获取列表数据
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 页数
   */
  fetchJobInfo(params = {}) {
    const {
      dispatch,
      form,
      jobInfo: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'jobInfo/fetchJobInfo',
      payload: { page: pagination, ...form.getFieldsValue(), ...params },
    });
  }

  fetchJobDetail(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/queryJobInfo',
      payload: { id: params.jobId },
    });
  }

  /**
   * @function handleSearch - 搜索表单
   */
  @Bind()
  handleSearch() {
    this.fetchJobInfo({ page: {} });
  }

  /**
   * @function handleResetSearch - 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function handleModalVisible - 控制modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  @Bind()
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * @function showCreateModal - 显示新增modal
   */
  @Bind()
  showCreateModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/updateState',
      payload: {
        jobInfoDetail: {},
      },
    });
    this.handleModalVisible(true);
  }

  /**
   * 检查执行器
   * @param {string} executorId - 执行器ID
   */
  @Bind()
  handleCheck(executorId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/checkJobInfo',
      payload: { executorId },
    }).then(res => {
      if (res) {
        notification.success();
      }
    });
  }

  @Bind()
  handleAdd(fieldsValue) {
    const {
      dispatch,
      jobInfo: { jobInfoDetail = {} },
    } = this.props;
    const { jobId } = jobInfoDetail;
    const { strategyParam, ...others } = fieldsValue;
    dispatch({
      type: `jobInfo/${jobId ? 'updateJobInfo' : 'createJobInfo'}`,
      payload: {
        strategyParam: JSON.stringify(strategyParam),
        ...jobInfoDetail,
        ...others,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleModalVisible(false);
        this.fetchJobInfo();
      }
    });
  }

  /**
   * @function renderForm - 渲染搜索表单
   */
  renderFilterForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      jobInfo: { glueTypeList = [], jobStatusList = [] },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.jobInfo.model.jobInfo.id').d('任务ID')}
                  {...formLayout}
                >
                  {getFieldDecorator('jobId', {
                    rules: [
                      {
                        pattern: /^[0-9]*$/,
                        message: intl.get('hsdr.jobInfo.validation.digital').d('只能输入数字'),
                      },
                    ],
                  })(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('hsdr.jobInfo.model.jobInfo.jobCode').d('任务编码')}
                >
                  {getFieldDecorator('jobCode')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsdr.jobInfo.model.jobInfo.glueType').d('任务类型')}
                >
                  {getFieldDecorator('glueType')(
                    <Select allowClear>
                      {glueTypeList.map(item => {
                        return (
                          <Option label={item.meaning} value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsdr.jobInfo.model.jobInfo.jobStatus').d('状态')}
                >
                  {getFieldDecorator('jobStatus')(
                    <Select allowClear>
                      {jobStatusList.map(item => {
                        return (
                          <Option label={item.meaning} value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="JobHandler" {...formLayout}>
                  {getFieldDecorator('jobHandler', {})(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hsdr.jobInfo.model.jobInfo.jobDesc').d('任务描述')}
                >
                  {getFieldDecorator('description', {})(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * @function handleEditJob- 操作job
   * @param {object} record - 行数据
   * @param {string} type - 操作任务的类型
   */
  handleEditJob(record, type) {
    const { dispatch } = this.props;
    dispatch({
      type: `jobInfo/${type}`,
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchJobInfo();
      }
    });
  }

  /**
   * @function handleEditJob- 删除job
   * @param {object} record - 行数据
   */
  handleDelete(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/deleteJobInfo',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchJobInfo();
      }
    });
  }

  /**
   * @function handleUpdateEmail - 编辑
   * @param {object} record - 行数据
   */
  @Bind()
  handleUpdate(record) {
    this.fetchJobDetail(record);
    this.handleModalVisible(true);
  }

  /**
   * @function handlePagination - 分页操作
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchJobInfo({
      page: pagination,
    });
  }

  @Bind()
  hideJobLogErrorDrawer() {
    this.setState({ jobErrorModalVisible: false });
  }

  @Bind()
  handleJobError(data) {
    const { dispatch } = this.props;
    this.setState({ jobErrorModalVisible: true });
    dispatch({
      type: 'jobInfo/fetchJobLogError',
      payload: data,
    });
  }

  @Bind()
  handleDeleteJobLog(record) {
    const {
      dispatch,
      jobInfo: { jobPagination = {} },
    } = this.props;
    dispatch({
      type: 'jobInfo/deleteJobLog',
      payload: {
        logId: record.logId,
        jobId: record.jobId,
        _token: record._token,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchJobLog({
          page: jobPagination.current - 1,
          size: jobPagination.pageSize,
        });
      }
    });
  }

  @Bind()
  showJobDrawer(flag) {
    this.setState({ jobModalVisible: flag });
  }

  @Bind()
  hideJobLogDrawer() {
    this.showJobDrawer(false);
  }

  @Bind()
  fetchJobLog(params = {}) {
    const { dispatch } = this.props;
    const { jobLogId } = this.state;
    dispatch({
      type: 'jobInfo/fetchJobLog',
      payload: { jobId: jobLogId, ...params },
    });
  }

  /**
   * 跳转到日志页面
   * @param {object} params - 头数据
   */
  handleLogContent(params) {
    this.setState({ jobLogId: params.jobId });
    this.showJobDrawer(true);
    this.fetchJobLog(params);
  }

  @Bind()
  againTrigger(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/againTrigger',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchJobInfo();
      }
    });
  }

  render() {
    const {
      updating,
      creating,
      fetchList,
      tenantRoleLevel,
      fetchJogLoading = false,
      fetchJobError = false,
      jobInfo = {},
      dispatch,
      checkLoading = false,
    } = this.props;
    const { jobErrorModalVisible, jobModalVisible } = this.state;
    const {
      jobInfoList = [],
      groupsList = [],
      pagination = {},
      modalVisible,
      jobInfoDetail,
      jobLogList = [],
      jobPagination = {},
      jobErrorDetail = {},
      jobLogLdp = {},
    } = jobInfo;
    const { jobId } = jobInfoDetail;
    const requestLoading = {
      save: updating,
      create: creating,
    };
    const logDrawer = {
      dispatch,
      jobLogLdp,
      jobLogList,
      jobPagination,
      title: intl.get('hsdr.jobLog.view.message.title').d('调度日志'),
      initLoading: fetchJogLoading,
      loading: fetchJogLoading,
      modalVisible: jobModalVisible,
      onSearch: this.fetchJobLog,
      onCancel: this.hideJobLogDrawer,
      onError: this.handleJobError,
      onDelete: this.handleDeleteJobLog,
    };
    const logErrorProps = {
      jobErrorDetail,
      initLoading: fetchJobError,
      modalVisible: jobErrorModalVisible,
      onOk: this.hideJobLogErrorDrawer,
      onCancel: this.hideJobLogErrorDrawer,
    };
    const columns = [
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.id').d('任务ID'),
        width: 150,
        align: 'center',
        dataIndex: 'jobId',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.tenantName').d('租户'),
        width: 150,
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.jobCode').d('任务编码'),
        width: 150,
        dataIndex: 'jobCode',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.glueTypeMeaning').d('任务类型'),
        width: 100,
        align: 'center',
        dataIndex: 'glueTypeMeaning',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.executorHandler').d('JobHandler'),
        width: 100,
        align: 'center',
        dataIndex: 'jobHandler',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.jobDesc').d('任务描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.jobCron').d('Cron'),
        dataIndex: 'jobCron',
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.parentId').d('父任务ID'),
        dataIndex: 'parentId',
        width: 100,
      },
      {
        title: intl.get('hsdr.jobInfo.model.jobInfo.jobStatusMeaning').d('状态'),
        width: 100,
        align: 'center',
        fixed: 'right',
        dataIndex: 'jobStatusMeaning',
        render: (text, record) => {
          const statusList = [
            { status: 'NORMAL', color: 'green' },
            { status: 'PAUSED', color: 'gold' },
            { status: 'BLOCKED', color: 'volcano' },
            { status: 'ERROR', color: 'red' },
            { status: 'NONE', color: '' },
            { status: 'COMPLETE', color: '' },
          ];
          return TagRender(record.jobStatus, statusList, text);
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        fixed: 'right',
        render: (text, record) => {
          const menu = (
            <Menu style={{ textAlign: 'left' }}>
              {record.jobStatus === 'NORMAL' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.jobInfo.view.message.confirm.trigger')
                      .d('是否执行该任务')}？`}
                    onConfirm={this.handleEditJob.bind(this, record, 'triggerJobInfo')}
                  >
                    <a>
                      <Icon type="play-circle" />{' '}
                      {intl.get('hzero.common.button.trigger').d('执行')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {record.jobStatus === 'NORMAL' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.jobInfo.view.message.confirm.pause')
                      .d('是否暂停该任务')}？`}
                    onConfirm={this.handleEditJob.bind(this, record, 'pauseJobInfo')}
                  >
                    <a>
                      <Icon type="pause-circle" /> {intl.get('hzero.common.button.pause').d('暂停')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {!record.cycleFlag && record.jobStatus === 'NONE' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.notice.view.message.confirm.againTrigger')
                      .d('是否再次执行该任务')}？`}
                    onConfirm={() => this.againTrigger(record)}
                  >
                    <a>
                      <Icon type="sync" />{' '}
                      {intl.get('hzero.common.button.againTrigger').d('再次执行')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {record.jobStatus !== 'COMPLETE' && record.jobStatus !== 'NONE' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.jobInfo.view.message.confirm.stop')
                      .d('是否终止该任务')}？`}
                    onConfirm={this.handleEditJob.bind(this, record, 'stopJob')}
                  >
                    <a>
                      <Icon type="close-circle" /> {intl.get('hsdr.jobInfo.option.stop').d('终止')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}

              {record.jobStatus === 'PAUSED' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.notice.view.message.confirm.resume')
                      .d('是否恢复该任务')}？`}
                    onConfirm={this.handleEditJob.bind(this, record, 'resumeJobInfo')}
                  >
                    <a>
                      <Icon type="sync" /> {intl.get('hzero.common.button.resume').d('恢复')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              <Menu.Item>
                <a onClick={this.handleLogContent.bind(this, { jobId: record.jobId })}>
                  <Icon type="exception" /> {intl.get('hsdr.jobInfo.view.option.log').d('日志')}
                </a>
              </Menu.Item>
              {record.jobStatus !== 'PAUSED' &&
                record.jobStatus !== 'COMPLETE' &&
                record.jobStatus !== 'NONE' && (
                  <Menu.Item>
                    <a onClick={this.handleUpdate.bind(this, record)}>
                      <Icon type="edit" /> {intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                  </Menu.Item>
                )}
              {record.jobStatus === 'NONE' && (
                <Menu.Item>
                  <Popconfirm
                    title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                    onConfirm={this.handleDelete.bind(this, record)}
                  >
                    <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                  </Popconfirm>
                </Menu.Item>
              )}
            </Menu>
          );
          return (
            <Dropdown overlay={menu} disabled={record.status === 'operating'}>
              <a>
                {intl.get('hzero.common.button.action').d('操作')}
                <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    const title = jobId
      ? intl.get('hsdr.jobInfo.view.message.edit').d('编辑调度任务')
      : intl.get('hsdr.jobInfo.view.message.create').d('新建调度任务');
    return (
      <React.Fragment>
        <Header title={intl.get('hsdr.jobInfo.view.message.title.list').d('调度任务')}>
          <Button icon="plus" type="primary" onClick={this.showCreateModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            scroll={{ x: !tenantRoleLevel ? 1251 : 1101 }}
            bordered
            rowKey="jobId"
            loading={fetchList}
            dataSource={jobInfoList}
            columns={columns}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <Drawer
            title={title}
            loading={jobId ? requestLoading.save : requestLoading.create}
            checkLoading={checkLoading}
            modalVisible={modalVisible}
            onCancel={() => this.handleModalVisible(false)}
            onOk={this.handleAdd}
            onCheck={this.handleCheck}
            initData={jobInfoDetail}
            jobInfo={jobInfo}
            groupsList={groupsList}
            fetchJobDetail={this.fetchJobDetail}
            tenantRoleLevel={tenantRoleLevel}
            onSearchGroup={this.queryGroups}
          />
          <LogDrawer {...logDrawer} />
          <LogErrorDrawer {...logErrorProps} />
        </Content>
      </React.Fragment>
    );
  }
}
