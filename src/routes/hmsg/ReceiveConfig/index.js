/**
 * ReceiveConfig - 消息接收配置
 * @date: 2018-11-21
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Input, Select, Popconfirm, Button, Tag } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isArray, cloneDeep } from 'lodash';

import { Header, Content } from 'components/Page';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEditTableData, tableScrollWidth } from 'utils/utils';

import styles from './index.less';

@connect(({ receiveConfig, loading }) => ({
  receiveConfig,
  searchLoading: loading.effects['receiveConfig/fetchReceiveConfig'],
  saveLoading: loading.effects['receiveConfig/saveConfig'],
}))
@formatterCollections({ code: ['hmsg.receiveConfig'] })
export default class ReceiveConfig extends Component {
  form;

  /**
   * state初始化
   * @param {object} props 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      expandedRowKeys: [], // 当前展开的树
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
      type: 'receiveConfig/fetchMessageType',
    });
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点添加或替换children属性
   * @param {Array} collections 树形结构树
   * @param {Array} cursorPath 节点路径
   * @param {Array} data  追加或替换的children数据
   * @returns {Array} 新的树形结构
   */
  findAndSetNodeProps(collections, cursorPath = [], data) {
    let newCursorList = cursorPath;
    const cursor = newCursorList[0];
    const tree = collections.map(n => {
      const m = n;
      if (m.receiveId === cursor) {
        if (newCursorList[1]) {
          if (!m.children) {
            m.children = [];
          }
          newCursorList = newCursorList.filter(o => newCursorList.indexOf(o) !== 0);
          m.children = this.findAndSetNodeProps(m.children, newCursorList, data);
        } else {
          m.children = [...data];
        }
        if (m.children.length === 0) {
          const { children, ...others } = m;
          return { ...others };
        } else {
          return m;
        }
      }
      return m;
    });
    return tree;
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点
   * @param {Array} collection 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {String} keyName 主键名称
   * @returns {Object} 节点信息
   */
  findNode(collection, cursorList = [], keyName) {
    let newCursorList = cursorList;
    const cursor = newCursorList[0];
    for (let i = 0; i < collection.length; i++) {
      if (collection[i][keyName] === cursor) {
        if (newCursorList[1]) {
          newCursorList = newCursorList.slice(1);
          return this.findNode(collection[i].children, newCursorList, keyName);
        }
        return collection[i];
      }
    }
  }

  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'receiveConfig/fetchReceiveConfig',
      payload: {},
    });
  }

  // 新增下级配置
  @Bind()
  handleAddLine(record = {}) {
    const {
      receiveConfig: { configList, pathMap = {} },
      dispatch,
    } = this.props;
    const { expandedRowKeys } = this.state;

    if (record.receiveId) {
      const newConfig = {
        receiveId: uuidv4(),
        receiveCode: '',
        receiveName: '',
        // levelNumber: record.levelNumber,
        defaultReceiveType: [],
        parentReceiveId: record.receiveId,
        _status: 'create', // 新增节点的标识
      };
      const newChildren = [newConfig, ...(record.children || [])];
      const newConfigList = this.findAndSetNodeProps(
        configList,
        pathMap[record.receiveId],
        newChildren
      );

      this.setState(
        {
          expandedRowKeys: [...expandedRowKeys, record.receiveId],
        },
        () => {
          dispatch({
            type: 'receiveConfig/updateState',
            payload: { configList: newConfigList },
          });
        }
      );
    } else {
      const newConfig = {
        receiveId: uuidv4(),
        receiveCode: '',
        receiveName: '',
        defaultReceiveType: [],
        parentReceiveId: record.receiveId,
        _status: 'create', // 新增节点的标识
      };
      const newConfigList = [newConfig, ...configList];
      dispatch({
        type: 'receiveConfig/updateState',
        payload: { configList: newConfigList },
      });
    }
  }

  // 保存
  @Bind(500)
  handleSave() {
    const { dispatch, receiveConfig: { configList = [] } = {} } = this.props;
    const params = getEditTableData(configList, ['children', 'receiveId']);

    if (Array.isArray(params) && params.length !== 0) {
      const payloadParams = params.map(item => ({
        ...item,
        defaultReceiveType: isArray(item.defaultReceiveType)
          ? item.defaultReceiveType.join(',')
          : item.defaultReceiveType,
      }));
      dispatch({
        type: 'receiveConfig/saveConfig',
        payload: payloadParams,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  // 取消
  @Bind()
  handleCancel(record) {
    const { receiveId } = record;
    const { receiveConfig: { configList = [], pathMap } = {}, dispatch } = this.props;

    let newConfigList = configList;

    if (record.parentReceiveId) {
      const parentNode = this.findNode(configList, pathMap[record.parentReceiveId], 'receiveId');
      const newChildren = parentNode.children.filter(item => item.receiveId !== receiveId);
      newConfigList = this.findAndSetNodeProps(
        configList,
        pathMap[record.parentReceiveId],
        newChildren
      );
    } else {
      newConfigList = configList.filter(item => item.receiveId !== receiveId);
    }

    dispatch({
      type: 'receiveConfig/updateState',
      payload: { configList: newConfigList },
    });
  }

  // 编辑树结构信息
  @Bind()
  handleEdit(record, flag) {
    const { receiveId } = record;
    const { receiveConfig: { configList = [], pathMap } = {}, dispatch } = this.props;

    let newConfigList = configList;

    if (record.parentReceiveId) {
      const parentNode = this.findNode(configList, pathMap[record.parentReceiveId], 'receiveId');
      const newChildren = cloneDeep(parentNode.children);
      const index = newChildren.findIndex(item => item.receiveId === receiveId);
      if (flag) {
        newChildren.splice(index, 1, {
          ...record,
          _status: 'update',
        });
      } else {
        const { _status, ...other } = record;
        newChildren.splice(index, 1, other);
      }
      newConfigList = this.findAndSetNodeProps(
        configList,
        pathMap[record.parentReceiveId],
        newChildren
      );
    } else {
      const index = newConfigList.findIndex(item => item.receiveId === receiveId);
      if (flag) {
        newConfigList.splice(index, 1, {
          ...configList[index],
          _status: 'update',
        });
      } else {
        const { _status, ...other } = configList[index];
        newConfigList.splice(index, 1, other);
      }
    }

    dispatch({
      type: 'receiveConfig/updateState',
      payload: { configList: newConfigList },
    });
  }

  // 取消新建下级
  @Bind()
  handleCleanLine(record = {}) {
    const {
      dispatch,
      receiveConfig: { renderTree = [], addData = {}, pathMap = {} },
    } = this.props;
    delete addData[record.receiveId];
    let newRenderTree = [];
    if (record.parentReceiveId) {
      // 找到父节点的children, 更新children数组
      const parent = this.findNode(renderTree, pathMap[record.parentReceiveId], 'receiveId');
      const newChildren = parent.children.filter(item => item.receiveId !== record.receiveId);
      newRenderTree = this.findAndSetNodeProps(
        renderTree,
        pathMap[record.parentReceiveId],
        newChildren
      );
    } else {
      newRenderTree = renderTree.filter(item => item.receiveId !== record.receiveId);
    }
    dispatch({
      type: 'receiveConfig/updateState',
      payload: {
        renderTree: newRenderTree,
        addData: {
          ...addData,
        },
      },
    });
  }

  // 删除
  @Bind()
  handleDelete(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'receiveConfig/deleteConfig',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
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

  typeMeaningRender(item) {
    let mean = '';
    switch (item) {
      case '站内消息':
        mean = (
          <Tag color="green" key="1">
            {item}
          </Tag>
        );
        break;
      case '邮件':
        mean = (
          <Tag color="orange" key="2">
            {item}
          </Tag>
        );
        break;
      case '短信':
        mean = (
          <Tag color="blue" key="3">
            {item}
          </Tag>
        );
        break;
      default:
        mean = (
          <Tag color="#dcdcdc" key="4">
            {item}
          </Tag>
        );
        break;
    }
    return mean;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { receiveConfig, searchLoading, saveLoading } = this.props;
    const { configList = [], messageTypeList } = receiveConfig;
    const { expandedRowKeys = [] } = this.state;

    const columns = [
      {
        title: intl.get('hmsg.receiveConfig.model.receiveConfig.receiveCode').d('接收配置编码'),
        dataIndex: 'receiveCode',
        render: (val, record) =>
          record._status === 'create' || record._status === 'update' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('receiveCode', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hmsg.receiveConfig.model.receiveConfig.receiveCode')
                        .d('接收配置编码'),
                    }),
                  },
                ],
              })(
                <Input
                  typeCase="upper"
                  trim
                  inputChinese={false}
                  disabled={record._status === 'update'}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hmsg.receiveConfig.model.receiveConfig.receiveName').d('接收配置名称'),
        dataIndex: 'receiveName',
        width: 150,
        render: (val, record) =>
          record._status === 'create' || record._status === 'update' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('receiveName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hmsg.receiveConfig.model.receiveConfig.receiveName')
                        .d('接收配置名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl
                    .get('hmsg.receiveConfig.model.receiveConfig.receiveName')
                    .d('接收配置名称')}
                  field="receiveName"
                  token={record._token}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get('hmsg.receiveConfig.model.receiveConfig.defaultReceiveType')
          .d('默认接收方式'),
        dataIndex: 'defaultReceiveType',
        width: 270,
        render: (val, record) => {
          if (record._status === 'create' || record._status === 'update') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('defaultReceiveType', {
                  initialValue: isArray(val) ? val : val.split(','),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hmsg.receiveConfig.model.receiveConfig.defaultReceiveType')
                          .d('默认接收方式'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: 250 }} mode="multiple">
                    {messageTypeList.map(item => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            const tagList = record.defaultReceiveTypeMeaning.split(',').sort() || [];
            return tagList.map(item => {
              return this.typeMeaningRender(item);
            });
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        render: (val, record) =>
          record.levelNumber !== 0 ? (
            record._status === 'create' ? (
              <span className="action-link">
                <a style={{ cursor: 'pointer' }} onClick={() => this.handleCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              </span>
            ) : record._status === 'update' ? (
              <span className="action-link">
                <a onClick={() => this.handleEdit(record, false)} style={{ cursor: 'pointer' }}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
                <a onClick={() => this.handleAddLine(record)}>
                  {intl.get('hmsg.receiveConfig.option.createChildren').d('新建下级配置')}
                </a>
                <Popconfirm
                  placement="topRight"
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  onConfirm={() => this.handleDelete(record)}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              </span>
            ) : (
              <span className="action-link">
                <a onClick={() => this.handleEdit(record, true)} style={{ cursor: 'pointer' }}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <a onClick={() => this.handleAddLine(record)}>
                  {intl.get('hmsg.receiveConfig.option.createChildren').d('新建下级配置')}
                </a>
                <Popconfirm
                  placement="topRight"
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  onConfirm={() => this.handleDelete(record)}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              </span>
            )
          ) : (
            <span className="action-link">
              <a onClick={() => this.handleAddLine(record)}>
                {intl.get('hmsg.receiveConfig.option.createChildren').d('新建下级配置')}
              </a>
            </span>
          ),
      },
    ];
    const editTableProps = {
      expandedRowKeys,
      columns,
      scroll: { x: tableScrollWidth(columns) },
      loading: searchLoading,
      rowKey: 'receiveId',
      pagination: false,
      bordered: true,
      dataSource: configList,
      onExpand: this.onExpand,
      indentSize: 24,
      className: styles['hmsg-hr-show'],
    };

    return (
      <Fragment>
        <Header title={intl.get('hmsg.receiveConfig.view.message.title').d('消息接收配置')}>
          <Button icon="save" type="primary" onClick={this.handleSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <EditTable {...editTableProps} />
        </Content>
      </Fragment>
    );
  }
}
