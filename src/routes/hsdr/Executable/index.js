/**
 * Concurrent - 并发管理器/可执行定义
 * @date: 2018-9-7
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Table, Popconfirm, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, isTenantRoleLevel, tableScrollWidth } from 'utils/utils';
import Drawer from './Drawer';

const FormItem = Form.Item;
const { Option } = Select;
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hsdr.executable', 'entity.tenant'] })
@connect(({ loading, executable }) => ({
  executable,
  saving:
    loading.effects['executable/updateExecutable'] ||
    loading.effects['executable/createExecutable'],
  fetching: loading.effects['executable/fetchExecutable'],
  tenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
export default class Executable extends React.PureComponent {
  Drawer;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'executable/init',
    });
    // dispatch({
    //   type: 'executable/fetchGroupsList',
    //   payload: {},
    // });
    this.handleSearch();
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      const fieldValues = values || {};
      if (!err) {
        dispatch({
          type: 'executable/fetchExecutable',
          payload: {
            page: isEmpty(fields) ? {} : fields,
            ...fieldValues,
          },
        });
      }
    });
  }

  @Bind()
  queryGroups() {
    const { dispatch } = this.props;
    dispatch({
      type: 'executable/fetchGroupsList',
      payload: {},
    });
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
      type: 'executable/updateState',
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
      type: 'executable/updateState',
      payload: {
        executableDetail: {},
      },
    });
    this.handleModalVisible(true);
  }

  /**
   * @function handleAdd - 新增或编辑可执行数据
   * @param {Object} fieldsValue - 编辑的数据
   */
  @Bind()
  handleAdd(fieldsValue) {
    const {
      dispatch,
      executable: { pagination, executableDetail },
      tenantId,
    } = this.props;
    const { executableId, _token, objectVersionNumber } = executableDetail;
    const { strategyParam, ...others } = fieldsValue;
    dispatch({
      type: `executable/${executableId ? 'updateExecutable' : 'createExecutable'}`,
      payload: {
        _token,
        objectVersionNumber,
        strategyParam: JSON.stringify(strategyParam),
        ...others,
        executableId,
        // enabledFlag: enabledFlag ? 1 : 0,
        tenantId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleModalVisible(false);
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * @function renderForm - 渲染搜索表单
   */
  renderFilterForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      executable: { groupsList = [] },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('hsdr.executable.model.executable.executableName').d('可执行名称')}
        >
          {getFieldDecorator('executableName', {})(<Input />)}
        </FormItem>
        <FormItem label={intl.get('hsdr.executable.model.executable.groupId').d('执行器')}>
          {getFieldDecorator('executorId', {})(
            <Select style={{ width: '150px' }} allowClear onFocus={this.queryGroups}>
              {groupsList.map(item => {
                return (
                  <Option label={item.executorName} value={item.executorId} key={item.executorId}>
                    {item.executorName}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('hsdr.executable.model.executable.executableDesc').d('可执行描述')}
        >
          {getFieldDecorator('executableDesc', {})(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * @function handleUpdateEmail - 编辑
   * @param {object} record - 行数据
   */
  @Bind()
  handleUpdate(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'executable/fetchExecutableDetail',
      payload: {
        executableId: record.executableId,
      },
    });
    this.handleModalVisible(true);
  }

  /**
   * 数据列表，删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      executable: { pagination },
    } = this.props;
    dispatch({
      type: 'executable/deleteHeader',
      payload: { ...record },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  render() {
    const { executable, saving, fetching, tenantRoleLevel } = this.props;
    const { executableList = [], pagination, modalVisible, executableDetail } = executable;
    const columns = [
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        width: 200,
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hsdr.executable.model.executable.executableCode').d('可执行编码'),
        width: 150,
        dataIndex: 'executableCode',
      },
      {
        title: intl.get('hsdr.executable.model.executable.executableName').d('可执行名称'),
        width: 200,
        dataIndex: 'executableName',
      },
      {
        title: intl.get('hsdr.executable.model.executable.exeTypeCode').d('可执行类型'),
        width: 200,
        dataIndex: 'exeTypeMeaning',
      },
      {
        title: 'JobHandler',
        width: 150,
        dataIndex: 'jobHandler',
      },
      {
        title: intl.get('hsdr.executable.model.executable.failStrategy').d('失败处理策略'),
        width: 120,
        dataIndex: 'failStrategyMeaning',
      },
      {
        title: intl.get('hsdr.executable.model.executable.groupId').d('执行器'),
        width: 200,
        dataIndex: 'executorName',
      },
      {
        title: intl.get('hsdr.executable.model.executable.executorStrategy').d('执行器策略'),
        width: 100,
        dataIndex: 'executorStrategyMeaning',
      },
      {
        title: intl.get('hsdr.executable.model.executable.executableDesc').d('可执行描述'),
        dataIndex: 'executableDesc',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
        fixed: 'right',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        dataIndex: 'edit',
        fixed: 'right',
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleUpdate(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
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
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    const title = executableDetail.executableId
      ? intl.get('hzero.common.button.edit').d('编辑')
      : intl.get('hzero.common.button.create').d('新建');

    const drawerProps = {
      title,
      executable,
      loading: saving,
      visible: modalVisible,
      initData: executableDetail,
      onCancel: () => this.handleModalVisible(false),
      onOk: this.handleAdd,
      onSearchGroup: this.queryGroups,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hsdr.executable.view.message.title.list').d('可执行定义')}>
          <Button icon="plus" type="primary" onClick={this.showCreateModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            rowKey="executableId"
            loading={fetching}
            dataSource={executableList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handleSearch}
          />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
