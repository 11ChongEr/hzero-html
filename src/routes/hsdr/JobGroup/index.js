/**
 * 任务执行器
 * @date: 2018-9-3
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Table, Popconfirm } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { addressTypeRender } from 'utils/renderer';
import notification from 'utils/notification';
import {
  filterNullValueObject,
  isTenantRoleLevel,
  tableScrollWidth,
  getEditTableData,
} from 'utils/utils';

import JobGroupForm from './JobGroupForm';
import FilterForm from './FilterForm';
import ExecutorDrawer from './ExecutorDrawer.js';

/**
 * 任务执行器
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} jobGroup - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hsdr.jobGroup', 'entity.tenant'] })
@Form.create({ fieldNameProp: null })
@connect(({ jobGroup, loading }) => ({
  jobGroup,
  tenantRoleLevel: isTenantRoleLevel(),
  saving: loading.effects['jobGroup/updateGroups'],
  creating: loading.effects['jobGroup/createGroups'],
  fetchList: loading.effects['jobGroup/fetchGroupsList'],
  fetchExecutorLoading: loading.effects['jobGroup/fetchExecutorList'],
  deleteExecutorLoading: loading.effects['jobGroup/deleteExecutor'],
  saveExecutorLoading: loading.effects['jobGroup/updateExecutor'],
}))
export default class JobGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupsData: {},
      selectExecutorRecord: {},
      executorModalVisible: false,
    };
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobGroup/init',
    });
    this.fetchGroupsList();
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  fetchGroupsList(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'jobGroup/fetchGroupsList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * @function showModal - 新增显示模态框
   */
  @Bind()
  showModal() {
    this.setState({ groupsData: {} }, () => {
      this.handleModalVisible(true);
    });
  }

  /**
   * @function handleModalVisible - 控制modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  @Bind()
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'jobGroup/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  @Bind()
  handleModalSave(fieldsValue) {
    const {
      dispatch,
      jobGroup: { pagination },
    } = this.props;
    const { groupsData = {} } = this.state;
    // if (groupsData.executorType !== 0) {
    dispatch({
      type: `jobGroup/${groupsData.executorId ? 'updateGroups' : 'createGroups'}`,
      payload: {
        executorType: 1,
        ...groupsData,
        ...fieldsValue,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleModalVisible(false);
        this.fetchGroupsList(pagination);
      }
    });
    // } else {
    //   this.handleModalVisible(false);
    // }
  }

  /**
   * @function handleUpdateEmail - 编辑
   * @param {object} record - 头数据
   */
  @Bind()
  handleUpdateGroups(record) {
    this.setState({ groupsData: record });
    this.handleModalVisible(true);
  }

  @Bind()
  showExecutorModal(flag) {
    this.setState({ executorModalVisible: flag });
  }

  @Bind()
  handleCancelExecutor() {
    this.showExecutorModal(false);
  }

  @Bind()
  handleSaveExecutor() {
    const { dispatch, jobGroup = {} } = this.props;
    const { executorList = [] } = jobGroup;
    const params = getEditTableData(executorList, ['executorId']);
    if (Array.isArray(params) && params.length > 0) {
      dispatch({
        type: 'jobGroup/updateExecutor',
        payload: params,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchExecutorList();
        }
      });
    }
  }

  /**
   * 删除执行器配置
   */
  @Bind()
  handleDeleteExecutor(data = [], keys = []) {
    const {
      dispatch,
      jobGroup: { executorList = [] },
    } = this.props;
    const filterData = data.filter(item => item._status !== 'create');
    // 删除未保存的数据
    const createList = data.filter(item => item._status === 'create');
    if (createList.length > 0) {
      const deleteList = executorList.filter(item => {
        return !keys.includes(item.executorId);
      });
      dispatch({
        type: 'jobGroup/updateState',
        payload: { executorList: deleteList },
      });
      notification.success();
    }
    if (filterData.length > 0) {
      dispatch({
        type: 'jobGroup/deleteExecutor',
        payload: filterData,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchExecutorList();
        }
      });
    }
  }

  @Bind()
  handleEditExecutor(record, flag) {
    const {
      jobGroup: { executorList = [] },
      dispatch,
    } = this.props;
    const newList = executorList.map(item => {
      if (record.configId === item.configId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'jobGroup/updateState',
      payload: { executorList: newList },
    });
  }

  /**
   * 执行器配置
   */
  @Bind()
  handleExecutorConfig(record) {
    this.showExecutorModal(true);
    this.setState({ selectExecutorRecord: record }, () => {
      this.fetchExecutorList();
    });
  }

  /**
   * 获取执行器配置列表
   * @param {object} params - 查询参数
   */
  @Bind()
  fetchExecutorList(params) {
    const { dispatch } = this.props;
    const { selectExecutorRecord = {} } = this.state;
    const { executorId } = selectExecutorRecord;
    dispatch({
      type: 'jobGroup/fetchExecutorList',
      payload: { ...params, executorId },
    });
  }

  /**
   * 数据列表，头删除
   * @function handleDeleteGroups
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteGroups(record) {
    const {
      dispatch,
      jobGroup: { pagination },
    } = this.props;
    dispatch({
      type: 'jobGroup/deleteGroups',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchGroupsList(pagination);
      }
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchList,
      saving,
      creating,
      tenantRoleLevel,
      saveExecutorLoading = false,
      deleteExecutorLoading = false,
      fetchExecutorLoading = false,
      jobGroup: { groupsList, modalVisible, pagination, statusList, scopeList, executorList = [] },
    } = this.props;
    const {
      groupsData: { executorId },
      executorModalVisible,
      selectExecutorRecord,
    } = this.state;
    const jobGroupFormProps = {
      saving,
      creating,
      modalVisible,
      statusList,
      tenantRoleLevel,
      scopeList,
      modalTitle: executorId
        ? intl.get('hsdr.jobGroup.view.message.edit').d('编辑执行器')
        : intl.get('hsdr.jobGroup.view.message.create').d('新增执行器'),
      initData: this.state.groupsData,
      onCancel: () => this.handleModalVisible(false),
      onOk: this.handleModalSave,
    };
    const filterProps = {
      onSearch: this.fetchGroupsList,
      onRef: this.handleBindRef,
    };
    const executorProps = {
      selectExecutorRecord,
      modalVisible: executorModalVisible,
      saveLoading: saveExecutorLoading || deleteExecutorLoading,
      initLoading: fetchExecutorLoading,
      dataSource: executorList,
      onEdit: this.handleEditExecutor,
      onDelete: this.handleDeleteExecutor,
      onOk: this.handleSaveExecutor,
      onCancel: this.handleCancelExecutor,
    };
    const columns = [
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.orderSeq').d('排序'),
        dataIndex: 'orderSeq',
        width: 80,
      },
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.executorCode').d('执行器编码'),
        dataIndex: 'executorCode',
        width: 300,
      },
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.executorName').d('执行器名称'),
        dataIndex: 'executorName',
        width: 150,
      },
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.addressType').d('注册方式'),
        dataIndex: 'executorType',
        width: 120,
        render: addressTypeRender,
      },
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.addressList').d('OnLine 机器地址'),
        dataIndex: 'addressList',
      },
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.status').d('状态'),
        dataIndex: 'statusMeaning',
        width: 80,
      },
      {
        title: intl.get('hsdr.jobGroup.model.jobGroup.scope').d('层级'),
        dataIndex: 'scopeMeaning',
        width: 80,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        fixed: 'right',
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.handleExecutorConfig(record)}>
              {intl.get('hsdr.jobGroup.button.executor').d('配置')}
            </a>
            <a onClick={() => this.handleUpdateGroups(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            {(record.executorType === 1 ||
              (record.executorType === 0 && record.status === 'OFFLINE')) && (
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => this.handleDeleteGroups(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            )}
          </span>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <React.Fragment>
        <Header title={intl.get('hsdr.jobGroup.view.message.group').d('执行器管理')}>
          <Button type="primary" icon="plus" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="executorId"
            loading={fetchList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            dataSource={groupsList}
            pagination={pagination}
            onChange={this.fetchGroupsList}
          />
          <JobGroupForm {...jobGroupFormProps} />
          <ExecutorDrawer {...executorProps} />
        </Content>
      </React.Fragment>
    );
  }
}
