/**
 * InitialProcess - 数据初始化处理
 * @date: 2018-8-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Tabs, Modal } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { omit, includes, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import { createPagination } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import TenantTable from './TenantTable';
import DbTable from './DbTable';

@Form.create({ fieldNameProp: null })
@connect(({ initialProcess, loading }) => ({
  initialProcess,
  loading,
}))
@formatterCollections({ code: 'hdtt.initialProcess' })
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {
    tabKey: 'tanant',
  };

  /**
   * 生命周期函数
   *render调用后，获取页面展示数据
   */
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'initialProcess/fetchDetail',
      payload: {
        sqlProcessId: match.params.sqlProcessId,
      },
    });
    dispatch({
      type: 'initialProcess/featchTenantProcess',
      payload: {
        sqlProcessId: match.params.sqlProcessId,
      },
    });
    dispatch({
      type: 'initialProcess/featchDBProcess',
      payload: {
        sqlProcessId: match.params.sqlProcessId,
      },
    });
  }

  /**
   * 批量新增数据聚合
   * @param {Object} obj 新增或编辑的数据
   * @param {Array} dataSource 数据列表
   * @return {Array} composedData 聚合后的数据列表
   */
  composedData(obj, dataSource) {
    let addData = [];
    const invalid = Object.keys(obj).filter(item => !includes(item, '#'));
    const newObj = omit(obj, [...invalid]);
    const keys = Object.keys(newObj);
    keys.forEach(item => {
      addData.push(item.split('#')[1]);
    });
    addData = Array.from(new Set(addData));
    const composedData = addData.map(id => {
      const target = keys.filter(key => key.split('#')[1] !== id);
      const d = omit(newObj, target);
      const temp = {};
      Object.keys(d).forEach(i => {
        const k = i.split('#')[0];
        temp[k] = d[i];
      });
      const data = dataSource.find(item => `${item.tenantProcessId}` === id); // 数字转字符串
      return {
        ...data,
        ...temp,
      };
    });
    return composedData;
  }

  /**
   * Tab页切换
   */
  @Bind()
  handleChangeTag(activeKey) {
    if (activeKey === 'tenant') {
      this.setState({ display: true, tabKey: activeKey });
    } else {
      this.setState({ display: false, tabKey: activeKey });
    }
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  handleSearch(fields) {
    const { tabKey } = this.state;
    const { dispatch, match } = this.props;
    let type = 'initialProcess/featchTenantProcess';
    if (tabKey === 'db') {
      type = 'initialProcess/featchDBProcess';
    }
    dispatch({
      type,
      payload: {
        sqlProcessId: match.params.sqlProcessId,
        ...fields,
      },
    });
    dispatch({
      type: 'initialProcess/fetchDetail',
      payload: {
        sqlProcessId: match.params.sqlProcessId,
      },
    });
    this.setState({ selectedRows: [], selectedRowKeys: [] });
  }

  /**
   * 租户处理-数据列表行选择行为
   * @param {Array} newSelectedRowKeys - 选中行rowkey
   * @param {Array[Object]} selectedRows - 选中行
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 新增数据
   * 新增数据默认不选中，故不会添加到state.selectedRows中
   */
  @Bind()
  handleAddLine() {
    const {
      dispatch,
      match,
      initialProcess: { tenantProcess },
    } = this.props;
    const { content, totalElements, size } = tenantProcess;
    dispatch({
      type: 'initialProcess/updateState',
      payload: {
        tenantProcess: {
          ...tenantProcess,
          totalElements: totalElements + 1,
          size: content.length === size ? size + 1 : size,
          content: [
            {
              tenantProcessId: uuidv4(),
              sqlProcessId: match.params.sqlProcessId,
              consumerService: '',
              tenantId: '',
              dbProcessId: '',
              tenantName: '',
              processDate: '',
              nodeGroupId: '',
              isNew: true,
              editable: true,
            },
            ...content,
          ],
        },
      },
    });
  }

  /**
   * 保存数据
   * 数据可能为新增数据，也可能为非新增数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form,
      initialProcess: { tenantProcess },
    } = this.props;
    const { content } = tenantProcess;
    const editList = content.filter(item => item.editable);
    // 校验： 数据未变更(变更：新增/修改)不进行保存操作
    if (editList.length === 0) {
      notification.warning({
        message: intl.get('hdtt.initProcess.view.message.add.warning').d('未新增任何数据行'),
      });
      return;
    }
    form.validateFields((err, values) => {
      if (!err) {
        // 如果验证成功,则执行save
        const saveData = this.composedData(values, editList).map(item => {
          const { isNew, editable, tenantProcessId, dbProcessId, ...others } = item;
          if (isNew) {
            // 新增行，无tenantProcessId
            const processDate = undefined;
            return { ...others, processDate };
          } else {
            // 非新增行，有tenantProcessId,无dbProcessId
            return { ...others, tenantProcessId };
          }
        });
        dispatch({
          type: 'initialProcess/saveTenantProcess',
          payload: {
            saveData,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch({});
            this.setState({ selectedRows: [], selectedRowKeys: [] });
          }
        });
      }
    });
  }

  /**
   * 删除数据(仅对选中行有效)
   * 删除的数据可能为新增数据，也可能为非新增数据
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state; // 选中的行
    const completeList = selectedRows.filter(item => item.processStatus === 'COMPLETE');
    // 校验： 完成状态的处理行不可删除
    if (completeList.length !== 0) {
      notification.warning({
        message: intl.get('httd.initProcess.view.message.remove.warning').d('完成状态数据不可删除'),
      });
      return;
    }
    // 选中行中非新增行数据
    const dataList = selectedRows.filter(item => isUndefined(item.isNew));

    dispatch({
      type: 'initialProcess/deleteTenantProcess',
      payload: {
        dataList,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch({});
        this.setState({ selectedRows: [], selectedRowKeys: [] });
      }
    });
  }

  /**
   * 提交处理（对象：必须是非新增行）
   */
  @Bind()
  handleSubmit() {
    const {
      dispatch,
      match,
      initialProcess: { tenantProcess },
    } = this.props;
    const newItems = tenantProcess.content.filter(item => item.isNew);
    const unNewItems = tenantProcess.content.filter(item => isUndefined(item.isNew));

    // 当前列表中存在新增行(未保存)，进行提示
    if (newItems.length !== 0) {
      notification.warning({
        message: intl.get('hdtt.initProcess.view.message.unsave').d('新增数据未保存'),
      });
      return;
    }
    dispatch({
      type: 'initialProcess/submit',
      payload: {
        data: unNewItems,
        sqlProcessId: match.params.sqlProcessId,
      },
    }).then(res => {
      if (res) {
        Modal.confirm({
          title: '',
          iconType: 'warning',
          content: intl.get('hdtt.initProcess.view.message.continue').d('是否继续?'),
          okText: intl.get('hzero.common.button.continue').d('继续'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: () => {
            dispatch({
              type: 'initialProcess/asyncSubmit',
              payload: {
                data: unNewItems,
                sqlProcessId: match.params.sqlProcessId,
              },
            }).then(result => {
              if (result) {
                notification.success();
                this.handleSearch({});
                this.setState({ selectedRows: [], selectedRowKeys: [] });
              }
            });
          },
        });
      } else {
        notification.success();
        this.handleSearch({});
        this.setState({ selectedRows: [], selectedRowKeys: [] });
      }
    });
  }

  /**
   * 数据导出
   */
  @Bind()
  handleExport() {}

  /**
   * 清除新增行
   * @param {object} record - 行数据对象
   */
  @Bind()
  handleClean(record) {
    const {
      dispatch,
      initialProcess: { tenantProcess },
    } = this.props;
    const { content } = tenantProcess;
    const index = content.findIndex(item => item.tenantProcessId === record.tenantProcessId);
    dispatch({
      type: 'initialProcess/updateState',
      payload: {
        tenantProcess: {
          ...tenantProcess,
          content: [...content.slice(0, index), ...content.slice(index + 1)],
        },
      },
    });
  }

  /**
   * 行编辑
   * @param {object} record - 行数据对象
   */
  @Bind()
  handleEditOption(record) {
    const {
      dispatch,
      initialProcess: { tenantProcess },
    } = this.props;
    const { content } = tenantProcess;
    const index = content.findIndex(item => item.tenantProcessId === record.tenantProcessId);
    dispatch({
      type: 'initialProcess/updateState',
      payload: {
        tenantProcess: {
          ...tenantProcess,
          content: [...content.slice(0, index), record, ...content.slice(index + 1)],
        },
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      initialProcess: { dbProcess = {}, tenantProcess = {}, detail = {} },
      loading,
      form,
    } = this.props;
    const { display = true, selectedRowKeys = [] } = this.state;
    const tenantProps = {
      form,
      processStatus: detail.processStatus,
      dataSource: tenantProcess.content,
      pagination: createPagination(tenantProcess),
      loading: loading.effects['initialProcess/featchTenantProcess'],
      onChange: page => this.handleSearch({ page: page.current - 1 }),
      onEdit: this.handleEditOption,
      onClean: this.handleClean,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelectChange,
      },
    };
    const dbProps = {
      dataSource: dbProcess.content,
      pagination: createPagination(dbProcess),
      loading: loading.effects['initialProcess/featchDBProcess'],
      onChange: page => this.handleSearch({ page: page.current - 1 }),
    };
    const isPending = detail.processStatus === 'PENDING';
    const isTenant = display;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hdtt.initProcess.view.message.title.destribute').d('分发处理')}
          backPath="/hdtt/init-process"
        >
          {/* // FIXME: 由于只有这个按钮一直在 所以设置为 primary */}
          <Button type="primary" icon="sync" onClick={() => this.handleSearch({})}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button>
          <Button
            icon="plus"
            onClick={this.handleAddLine}
            style={{ display: isPending && isTenant ? 'inline-table' : 'none' }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="save"
            onClick={this.handleSave}
            style={{ display: isPending && isTenant ? 'inline-table' : 'none' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            onClick={this.handleDelete}
            style={{ display: isPending && isTenant ? 'inline-table' : 'none' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            icon="check"
            onClick={this.handleSubmit}
            style={{ display: isPending && isTenant ? 'inline-table' : 'none' }}
          >
            {intl.get('hdtt.initialProcess.view.option.submit').d('提交处理')}
          </Button>
          <Button
            icon="download"
            onClick={this.handleExport}
            style={{ display: isTenant ? 'none' : 'block' }}
            disabled
          >
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        </Header>
        <Content>
          <Tabs defaultActiveKey="tenant" type="card" onChange={this.handleChangeTag}>
            <Tabs.TabPane
              tab={intl.get('hdtt.initProcess.view.message.tab.tenant').d('租户处理')}
              key="tenant"
            >
              <TenantTable {...tenantProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hdtt.initProcess.view.message.tab.db').d('DB处理')}
              key="db"
            >
              <DbTable {...dbProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
