import React from 'react';
import { Form, Modal, Table, Popconfirm, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { isTenantRoleLevel, tableScrollWidth } from 'utils/utils';
import { TagRender, dateTimeRender } from 'utils/renderer';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';

import ProgressModal from '../components/ProgressModal';

import { downloadFile } from '../../../services/api';

const formLayout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};

@Form.create({ fieldNameProp: null })
export default class LogDrawer extends React.Component {
  state = {
    tenantRoleLevel: isTenantRoleLevel(),
    progressVisible: false,
    progressValue: {},
  };

  progressTimer;

  componentWillUnmount() {
    this.clearProgressTimer();
  }

  // 清除进度获取定时器
  @Bind()
  clearProgressTimer() {
    clearInterval(this.progressTimer);
    this.progressTimer = null;
  }

  @Bind()
  showErrorModal(record) {
    const { onError = e => e } = this.props;
    onError({ logId: record.logId });
  }

  @Bind()
  handleSearch() {
    const { form, onSearch = e => e } = this.props;
    onSearch(form.getFieldsValue());
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  @Bind()
  downloadLogFile(record) {
    const { tenantId } = this.props;
    const { tenantRoleLevel } = this.state;
    const api = tenantRoleLevel
      ? `${HZERO_FILE}/v1/${tenantId}/files/download`
      : `${HZERO_FILE}/v1/files/download`;
    downloadFile({
      requestUrl: api,
      queryParams: [{ name: 'bucketName', value: 'hsdr' }, { name: 'url', value: record.logUrl }],
    });
  }

  @Bind()
  handleDeleteContent(record) {
    const { onDelete = e => e } = this.props;
    onDelete(record);
  }

  @Bind()
  handleTableChange(page) {
    const { onSearch = e => e } = this.props;
    onSearch({ page });
  }

  /**
   * @function renderForm - 渲染搜索表单
   */
  renderFilterForm() {
    const {
      dateFormat,
      form: { getFieldDecorator, getFieldValue },
      jobLogLdp = {},
    } = this.props;
    const { jobResultList = [], clientResultList = [] } = jobLogLdp;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.jobLog.model.jobLog.jobResult').d('调度结果')}
                  {...formLayout}
                >
                  {getFieldDecorator('jobResult')(
                    <Select allowClear>
                      {jobResultList.map(item => {
                        return (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.jobLog.model.jobLog.clientResult').d('客户端执行结果')}
                  {...formLayout}
                >
                  {getFieldDecorator('clientResult')(
                    <Select allowClear>
                      {clientResultList.map(item => {
                        return (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.jobLog.model.jobLog.startTime').d('开始时间')}
                  {...formLayout}
                >
                  {getFieldDecorator('startTime')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('endTime') &&
                        moment(getFieldValue('endTime')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.jobLog.model.jobLog.completeTime').d('结束时间')}
                  {...formLayout}
                >
                  {getFieldDecorator('endTime')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('startTime') &&
                        moment(getFieldValue('startTime')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
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
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  // 获取任务进度
  @Bind()
  fetchProgress(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobInfo/fetchProgress',
      payload: {
        logId: record.logId,
      },
    }).then(res => {
      if (res) {
        this.setState({ progressValue: JSON.parse(res) });
        if (res === 100) {
          this.clearProgressTimer();
          notification.info({
            message: intl.get('hsdr.jobLog.model.jobLog.showInfo').d('任务已执行完成！'),
          });
        }
      }
    });
  }

  // 打开任务进度弹窗
  @Bind()
  showProgressModal(record) {
    this.setState({ progressVisible: true }, () => {
      this.fetchProgress(record);
      this.progressTimer = setInterval(() => this.fetchProgress(record), 5000);
    });
  }

  // 关闭任务进度弹窗
  @Bind()
  closeProgressModal() {
    const { onSearch, jobPagination, form } = this.props;
    this.setState(
      {
        progressVisible: false,
      },
      () => {
        this.clearProgressTimer();
        onSearch({
          page: jobPagination.current - 1,
          size: jobPagination.pageSize,
          ...form.getFieldsValue(),
        });
      }
    );
  }

  render() {
    const {
      title,
      modalVisible,
      initLoading,
      onCancel,
      jobLogList = [],
      jobPagination = {},
    } = this.props;
    const { progressVisible, progressValue } = this.state;
    const progressProps = {
      progressVisible,
      progressValue,
      onOk: this.closeProgressModal,
    };
    const columns = [
      {
        title: intl.get('hsdr.jobLog.model.jobLog.jobId').d('任务ID'),
        width: 150,
        dataIndex: 'jobId',
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.tenantName').d('租户'),
        width: 150,
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.jobResult').d('调度结果'),
        width: 100,
        dataIndex: 'jobResultMeaning',
        render: (text, record) => {
          const statusList = [
            { status: 'SUCCESS', color: 'green' },
            { status: 'FAILURE', color: 'red' },
            { status: 'DOING', color: '' },
          ];
          return TagRender(record.jobResult, statusList, text);
        },
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.clientResult').d('客户端执行结果'),
        dataIndex: 'clientResultMeaning',
        width: 150,
        render: (text, record) => {
          const statusList = [
            { status: 'SUCCESS', color: 'green' },
            { status: 'FAILURE', color: 'red' },
            { status: 'DOING', color: '' },
          ];
          return TagRender(record.clientResult, statusList, text);
        },
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.executorName').d('执行器名称'),
        dataIndex: 'executorName',
        width: 150,
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.address').d('执行地址'),
        dataIndex: 'address',
        width: 200,
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.startTime').d('开始时间'),
        width: 150,
        dataIndex: 'startTime',
        render: dateTimeRender,
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.endTime').d('结束时间'),
        width: 150,
        dataIndex: 'endTime',
        render: dateTimeRender,
      },
      {
        title: intl.get('hsdr.jobLog.model.jobLog.message').d('错误信息'),
        dataIndex: 'messageHeader',
        width: 250,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 220,
        dataIndex: 'operator',
        fixed: 'right',
        render: (text, record) => {
          return (
            <span className="action-link">
              {record.messageHeader && (
                <a onClick={() => this.showErrorModal(record)}>
                  {intl.get('hsdr.jobLog.model.jobLog.errorDetail').d('错误详情')}
                </a>
              )}
              {record.logUrl && (
                <a onClick={() => this.downloadLogFile(record)}>
                  {intl.get('hsdr.jobLog.model.jobLog.logUrl').d('日志文件')}
                </a>
              )}
              {record.clientResult === 'DOING' && (
                <a onClick={() => this.showProgressModal(record)}>
                  {intl.get('hsdr.jobLog.model.jobLog.taskProgress').d('任务进度')}
                </a>
              )}
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => this.handleDeleteContent(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ].filter(col => {
      return isTenantRoleLevel() ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        width={1000}
        visible={modalVisible}
        onCancel={onCancel}
        footer={false}
      >
        <div className="table-list-search">{this.renderFilterForm()}</div>
        <Table
          bordered
          rowKey="logId"
          loading={initLoading}
          dataSource={jobLogList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={jobPagination}
          onChange={this.handleTableChange}
        />
        {progressVisible && <ProgressModal {...progressProps} />}
      </Modal>
    );
  }
}
