/**
 * Allocation - 消息配置
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Form, Modal } from 'hzero-ui';
import { isEmpty, omit } from 'lodash';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import { createPagination, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import TenantTable from './TenantTable';
import DbTable from './DbTable';
import styles from '../index.less';

// const FormItem = Form.Item;
const { TabPane } = Tabs;
const promptCode = 'hdtt.producerConfig';
const messagePrompt = 'hdtt.producerConfig.view.message';
/**
 * 消息配置
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ producerConfig, loading }) => ({
  producerConfig,
  loading:
    loading.effects['producerConfig/queryTenant'] || loading.effects['producerConfig/queryDb'],
  deleting: loading.effects['producerConfig/deleteTenant'],
  saving: loading.effects['producerConfig/saveDb'],
  savingTenant: loading.effects['producerConfig/saveTenant'],
}))
@Form.create({ fieldNameProp: null })
export default class Allocation extends PureComponent {
  state = {
    activeKey: 'tenant',
    selectedRows: [],
    tenantPaging: {},
    dbPaging: {},
  };

  componentDidMount() {
    this.loadData();
  }

  /**
   * 按条件查询
   */
  @Bind()
  loadData(payload = { page: 0, size: 10 }) {
    const {
      dispatch,
      match: {
        params: { producerConfigId },
      },
    } = this.props;
    const { activeKey, tenantPaging, dbPaging } = this.state;
    if (activeKey === 'tenant') {
      dispatch({
        type: 'producerConfig/queryTenant',
        payload: { ...payload, producerConfigId, ...tenantPaging },
      });
    } else if (activeKey === 'DB') {
      dispatch({
        type: 'producerConfig/queryDb',
        payload: { ...payload, producerConfigId, ...dbPaging },
      });
    }
  }

  /**
   * 保寸tabs的key到state
   * @param {*} activeKey 激活的key
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey }, () => {
      this.loadData();
    });
  }

  /**
   * 分配租户表格分页
   * @param {*} pagination
   */
  @Bind()
  handleTenantTableChange(pagination) {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
    };
    this.setState({ tenantPaging: params }, () => {
      this.loadData();
    });
  }

  /**
   * 分配DB表格分页
   * @param {*} pagination
   */
  @Bind()
  handleDbTableChange(pagination) {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
    };
    this.setState({ dbPaging: params }, () => {
      this.loadData();
    });
  }

  /**
   * 把选择的行数据存在state里
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   *删除分发租户表数据
   *
   * @memberof Allocation
   */
  @Bind()
  handleTenantDelete() {
    const {
      dispatch,
      match: {
        params: { producerConfigId },
      },
      producerConfig: { tenantData },
    } = this.props;
    const { content } = tenantData;
    const that = this;
    const { selectedRows } = this.state;
    const tenantConfigId = selectedRows.map(item => {
      return item.consTenantConfigId;
    });
    if (!isEmpty(tenantConfigId)) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示框?'),
        content: intl.get(`${messagePrompt}.title.content`).d('确定删除吗？'),
        onOk() {
          const ids = [];
          const newContent = [];
          content.forEach(item => {
            if (!item.isNew && tenantConfigId.indexOf(item.consTenantConfigId) >= 0) {
              ids.push(item.consTenantConfigId);
            }
            if (!(item.isNew && tenantConfigId.indexOf(item.consTenantConfigId) >= 0)) {
              newContent.push(item);
            }
          });
          if (ids.length > 0) {
            dispatch({
              type: 'producerConfig/deleteTenant',
              payload: {
                producerConfigId,
                consTenantConfigIdList: ids,
              },
            }).then(() => {
              dispatch({
                type: 'producerConfig/updateState',
                payload: {
                  tenantData: {
                    ...tenantData,
                    content: newContent,
                  },
                },
              });
              notification.success();
              that.loadData();
            });
          } else {
            dispatch({
              type: 'producerConfig/updateState',
              payload: {
                tenantData: {
                  ...tenantData,
                  content: newContent,
                },
              },
            });
            notification.success();
            that.loadData();
          }
        },
      });
    } else {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.handleTenantDelete`)
          .d('请勾选您要删除的数据'),
      });
    }
  }

  /**
   *移除对象中的某个属性
   *
   * @param {*} obj 传入的对象
   * @param {*} paramsArr 对象里的key
   * @returns
   * @memberof ProducerConfig
   */
  handleRemoveProps(obj, paramsArr) {
    const newItem = { ...obj };
    paramsArr.forEach(item => {
      if (newItem[item]) {
        delete newItem[item];
      }
    });
    return newItem;
  }

  /**
   * 行内编辑分发Db表
   */
  @Bind()
  handleEditRow(record) {
    const {
      producerConfig: { dbList },
      dispatch,
    } = this.props;
    const newDbList = dbList.map(item => {
      if (record.consDbConfigId === item.consDbConfigId) {
        return { ...item, _status: 'update' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'producerConfig/updateAllocation',
      payload: { dbList: newDbList },
    });
  }

  /**
   *取消编辑行
   *
   * @param {*} record 行数据
   * @memberof ProducerConfig
   */
  @Bind()
  handleCancel(record) {
    const {
      dispatch,
      producerConfig: { dbList },
    } = this.props;
    const newDbList = dbList.map(item => {
      if (item.consDbConfigId === record.consDbConfigId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'producerConfig/updateAllocation',
      payload: { dbList: newDbList },
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
      producerConfig: { tenantData },
    } = this.props;
    const { content, totalElements, size } = tenantData;
    dispatch({
      type: 'producerConfig/updateState',
      payload: {
        tenantData: {
          ...tenantData,
          totalElements: totalElements + 1,
          size: content.length === size ? size + 1 : size,
          content: [
            {
              consTenantConfigId: uuidv4(),
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
   * 保存编辑tenant列表数据
   */
  @Bind()
  handleSaveTenantList() {
    const {
      dispatch,
      producerConfig: { tenantData },
      form,
      match: {
        params: { producerConfigId },
      },
    } = this.props;
    const { content = [] } = tenantData;
    form.validateFields((err, values) => {
      if (!err) {
        const EditDataList = content.filter(item => item.editable);
        const fieldsArr = ['consServiceName', 'tenantId', 'consDbCode', 'consTableName'];
        let editData = [];
        if (EditDataList.length) {
          editData = EditDataList.map(item => {
            const targetItem = { ...item };
            fieldsArr.forEach(_item => {
              targetItem[`${_item}`] = values[`${_item}#${item.consTenantConfigId}`];
            });
            if (item.isNew) {
              return omit(targetItem, ['editable', 'isNew', 'consTenantConfigId']);
            } else {
              return omit(targetItem, ['editable', 'isNew']);
            }
          });
        }
        dispatch({
          type: 'producerConfig/saveTenant',
          payload: {
            editData,
            producerConfigId,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.loadData();
          }
        });
      }
    });
  }

  /**
   * 保存编辑db列表数据
   */
  @Bind()
  handleSaveDbList() {
    const {
      dispatch,
      producerConfig: { dbList },
    } = this.props;
    const editData = getEditTableData(dbList, ['consDbConfigId']);
    if (isEmpty(editData)) return;

    dispatch({
      type: 'producerConfig/saveDb',
      payload: { editData },
    }).then(res => {
      if (res) {
        notification.success();
        this.loadData();
      }
    });
  }

  /**
   * 清除新增行
   * @param {object} record - 行数据对象
   */
  @Bind()
  handleClean(record) {
    const {
      dispatch,
      producerConfig: { tenantData },
    } = this.props;
    const { content } = tenantData;
    const newContent = content.filter(
      item => item.consTenantConfigId !== record.consTenantConfigId
    );
    dispatch({
      type: 'producerConfig/updateState',
      payload: {
        tenantData: {
          ...tenantData,
          content: newContent,
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
      producerConfig: { tenantData },
    } = this.props;
    const { content } = tenantData;
    const index = content.findIndex(item => item.consTenantConfigId === record.consTenantConfigId);
    dispatch({
      type: 'producerConfig/updateState',
      payload: {
        tenantData: {
          ...tenantData,
          content: [...content.slice(0, index), record, ...content.slice(index + 1)],
        },
      },
    });
  }

  render() {
    const {
      loading,
      deleting,
      saving,
      form,
      savingTenant,
      producerConfig: { tenantData, dbData, dbList },
      match: {
        params: { tableName },
      },
    } = this.props;
    const { activeKey } = this.state;
    const tenantProps = {
      loading,
      form,
      tableName,
      dataSource: tenantData.content,
      rowSelection: { onChange: this.onSelectChange },
      pagination: createPagination(tenantData),
      onChange: this.handleTenantTableChange,
      clean: this.handleClean,
      edit: this.handleEditOption,
    };
    const dbProps = {
      form,
      loading,
      dataSource: dbList,
      pagination: createPagination(dbData),
      onChange: this.handleDbTableChange,
      editRow: this.handleEditRow,
      handleCancel: this.handleCancel,
    };
    const isSaveList = dbList.filter(item => {
      return item._status === 'update';
    });
    const isTenant = activeKey === 'tenant';
    const isDB = activeKey === 'DB';
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.allocation`).d('消息配置')}
          backPath="/hdtt/producer-config/list"
        >
          {isTenant && (
            <Button icon="plus" type="primary" onClick={this.handleAddLine}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
          {isTenant && (
            <Button icon="save" onClick={this.handleSaveTenantList} loading={savingTenant}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {isTenant && (
            <Button icon="delete" loading={deleting} onClick={this.handleTenantDelete}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
          {isDB && (
            <Button
              icon="save"
              type="primary"
              disabled={isEmpty(isSaveList)}
              loading={saving}
              onClick={this.handleSaveDbList}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content>
          <Tabs animated={false} defaultActiveKey="tenant" onChange={this.handleSaveKey}>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.tab.writeQuestionnaire`).d('分发租户')}
              key="tenant"
              className={styles.table}
            >
              <TenantTable {...tenantProps} />
            </TabPane>
            <TabPane tab={intl.get(`${promptCode}.view.message.tab.seeInfo`).d('分发DB')} key="DB">
              <DbTable {...dbProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
