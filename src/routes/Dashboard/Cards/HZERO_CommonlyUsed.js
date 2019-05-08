/**
 * CommonlyUsed -常用功能
 * @date: 2019-02-22
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, Modal, Tree, message, Row, Col, Card } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import styles from './Cards.less';

const promptCode = 'dashboard.cards';
@connect(({ cards, loading }) => ({
  cards,
  loading: loading.effects['cards/queryFunctions'],
  allLoading: loading.effects['cards/queryAllFunctions'],
}))
@formatterCollections({ code: 'dashboard.cards' })
@withRouter
export default class CommonlyUsed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      allCheckedKeys: {},
    };
    this.addFunctionList = [];
    this.allCheckedKeys = {};
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询固定的常用功能
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cards/queryFunctions',
    });
  }

  /**
   * 查询全部常用功能
   */
  @Bind()
  handleAllSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cards/queryAllFunctions',
    });
  }

  /**
   * 通过checkedKey去查找allFunction中对应的数据
   * 然后组成新的数组addFunctionList传给后端
   * @param allFunction 全部的常用功能
   * @param checkedKey  选择的常用功能
   */
  @Bind()
  handleAddList(allFunction, checkedKey) {
    for (let i = 0; i < allFunction.length; i++) {
      if (checkedKey.indexOf(allFunction[i].menuCode) !== -1 && !allFunction[i].children) {
        this.addFunctionList.push({
          tenantId: getCurrentOrganizationId(),
          menuCode: allFunction[i].menuCode,
          orderSeq: allFunction[i].orderSeq,
        });
      } else if (allFunction[i].children) {
        this.handleAddList(allFunction[i].children, checkedKey);
      }
    }
  }

  // 确定添加需要显示的常用功能
  @Bind()
  onOk() {
    const { dispatch, cards: { allFunction = [] } = {} } = this.props;
    const { allCheckedKeys } = this.state;
    const checkedKeys = [];
    this.addFunctionList = [];
    /* eslint-disable */
    for (const i in allCheckedKeys) {
      checkedKeys.push(...allCheckedKeys[i]);
    }
    /* eslint-enable */
    const checkedKey = [];
    for (let i = 0; i < checkedKeys.length; i += 1) {
      if (checkedKey.indexOf(checkedKeys[i]) === -1) {
        checkedKey.push(checkedKeys[i]);
      }
    }
    this.handleAddList(allFunction, checkedKey);
    if (!isEmpty(this.addFunctionList)) {
      if (this.addFunctionList.length > 6) {
        message.warning(
          intl
            .get(`${promptCode}.view.message.confirm.selected.field`)
            .d('选择的常用功能不能超过6个！')
        );
      } else {
        dispatch({
          type: 'cards/addFunctions',
          payload: this.addFunctionList,
        }).then(res => {
          if (res) {
            this.addFunctionList = [];
            this.handleSearch();
            notification.success();
            this.hideModal();
          }
        });
      }
    } else {
      message.warning(
        intl.get(`${promptCode}.view.message.confirm.selected.field`).d('请选择常用功能！')
      );
    }
  }

  // 点击常用功能实现跳转
  @Bind()
  handleJump(menuRoute) {
    const { history } = this.props;
    history.push(`${menuRoute}`);
  }

  @Bind()
  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  @Bind()
  onCheck = index => checkedKeys => {
    const { allCheckedKeys } = this.state;
    allCheckedKeys[index] = checkedKeys;
    this.setState(allCheckedKeys);
  };

  @Bind()
  onSelect(selectedKeys) {
    this.setState({ selectedKeys });
  }

  @Bind()
  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode {...item} />;
    });
  }

  /**
   * 给全部常用功能加key
   */
  @Bind()
  handleAddKey(data) {
    for (let i = 0; i < data.length; i += 1) {
      /* eslint-disable */
      data[i] = { key: data[i].menuCode, ...data[i] };
      /* eslint-enable */
      if (data[i].children) {
        this.handleAddKey(data[i].children);
      }
    }
    return data;
  }

  /**
   * 给allCheckedKeys赋初始值
   */
  @Bind()
  handleCheckedKey(index, data, nowSearchKey) {
    if (data.key === nowSearchKey) {
      this.allCheckedKeys[index] = [];
      this.allCheckedKeys[index].push(nowSearchKey);
      this.setState({
        allCheckedKeys: this.allCheckedKeys,
      });
      return true;
    }
    if (data.children) {
      this.handleCheckedList(index, data.children, nowSearchKey);
    }
  }

  @Bind()
  handleCheckedList(index, data, nowSearchKey) {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].key === nowSearchKey) {
        if (!this.allCheckedKeys[index]) {
          this.allCheckedKeys[index] = [];
        }
        this.allCheckedKeys[index].push(nowSearchKey);
        this.setState({
          allCheckedKeys: this.allCheckedKeys,
        });
        return true;
      } else if (data[i].children) {
        return this.handleCheckedList(index, data[i].children, nowSearchKey);
      }
    }
  }

  // 打开Modal框
  @Bind()
  openModal() {
    this.handleAllSearch();
    this.setState({
      drawerVisible: true,
    });
  }

  // 关闭Modal框
  @Bind()
  hideModal() {
    this.setState({
      allCheckedKeys: {},
      drawerVisible: false,
    });
  }

  /**
   * 只有请求model数据成功后才给allCheckedKeys重新赋初始值
   */
  handleIsListLoad() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cards/updateState',
      payload: {
        isListLoad: true,
      },
    });
  }

  render() {
    const { drawerVisible, allCheckedKeys } = this.state;
    const {
      cards: { functions = [], allFunction = [], checkedKeys = [], isListLoad } = {},
      allLoading,
    } = this.props;
    let allList = [];
    if (!isEmpty(allFunction)) {
      allList = this.handleAddKey(allFunction);
      if (!isListLoad) {
        for (let i = 0; i < checkedKeys.length; i += 1) {
          for (let j = 0; j < allList.length; j += 1) {
            this.handleCheckedKey(j, allList[j], checkedKeys[i]);
          }
        }
        this.handleIsListLoad();
      }
    }
    return (
      <Row>
        <Row className={styles.commonlyUsed}>
          <Col span={12} className={styles['card-title']}>
            常用功能
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <span className={styles['set-up']} onClick={this.openModal}>
              设置
            </span>
          </Col>
          <Col>
            {functions &&
              functions.map(item => (
                <Button
                  key={`commonly-item-${item.menuCode}`}
                  className={styles['content-button']}
                  onClick={() => this.handleJump(item.menuRoute)}
                >
                  {item.title}
                </Button>
              ))}
          </Col>
        </Row>
        <Modal
          title={intl.get('hzero.common.button.operating').d('固定至常用功能')}
          visible={drawerVisible}
          onOk={this.onOk}
          onCancel={this.hideModal}
          width="900px"
          height="400px"
        >
          <Row>
            {allLoading === true ? (
              <Card loading bordered={false} />
            ) : (
              allList.map((item, index) => (
                <Col span={8} key={item.menuCode}>
                  <Tree
                    checkable
                    onExpand={this.onExpand}
                    expandedKeys={this.state.expandedKeys}
                    autoExpandParent={this.state.autoExpandParent}
                    onCheck={this.onCheck(index)}
                    checkedKeys={allCheckedKeys[index]}
                    onSelect={this.onSelect}
                    selectedKeys={this.state.selectedKeys}
                  >
                    {this.renderTreeNodes([item])}
                  </Tree>
                </Col>
              ))
            )}
          </Row>
        </Modal>
      </Row>
    );
  }
}
