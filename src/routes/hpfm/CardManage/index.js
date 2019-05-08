/**
 * @date 2019-01-23
 * @author WY yang.wang06@hand-china.com
 * @copyright © HAND 2019
 */

import React from 'react';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import uuid from 'uuid/v4'; // 用于生成每次打开分配模态框的key

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { tableScrollWidth, isTenantRoleLevel } from 'utils/utils';

import SearchForm from './SearchForm';
import CardEditModal from './CardEditModal';
import CardTenantEditModal from './CardTenantEditModal';

@connect(({ loading, cardManage }) => {
  return {
    cardManage,
    initLoading: loading.effects['cardManage/init'],
    cardFetchLoading: loading.effects['cardManage/cardFetch'],
    cardCreateLoading: loading.effects['cardManage/cardCreate'],
    cardUpdateLoading: loading.effects['cardManage/cardUpdate'],
    cardTenantFetchLoading: loading.effects['cardManage/cardTenantFetch'],
    cardTenantAddLoading: loading.effects['cardManage/cardTenantAdd'],
    cardTenantRemoveLoading: loading.effects['cardManage/cardTenantRemove'],
  };
})
@formatterCollections({ code: ['hpfm.card'] })
export default class CardManage extends React.Component {
  constructor(props) {
    super(props);

    const {
      cardManage: { dataSource },
    } = props;
    this.refSearchForm = null; // SearchForm 的 this
    this.state = {
      dataSource, // 数据
      prevDataSource: dataSource,
      cardEditModalProps: {
        isEdit: false, // 新增/编辑
        editRecord: {}, // 编辑的数据
        modalProps: { visible: false }, // Modal 的属性
      }, // 卡片编辑模态框的属性
      cardTenantEditModalProps: {
        modalProps: { visible: false },
        // cardId: undefined, // 卡片的id
        // disabled: true, // 卡片默认是禁用的
      },
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevDataSource } = prevState;
    const {
      cardManage: { dataSource },
    } = nextProps;
    if (dataSource && dataSource !== prevDataSource) {
      return {
        dataSource,
        prevDataSource: dataSource,
      };
    }
    return null;
  }

  componentDidMount() {
    this.init();
    this.fetchCards();
  }

  render() {
    const {
      cardManage: {
        fdLevel, // 层级的值集
        catalogType, // 分类的值集
        pagination, // 分页
      },
      initLoading,
      cardFetchLoading,
      cardCreateLoading,
      cardUpdateLoading,
      cardTenantFetchLoading,
      cardTenantAddLoading,
      cardTenantRemoveLoading,
    } = this.props;
    const {
      dataSource, // 数据
      cardEditModalProps, // 传递给 卡片编辑模态框的属性
      cardTenantEditModalProps, // 传递给 卡片分配租户模态框的属性
    } = this.state;
    const tableLoading = initLoading || cardFetchLoading;
    const cardEditModalLoading = cardCreateLoading || cardUpdateLoading;
    const cardTenantEditModalTableLoading = cardTenantFetchLoading;
    const cardTenantEditModalLoading = cardTenantAddLoading || cardTenantRemoveLoading;

    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.card.view.title.list').d('卡片管理')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateBtnClick}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-operator">
            <SearchForm
              onRef={this.handleRefSearchForm}
              onSearch={this.fetchCards}
              fdLevel={fdLevel}
            />
          </div>
          <Table
            bordered
            rowKey="id"
            scroll={{ x: tableScrollWidth }}
            columns={this.columns}
            onChange={this.handleTableChange}
            loading={tableLoading}
            pagination={pagination}
            dataSource={dataSource}
          />
        </Content>
        <CardEditModal
          {...cardEditModalProps}
          confirmLoading={cardEditModalLoading}
          catalogType={catalogType}
          fdLevel={fdLevel}
          onOk={this.handleCardEditModalOk}
          onCancel={this.handleCardEditModalCancel}
        />
        <CardTenantEditModal
          {...cardTenantEditModalProps}
          confirmLoading={cardTenantEditModalLoading}
          onOk={this.handleCardTenantEditModalOk}
          onCancel={this.handleCardTenantEditModalCancel}
          onFetchCardTenants={this.handleFetchCardTends}
          onRemoveCardTenants={this.handleRemoveCardTenants}
          fetchCardTenantsLoading={cardTenantEditModalTableLoading}
        />
      </React.Fragment>
    );
  }

  /**
   * 执行 init 方法, 加载页面只需要加载一次 且必须的数据
   */
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cardManage/init',
    });
  }

  // 查询相关的内容

  @Bind()
  handleRefSearchForm(refSearchForm) {
    this.refSearchForm = refSearchForm;
  }

  @Bind()
  handleSearchBtnClick() {
    this.fetchCards();
  }

  @Bind()
  fetchCards(pagination = {}) {
    const { dispatch } = this.props;
    const params = this.refSearchForm.props.form.getFieldsValue();
    dispatch({
      type: 'cardManage/cardFetch',
      payload: {
        ...params,
        ...pagination,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content,
        });
      }
    });
  }

  @Bind()
  reloadList() {
    const {
      cardManage: { queryPagination },
    } = this.props;
    this.fetchCards(queryPagination);
  }

  // Table 相关的内容

  @Bind()
  handleTableChange(page, filter, sort) {
    this.fetchCards({ page, sort });
  }

  // CardEditModal 相关的内容

  @Bind()
  hiddenCardEditModal() {
    this.setState({
      cardEditModalProps: {
        isEdit: false, // 新增/编辑
        editRecord: {}, // 编辑的数据
        modalProps: { visible: false }, // Modal 的属性
      }, // 编辑模态框的属性
    });
  }

  /**
   * 重新刷新列表 并且关闭CardEditModal
   */
  @Bind()
  reloadAndHiddenCardEditModal() {
    this.hiddenCardEditModal();
    this.reloadList();
  }

  /**
   * 新建新的卡片
   */
  @Bind()
  handleCreateBtnClick() {
    this.setState({
      cardEditModalProps: {
        isEdit: false, // 新增/编辑
        editRecord: {}, // 编辑的数据
        modalProps: { visible: true }, // Modal 的属性
      }, // 编辑模态框的属性
    });
  }

  /**
   * 编辑
   * a 标签的事件 阻止默认事件
   */
  @Bind()
  handleLineEditBtnClick(record, event) {
    event.preventDefault();
    this.setState({
      cardEditModalProps: {
        isEdit: true, // 新增/编辑
        editRecord: record, // 编辑的数据
        modalProps: { visible: true }, // Modal 的属性
      }, // 编辑模态框的属性
    });
  }

  /**
   * 取消编辑 卡片
   */
  @Bind()
  handleCardEditModalCancel() {
    this.hiddenCardEditModal();
  }

  /**
   * 保存编辑的卡片
   */
  @Bind()
  handleCardEditModalOk(formFields) {
    const { dispatch } = this.props;
    const { cardEditModalProps } = this.state;
    if (cardEditModalProps.isEdit) {
      dispatch({
        type: 'cardManage/cardUpdate', // 卡片更新
        payload: {
          ...cardEditModalProps.editRecord,
          ...formFields,
        },
      }).then(res => {
        if (res) {
          notification.success();
          // 成功
          this.reloadAndHiddenCardEditModal();
        }
      });
    } else {
      dispatch({
        type: 'cardManage/cardCreate', // 卡片新建
        payload: formFields,
      }).then(res => {
        if (res) {
          notification.success();
          // 成功
          this.reloadAndHiddenCardEditModal();
        }
      });
    }
  }

  // CardTenantEditModal 相关的内容

  /**
   * 分配卡片
   * a 标签的事件 阻止默认事件
   */
  @Bind()
  handleLineAssignCardBtnClick(record, event) {
    event.preventDefault();
    this.setState({
      cardTenantEditModalProps: {
        disabled: record.enabledFlag === 0,
        key: uuid(),
        modalProps: { visible: true },
        cardId: record.id,
      },
    });
  }

  @Bind()
  hiddenCardTenantEditModalAndReload() {
    this.hiddenCardTenantEditModal();
    this.reloadList();
  }

  @Bind()
  hiddenCardTenantEditModal() {
    const { cardTenantEditModalProps } = this.state;
    this.setState({
      cardTenantEditModalProps: {
        ...cardTenantEditModalProps,
        cardId: undefined, // 去掉 cardId
        disabled: true, // disabled 默认是真
        modalProps: { visible: false }, // 模态框隐藏
      },
    });
  }

  @Bind()
  handleFetchCardTends(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'cardManage/cardTenantFetch',
      payload,
    });
  }

  @Bind()
  handleRemoveCardTenants(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'cardManage/cardTenantRemove',
      payload,
    });
  }

  @Bind()
  handleCardTenantEditModalOk(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'cardManage/cardTenantAdd',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        // 成功 关闭模态框 不需要刷新页面
        this.hiddenCardTenantEditModal();
      }
    });
  }

  @Bind()
  handleCardTenantEditModalCancel() {
    this.hiddenCardTenantEditModal();
  }

  columns = [
    {
      title: intl.get('hpfm.card.model.card.code').d('卡片代码'),
      dataIndex: 'code',
      width: 100,
    },
    {
      title: intl.get('hpfm.card.model.card.name').d('卡片名称'),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: intl.get('hpfm.card.model.card.description').d('卡片描述'),
      dataIndex: 'description',
    },
    {
      title: intl.get('hpfm.card.model.card.catalogType').d('卡片类型'),
      dataIndex: 'catalogMeaning',
      width: 100,
    },
    !isTenantRoleLevel() && {
      title: intl.get('hpfm.card.model.card.fdLevel').d('层级'),
      dataIndex: 'levelMeaning',
      width: 100,
    },
    {
      title: intl.get('hpfm.card.model.card.w').d('宽度'),
      dataIndex: 'w',
      width: 80,
    },
    {
      title: intl.get('hpfm.card.model.card.h').d('高度'),
      dataIndex: 'h',
      width: 80,
    },
    {
      title: intl.get('hzero.common.status').d('状态'),
      dataIndex: 'enabledFlag',
      width: 100,
      render: enableRender,
    },
    {
      title: intl.get('hzero.common.action').d('操作'),
      key: 'action',
      fixed: 'right',
      width: isTenantRoleLevel() ? 100 : 160,
      render: (_, record) => {
        const actions = [
          <a key="edit" onClick={this.handleLineEditBtnClick.bind(undefined, record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>,
        ];
        if (record.level === 'tenant' && !isTenantRoleLevel()) {
          actions.push(
            <a key="assignCard" onClick={this.handleLineAssignCardBtnClick.bind(undefined, record)}>
              {intl.get('hpfm.card.view.button.assignCard').d('分配卡片')}
            </a>
          );
        }
        return <span className="action-link">{actions}</span>;
      },
    },
  ].filter(Boolean);
}
