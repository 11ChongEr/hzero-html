/**
 * Table - 菜单配置 - 列表页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { Table, Button, Modal } from 'hzero-ui';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import InterfaceDrawer from '../Interface';

import styles from './index.less';

const modelPrompt = 'hitf.services.model.services';
const viewMessagePrompt = 'hitf.services.view.message';
const commonPrompt = 'hzero.common';

export default class InterfaceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interfaceDrawerVisible: false,
      interfaceListActionRow: {},
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const { dataSource } = nextProps;
  //   const { prevDataSource } = prevState;
  //   if (dataSource !== prevDataSource) {
  //     return {
  //       dataSource,
  //       prevDataSource: dataSource,
  //     };
  //   }
  //   return null;
  // }
  defaultTableRowKey = 'interfaceId';

  /**
   * 先设置当前接口信息然后打开接口编辑弹窗
   * @param {*} [interfaceListActionRow={}]
   */
  openInterfaceDrawer(interfaceListActionRow = {}) {
    this.setState(
      {
        interfaceListActionRow,
      },
      () => {
        this.setState({ interfaceDrawerVisible: true });
      }
    );
  }

  closeInterfaceDrawer() {
    this.setState({
      interfaceDrawerVisible: false,
      interfaceListActionRow: {},
    });
  }

  handleSaveInterface(item, cb) {
    const { onChangeState, dataSource } = this.props;
    let newDataSource = [];
    if (item.interfaceId) {
      newDataSource = dataSource.map(_item => {
        if (_item.interfaceId === item.interfaceId) {
          return {
            ..._item,
            ...item,
          };
        }
        return _item;
      });
    } else {
      newDataSource = [{ ...item, interfaceId: uuid(), isNew: true }, ...dataSource];
    }
    onChangeState('interfaceListDataSource', newDataSource);
    // this.setState({
    //   dataSource: newDataSource,
    // });
    cb();
  }

  handleDeleteService() {
    const {
      selectedRowKeys,
      dataSource,
      onRowSelectionChange,
      deleteLines,
      onChangeState,
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('确认框？'),
        content: intl.get(`${viewMessagePrompt}.title.deleteContent`).d('确定删除吗？'),
        onOk() {
          const ids = [];
          const newDataSource = [];
          dataSource.forEach(item => {
            if (!item.isNew && selectedRowKeys.indexOf(item.interfaceId) >= 0) {
              ids.push(item);
            }
            if (selectedRowKeys.indexOf(item.interfaceId) < 0) {
              newDataSource.push(item);
            }
          });
          if (ids.length > 0) {
            deleteLines(ids).then(res => {
              if (res) {
                onRowSelectionChange([], []);
                notification.success();
                onChangeState('interfaceListDataSource', newDataSource);
              }
            });
          } else {
            onRowSelectionChange([], []);
            notification.success();
            onChangeState('interfaceListDataSource', newDataSource);
          }
        },
      });
    }
  }

  render() {
    const {
      pagination,
      selectedRowKeys = [],
      onChange = e => e,
      onRowSelectionChange = e => e,
      type,
      processing = {},
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      editorHeaderForm,
      dataSource,
    } = this.props;
    const { interfaceDrawerVisible, interfaceListActionRow } = this.state;
    const interfaceDrawerProps = {
      type,
      processing,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      editorHeaderForm,
      visible: interfaceDrawerVisible,
      dataSource: interfaceListActionRow,
      onCancel: this.closeInterfaceDrawer.bind(this),
      save: this.handleSaveInterface.bind(this),
    };
    const tableColumns = [
      {
        title: intl.get(`${commonPrompt}.interfaceCode`).d('接口编码'),
        dataIndex: 'interfaceCode',
      },
      {
        title: intl.get(`${commonPrompt}.interfaceName`).d('接口名称'),
        dataIndex: 'interfaceName',
      },
      {
        title: intl.get(`${commonPrompt}.interfaceUrl`).d('接口地址'),
        dataIndex: 'interfaceUrl',
      },
      {
        title: intl.get(`${commonPrompt}.releaseType`).d('发布类型'),
        dataIndex: 'publishType',
      },
      {
        title: intl.get(`${commonPrompt}.status`).d('状态'),
        dataIndex: 'statusMeaning',
        width: 160,
        align: 'center',
        render: (value, record) =>
          value || interfaceStatus.find(item => item.value === record.status).meaning,
      },
      {
        title: intl.get(`${modelPrompt}.table.column.option`).d('操作'),
        width: 85,
        render: (text, record) => {
          return (
            <a
              className="edit"
              style={{ marginRight: 8 }}
              onClick={this.openInterfaceDrawer.bind(this, record)}
            >
              {intl.get(`${commonPrompt}.button.edit`).d('编辑')}
            </a>
          );
        },
      },
    ];
    const tableProps = {
      dataSource,
      pagination,
      onChange,
      bordered: true,
      rowKey: this.defaultTableRowKey,
      loading: processing.fetchInterfaceList,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowSelection: {
        selectedRowKeys,
        onChange: onRowSelectionChange,
      },
    };
    return (
      <Fragment>
        <div className="action">
          <Button
            icon="plus"
            style={{ marginRight: 8 }}
            onClick={this.openInterfaceDrawer.bind(this, {})}
          >
            {intl.get(`${commonPrompt}.button.add`).d('新建')}
          </Button>
          <Button
            icon="delete"
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleDeleteService.bind(this)}
          >
            {intl.get(`${commonPrompt}.button.delete`).d('删除')}
          </Button>
        </div>
        <br />
        <Table className={styles['bottom-wrapper']} {...tableProps} />
        {/* 新增接口抽屉 */}
        <InterfaceDrawer {...interfaceDrawerProps} />
      </Fragment>
    );
  }
}
