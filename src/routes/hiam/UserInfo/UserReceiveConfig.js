/**
 * UserReceiveConfig - 用户消息接收配置
 * @date: 2018-11-22
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Checkbox, Button, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isArray, indexOf, forEach, isEmpty, remove, findIndex } from 'lodash';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth } from 'utils/utils';

import Main from './components/Main';

import styles from './index.less';

const btnStyle = { marginLeft: 8 };

@connect(({ userReceiveConfig, loading }) => ({
  userReceiveConfig,
  searchLoading: loading.effects['userReceiveConfig/fetchReceiveConfig'],
  saveLoading: loading.effects['userReceiveConfig/saveConfig'],
}))
@formatterCollections({ code: ['hmsg.userReceiveConfig'] })
export default class UserReceiveConfig extends Component {
  form;

  /**
   * state初始化
   * @param {object} props 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      expandedRowKeys: [], // 当前展开的树
      checkedList: [],
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render执行后获取页面数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'userReceiveConfig/fetchMessageType',
    });
  }

  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userReceiveConfig/fetchReceiveConfig',
    }).then(res => {
      if (res) {
        this.builderFlags(res);
      }
    });
  }

  @Bind()
  builderFlags(dataSource = []) {
    const checkedList = [];
    const flatKeys = (item, parentId) => {
      const flagParam = {
        receiveId: item.receiveId,
        receiveTypeList: item.receiveTypeList,
        defaultReceiveTypeList: item.defaultReceiveTypeList,
        receiveCode: item.receiveCode,
        userReceiveId: item.userReceiveId ? item.userReceiveId : null,
        objectVersionNumber: item.objectVersionNumber,
        _token: item._token,
      };
      flagParam.parentId = item.receiveId === parentId ? '' : parentId;
      checkedList.push(flagParam);
      if (isArray(item.children) && !isEmpty(item.children)) {
        forEach(item.children, v => flatKeys(v, item.receiveId));
      }
    };

    forEach(dataSource, item => flatKeys(item, item.receiveId));

    this.setState({ checkedList });
  }

  // 保存
  @Bind(500)
  handleSave() {
    const { dispatch } = this.props;
    const { checkedList } = this.state;
    const paramList = [];
    forEach(checkedList, checkedItem => {
      paramList.push({
        userReceiveId: checkedItem.userReceiveId,
        receiveCode: checkedItem.receiveCode,
        receiveType: checkedItem.receiveTypeList.join(','),
        objectVersionNumber: checkedItem.objectVersionNumber,
        _token: checkedItem._token,
      });
    });
    dispatch({
      type: 'userReceiveConfig/saveConfig',
      payload: paramList,
    }).then(res => {
      if (res) {
        notification.success();
        // this.handleSearch();
        this.builderFlags(res);
      }
    });
  }

  // 取消
  @Bind()
  handleCancel() {
    this.handleSearch();
  }

  /**
   * 树形结构点击展开收起时的回调
   */
  @Bind()
  onExpand(expanded, record) {
    const { receiveId } = record;
    const { expandedRowKeys } = this.state;

    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, receiveId],
      });
    } else {
      const newExpandRowKeys = expandedRowKeys.filter(item => item !== receiveId);
      this.setState({
        expandedRowKeys: newExpandRowKeys,
      });
    }
  }

  @Bind()
  onCheckboxChange(params) {
    const { receiveId, type, flag } = params;
    const { checkedList } = this.state;
    const index = findIndex(checkedList, v => v.receiveId === receiveId);
    const checkItem = checkedList[index];

    const addOrRemove = item => {
      // flag为true，代表当前已经被勾选，需要去除勾选
      if (flag) {
        remove(item.receiveTypeList, v => v === type);
      } else if (
        indexOf(item.receiveTypeList, type) < 0 &&
        indexOf(item.defaultReceiveTypeList, type) > -1
      ) {
        item.receiveTypeList.push(type);
      }
    };
    addOrRemove(checkItem);

    /**
     * 根据父节点，选择所有的子节点
     *
     * @param {*} parentId
     */
    const iterator = parentId => {
      const subList = [];
      forEach(checkedList, v => {
        if (v.parentId === parentId) {
          addOrRemove(v);
          subList.push(v);
        }
      });
      if (subList && subList.length > 0) {
        forEach(subList, v => iterator(v.receiveId));
      }
    };
    iterator(checkItem.receiveId);

    /**
     * 反向勾选，即根据子节点反向勾选父节点
     *
     * @param {*} parentId 父节点的receiveId
     */
    const reverseCheck = parentId => {
      if (!parentId) {
        return;
      }
      const sameParents = checkedList.filter(v => v.parentId === parentId) || [];
      const temp = sameParents.filter(v => {
        if (indexOf(v.defaultReceiveTypeList, type) < 0) {
          return true;
        }
        const idx = indexOf(v.receiveTypeList, type);
        return flag ? idx < 0 : idx > -1;
      });
      if (sameParents.length === temp.length || (sameParents.length !== temp.length && flag)) {
        const parentIndex = findIndex(checkedList, v => v.receiveId === parentId);
        const parent = checkedList[parentIndex];
        addOrRemove(parent);

        reverseCheck(parent.parentId);
      }
    };

    reverseCheck(checkItem.parentId);

    this.setState({ checkedList });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { userReceiveConfig, searchLoading, saveLoading } = this.props;
    const { configList = [], messageTypeList = [] } = userReceiveConfig;
    const { expandedRowKeys = [], checkedList } = this.state;
    const columns = [
      {
        title: intl.get('hmsg.userReceiveConfig.model.userReceiveConfig.messageType').d('消息类型'),
        dataIndex: 'receiveName',
      },
    ];

    forEach(messageTypeList, item => {
      columns.push({
        title: intl
          .get('hmsg.userReceiveConfig.model.userReceiveConfig', {
            typeName: item.meaning,
          })
          .d(`${item.meaning}`),
        dataIndex: item.value,
        width: 150,
        render: (val, record) => {
          let checkboxElement = '';
          const { receiveId } = record;
          if (isArray(checkedList) && !isEmpty(checkedList)) {
            const index = findIndex(checkedList, v => v.receiveId === record.receiveId);
            const flagParam = checkedList[index];
            const { receiveTypeList } = flagParam;
            const flag = indexOf(receiveTypeList, item.value) > -1;
            if (indexOf(record.defaultReceiveTypeList, item.value) > -1) {
              checkboxElement = (
                <Checkbox
                  checked={flag}
                  onChange={() => this.onCheckboxChange({ receiveId, flag, type: item.value })}
                >
                  {intl.get('hzero.common.status.enable').d('启用')}
                </Checkbox>
              );
            }
          }
          return checkboxElement;
        },
      });
    });

    const editTableProps = {
      expandedRowKeys,
      columns,
      scroll: { x: tableScrollWidth(columns) },
      rowKey: 'receiveId',
      pagination: false,
      bordered: true,
      dataSource: configList,
      loading: searchLoading,
      onExpand: this.onExpand,
    };

    return (
      <div className={styles.receive}>
        <Main
          title={intl
            .get('hmsg.userReceiveConfig.view.title.subMain.userReceiveConfig')
            .d('用户消息接收设置')}
        >
          <div className={styles['edit-table']}>
            <Table {...editTableProps} />
          </div>
          <div className={styles['operation-btn']}>
            <Button type="primary" onClick={this.handleSave} loading={saveLoading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button style={btnStyle} onClick={this.handleCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Main>
      </div>
    );
  }
}
