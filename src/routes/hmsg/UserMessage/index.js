/**
 * userMessage 站内消息汇总
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Table, Radio, Badge, Button } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

const promptCode = 'hmsg.userMessage';
/**
 * 站内消息
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} userMessage - 数据源
 * @reactProps {loading} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ userMessage, loading }) => ({
  userMessage,
  loading: loading.effects['userMessage/queryMessage'],
  deleting: loading.effects['userMessage/deleteMessage'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: 'hmsg.userMessage' })
@CacheComponent({ cacheKey: '/hmsg/userMessage' })
export default class UserMessage extends PureComponent {
  state = {
    selectedRows: [],
    value: 'all',
  };

  componentDidMount() {
    this.handleSearchMessage();
  }

  /**
   * 按条件查询
   */
  @Bind()
  handleSearchMessage(payload) {
    const {
      dispatch,
      organizationId,
      userMessage: { pagination },
    } = this.props;
    const { value } = this.state;
    const readFlag = value === 'all' ? undefined : value;
    dispatch({
      type: 'userMessage/queryMessage',
      payload: {
        organizationId,
        readFlag,
        page: isEmpty(payload) ? pagination : payload,
      },
    });
  }

  /**
   * 按照条件查询消息
   * @param {*} e
   */
  @Bind()
  handleType(e) {
    // 未读 0 已读 1
    const { value } = e.target;
    this.setState({ value, selectedRows: [] }, () => {
      this.handleSearchMessage();
    });
  }

  /**
   * 跳转到详情界面
   * @param {*} messageId
   */
  @Bind()
  handleDetails(messageId) {
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/hmsg/user-message/detail/${messageId}`));
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
   * 标记已读
   * @param {*} number
   */
  @Bind()
  handleRead(number) {
    const { dispatch, organizationId } = this.props;
    const { selectedRows } = this.state;
    const messageId = selectedRows.map(item => {
      return item.messageId;
    });
    const messageIdList =
      messageId.length > 0 ? messageId.join(',') : messageId.length !== 0 ? messageId[0] : [];
    const payload = number
      ? {
          readAll: 1,
          organizationId,
        }
      : {
          messageIdList,
          organizationId,
        };
    dispatch({
      type: 'userMessage/changeRead',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchMessage();
      }
    });
  }

  /**
   * 删除消息
   */
  @Bind()
  hanleDelete() {
    const { dispatch, organizationId } = this.props;
    const { selectedRows } = this.state;
    const messageId = selectedRows.map(item => {
      return item.messageId;
    });
    const messageIdList =
      messageId.length > 0 ? messageId.join(',') : messageId.length !== 0 ? messageId[0] : [];
    dispatch({
      type: 'userMessage/deleteMessage',
      payload: { messageIdList, organizationId },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchMessage();
      }
    });
    // } else {
    //   notification.warning({
    //     message: intl.get(`${promptCode}.view.message.handleDelete`).d('请勾选您要删除的数据'),
    //   });
    // }
  }

  /**
   * 处理站内消息类型
   */
  @Bind()
  typeCodeRender(record = {}) {
    const { messageCategoryMeaning, messageSubcategoryMeaning } = record;
    const array = [messageCategoryMeaning, messageSubcategoryMeaning].filter(o => o);
    if (record.readFlag === 0) {
      return array.join('-');
    } else {
      return <span style={{ color: '#999' }}>{array.join('-')}</span>;
    }
  }

  renderRadio() {
    const { value } = this.state;
    return (
      <Radio.Group buttonStyle="solid" onChange={this.handleType}>
        <Radio.Button value="all" checked={value === 'all'}>
          {intl.get(`${promptCode}.view.option.allMessage`).d('全部消息')}
        </Radio.Button>
        <Radio.Button value="0" checked={value === '0'}>
          {intl.get(`${promptCode}.view.option.unReadMessage`).d('未读消息')}
        </Radio.Button>
        <Radio.Button value="1" checked={value === '1'}>
          {intl.get(`${promptCode}.view.option.readMessage`).d('已读消息')}
        </Radio.Button>
      </Radio.Group>
    );
  }

  render() {
    const {
      userMessage: { messageData = {}, pagination },
      loading,
      deleting,
    } = this.props;
    const { content = [] } = messageData;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.userMessage.subject`).d('标题内容'),
        dataIndex: 'subject',
        render: (text, record) => {
          if (record.readFlag === 0) {
            return (
              <span>
                <Badge status="processing" />
                {text}
              </span>
            );
          } else {
            return (
              <span style={{ color: '#999' }}>
                <Badge status="default" />
                {text}
              </span>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.userMessage.creationDate`).d('提交时间'),
        width: 200,
        dataIndex: 'creationDate',
        render: (text, record) => {
          if (record.readFlag === 0) {
            return text;
          } else {
            return <span style={{ color: '#999' }}>{text}</span>;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.userMessage.messageTypeCode`).d('类型'),
        width: 200,
        dataIndex: 'messageTypeCode',
        render: (text, record) => this.typeCodeRender(record),
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.messageId),
      onChange: this.onSelectChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title`).d('站内消息')}>
          <Button
            type="primary"
            icon="delete"
            disabled={isEmpty(selectedRows)}
            loading={deleting}
            onClick={this.hanleDelete}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            icon="mail"
            disabled={isEmpty(selectedRows)}
            onClick={() => {
              this.handleRead();
            }}
          >
            {intl.get(`${promptCode}.view.option.signRead`).d('标记已读')}
          </Button>
          <Button
            icon="mail"
            onClick={() => {
              this.handleRead(1);
            }}
          >
            {intl.get(`${promptCode}.view.option.allRead`).d('全部已读')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderRadio()}</div>
          <Table
            bordered
            rowKey="messageId"
            style={{ cursor: 'pointer' }}
            loading={loading}
            onRow={record => {
              return {
                onClick: () => {
                  this.handleDetails(record.messageId);
                },
              };
            }}
            rowSelection={rowSelection}
            dataSource={content}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handleSearchMessage}
          />
        </Content>
      </React.Fragment>
    );
  }
}
